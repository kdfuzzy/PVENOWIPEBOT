const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "ban",
    description: "Ban a user from the server",

    async execute(interaction) {

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        // ❌ Permission check
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({
                content: "❌ You don't have permission to ban members.",
                ephemeral: true
            });
        }

        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({
                content: "❌ User not found in this server.",
                ephemeral: true
            });
        }

        // ❌ Prevent banning yourself
        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ You cannot ban yourself.",
                ephemeral: true
            });
        }

        // ❌ Check role hierarchy
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({
                content: "❌ You cannot ban someone with equal or higher role.",
                ephemeral: true
            });
        }

        try {
            await member.ban({ reason });

            await interaction.reply({
                content: `🔨 ${user.tag} has been banned.\nReason: ${reason}`
            });

        } catch (err) {
            console.error(err);
            interaction.reply({
                content: "❌ Failed to ban user.",
                ephemeral: true
            });
        }
    }
};
