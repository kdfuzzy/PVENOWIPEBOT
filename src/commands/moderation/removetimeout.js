const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config/config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removetimeout")
        .setDescription("Remove timeout")
        .addUserOption(opt => opt.setName("user").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const member = await interaction.guild.members.fetch(user.id);

        await member.timeout(null);

        const embed = new EmbedBuilder()
            .setTitle("✅ Timeout Removed")
            .addFields(
                { name: "User", value: user.tag },
                { name: "Moderator", value: interaction.user.tag }
            )
            .setColor("Green")
            .setTimestamp();

        interaction.reply({ embeds: [embed] });

        const logChannel = interaction.guild.channels.cache.get(config.logsChannel);
        if (logChannel) logChannel.send({ embeds: [embed] });
    }
};
