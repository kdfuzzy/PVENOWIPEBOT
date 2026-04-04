const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a member")
        .addUserOption(option =>
            option.setName("user")
                  .setDescription("User to ban")
                  .setRequired(true))
        .addStringOption(option =>
            option.setName("reason")
                  .setDescription("Reason for ban")
                  .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) return interaction.reply({ content: "User not found.", ephemeral: true });

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

            await interaction.reply({ embeds: [embed] });

            // Optional logging channel
            const logChannel = interaction.guild.channels.cache.get("1489787500632211547");
            if (logChannel) logChannel.send({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: "❌ Could not ban this user.", ephemeral: true });
        }
    }
};
