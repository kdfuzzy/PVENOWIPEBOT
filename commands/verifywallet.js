const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { verifySignature, markVerified, getWallet } = require("../utils/walletStore");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("verifywallet")
        .setDescription("Verify your linked Phantom wallet")
        .addStringOption(option =>
            option.setName("signature")
                  .setDescription("Signature from Phantom")
                  .setRequired(true)
        ),

    async execute(interaction) {
        const signature = interaction.options.getString("signature");
        const wallet = getWallet(interaction.user.id);

        if (!wallet) {
            return interaction.reply({ content: "❌ No wallet linked. Use /addwallet first.", ephemeral: true });
        }

        const valid = verifySignature(interaction.user.id, signature);
        if (!valid) {
            return interaction.reply({ content: "❌ Invalid signature. Try again.", ephemeral: true });
        }

        markVerified(interaction.user.id);

        const embed = new EmbedBuilder()
            .setTitle("✅ Wallet Verified")
            .setDescription(`Your Phantom wallet \`${wallet.address}\` is now verified!`)
            .setColor("Green")
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};
