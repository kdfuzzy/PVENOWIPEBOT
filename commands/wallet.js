const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getWallet } = require("../utils/walletStore");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("wallet")
        .setDescription("View a user's wallet info")
        .addUserOption(option =>
            option.setName("user")
                  .setDescription("User to view wallet")
                  .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;
        const wallet = getWallet(user.id);

        if (!wallet) {
            return interaction.reply({ content: `❌ ${user.username} has not linked a wallet.`, ephemeral: false });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Wallet`)
            .setDescription(`Address: \`${wallet.address}\`\nVerified: ${wallet.verified ? "✅ Yes" : "❌ No"}`)
            .setColor(wallet.verified ? "Green" : "Yellow")
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};
