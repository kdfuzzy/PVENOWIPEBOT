const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the server")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to kick")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for kick")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.editReply("❌ User not found.");
        }

        if (user.id === interaction.user.id) {
            return interaction.editReply("❌ You can't kick yourself.");
        }

        if (!member.kickable) {
            return interaction.editReply("❌ I can't kick this user (role hierarchy issue).");
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.editReply("❌ I don't have permission to kick users.");
        }

        try {
            // DM user before kick (optional)
            await user.send(`You have been kicked from **${interaction.guild.name}**.\nReason: ${reason}`).catch(() => {});

            await member.kick(reason);

            const embed = new EmbedBuilder()
                .setTitle("👢 User Kicked")
                .setColor("Red")
                .addFields(
                    { name: "User", value: user.tag, inline: true },
                    { name: "Moderator", value: interaction.user.tag, inline: true },
                    { name: "Reason", value: reason }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Log
            const logChannel = interaction.guild.channels.cache.get("1490123710760353822");
            if (logChannel) {
                logChannel.send({ embeds: [embed] }).catch(() => {});
            }

        } catch (err) {
            console.error(err);
            await interaction.editReply("❌ Failed to kick user.");
        }
    }
};
