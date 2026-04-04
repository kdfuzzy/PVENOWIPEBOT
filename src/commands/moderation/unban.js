const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config/config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user")
        .addStringOption(opt =>
            opt.setName("userid").setDescription("User ID").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const id = interaction.options.getString("userid");

        await interaction.guild.members.unban(id);

        const embed = new EmbedBuilder()
            .setTitle("🔓 User Unbanned")
            .addFields(
                { name: "User ID", value: id },
                { name: "Moderator", value: interaction.user.tag }
            )
            .setColor("Green")
            .setTimestamp();

        interaction.reply({ embeds: [embed] });

        const logChannel = interaction.guild.channels.cache.get(config.logsChannel);
        if (logChannel) logChannel.send({ embeds: [embed] });
    }
};
