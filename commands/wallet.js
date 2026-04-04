const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { wallets } = require("../utils/walletStore");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("wallet")
        .setDescription("View your linked wallet"),

    async execute(interaction) {
        const data = wallets.get(interaction.user.id);

        if (!data) {
            return interaction.reply({ content: "❌ You have not linked a wallet yet.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("💼 Your Wallet")
            .setColor(data.verified ? "Green" : "Yellow")
            .addFields(
                { name: "Address", value: `\`${data.address}\`` },
                { name: "Verified", value: data.verified ? "✅ Yes" : "❌ No" }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
