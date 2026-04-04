const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require("../../config/config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout a user")
        .addUserOption(opt => opt.setName("user").setRequired(true))
        .addIntegerOption(opt =>
            opt.setName("minutes").setDescription("Duration in minutes").setRequired(true)
        )
        .addStringOption(opt => opt.setName("reason"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const minutes = interaction.options.getInteger("minutes");
        const reason = interaction.options.getString("reason") || "No reason";

        const member = await interaction.guild.members.fetch(user.id);

        await member.timeout(minutes * 60 * 1000, reason);

        const embed = new EmbedBuilder()
            .setTitle("⏱️ User Timed Out")
            .addFields(
                { name: "User", value: user.tag },
                { name: "Duration", value: `${minutes} minutes` },
                { name: "Moderator", value: interaction.user.tag },
                { name: "Reason", value: reason }
            )
            .setColor("Yellow")
            .setTimestamp();

        interaction.reply({ embeds: [embed] });

        const logChannel = interaction.guild.channels.cache.get(config.logsChannel);
        if (logChannel) logChannel.send({ embeds: [embed] });
    }
};
