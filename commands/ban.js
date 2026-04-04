const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a member")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to ban")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for ban")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.editReply("❌ User not found.");
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply("❌ I don't have permission to ban.");
        }

        if (user.id === interaction.user.id) {
            return interaction.editReply("❌ You can't ban yourself.");
        }

        try {
            await member.ban({ reason });

            const embed = new EmbedBuilder()
                .setTitle("🔨 User Banned")
                .setColor("Red")
                .addFields(
                    { name: "User", value: user.tag, inline: true },
                    { name: "Moderator", value: interaction.user.tag, inline: true },
                    { name: "Reason", value: reason }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Logs
            const logChannel = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
            if (logChannel) {
                logChannel.send({ embeds: [embed] }).catch(() => {});
            }

        } catch (err) {
            console.error(err);
            await interaction.editReply("❌ Failed to ban user.");
        }
    }
};
