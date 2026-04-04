const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removetimeout")
        .setDescription("Remove a user's timeout")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to remove timeout from")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.editReply("❌ User not found.");
        }

        try {
            await member.timeout(null); // remove timeout

            const embed = new EmbedBuilder()
                .setTitle("✅ Timeout Removed")
                .setColor("Green")
                .addFields(
                    { name: "User", value: user.tag, inline: true },
                    { name: "Moderator", value: interaction.user.tag, inline: true }
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
            await interaction.editReply("❌ Failed to remove timeout.");
        }
    }
};
