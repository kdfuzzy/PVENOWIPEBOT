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
                  .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        // Check if bot has ban permissions
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply("❌ I don't have permission to ban members.");
        }

        // Prevent banning self
        if (user.id === interaction.user.id) {
            return interaction.editReply("❌ You cannot ban yourself.");
        }

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) return interaction.editReply("❌ User not found.");

        try {
            await member.ban({ reason });

            const embed = new EmbedBuilder()
                .setTitle("User Banned")
                .setColor("Red")
                .addFields(
                    { name: "User", value: `${user.tag}`, inline: true },
                    { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
                    { name: "Reason", value: reason }
                )
                .setTimestamp();

            // Reply to command
            await interaction.editReply({ embeds: [embed] });

            // Send to log channel (set in Railway env variables)
            const logChannelId = process.env.LOG_CHANNEL_ID || "1489787500632211547";
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel?.isTextBased()) {
                await logChannel.send({ embeds: [embed] }).catch(console.error);
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err.code === 50013 
                ? "❌ I lack permissions to ban this user." 
                : "❌ Could not ban this user.";
            await interaction.editReply({ content: errorMessage });
        }
    }
};
