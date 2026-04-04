const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

// In-memory warn storage (shared with other commands)
const warns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to warn")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for warning")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    warns, // ✅ export warns properly

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        if (user.id === interaction.user.id) {
            return interaction.editReply("❌ You can't warn yourself.");
        }

        // Create warn list if not exists
        if (!warns.has(user.id)) {
            warns.set(user.id, []);
        }

        // Add warn
        warns.get(user.id).push({
            reason,
            moderator: interaction.user.tag,
            date: new Date().toLocaleString()
        });

        const userWarns = warns.get(user.id);

        const embed = new EmbedBuilder()
            .setTitle("⚠️ User Warned")
            .setColor("Yellow")
            .addFields(
                { name: "User", value: user.tag, inline: true },
                { name: "Moderator", value: interaction.user.tag, inline: true },
                { name: "Reason", value: reason },
                { name: "Total Warns", value: `${userWarns.length}`, inline: true }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // 🔥 SEND TO YOUR LOG CHANNEL
        const logChannel = interaction.guild.channels.cache.get("1490123710760353822");
        if (logChannel) {
            logChannel.send({ embeds: [embed] }).catch(() => {});
        }
    }
};
