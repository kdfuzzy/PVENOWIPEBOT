const { 
    SlashCommandBuilder, 
    PermissionFlagsBits 
} = require("discord.js");

const config = require("../../config/config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user")
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

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: "❌ User not found.", ephemeral: true });
        }

        if (user.id === interaction.user.id) {
            return interaction.reply({ content: "❌ You cannot ban yourself.", ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: "❌ Cannot ban this user.", ephemeral: true });
        }

        try {
            await member.ban({ reason });

            await interaction.reply({
                content: `🔨 Banned **${user.tag}**\nReason: ${reason}`
            });

            // 📄 LOG SYSTEM
            const logChannel = interaction.guild.channels.cache.get(config.logsChannel);

            if (logChannel) {
                logChannel.send({
                    content: `🔨 **Ban Log**
User: ${user.tag}
By: ${interaction.user.tag}
Reason: ${reason}`
                });
            }

        } catch (err) {
            console.error(err);
            interaction.reply({
                content: "❌ Failed to ban user.",
                ephemeral: true
            });
        }
    }
};
