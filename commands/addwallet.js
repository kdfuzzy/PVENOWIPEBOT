const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { createChallenge } = require("../utils/walletStore");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addwallet")
        .setDescription("Link your Phantom wallet")
        .addStringOption(option =>
            option.setName("address")
                  .setDescription("Your Solana wallet address")
                  .setRequired(true)
        ),

    async execute(interaction) {
        const address = interaction.options.getString("address");
        const challenge = createChallenge(interaction.user.id, address);

        const embed = new EmbedBuilder()
            .setTitle("🔗 Wallet Linking")
            .setDescription(
                `Wallet: \`${address}\`\n` +
                `Sign this message in Phantom to verify:\n\`${challenge}\``
            )
            .setColor("Yellow")
            .setFooter({ text: "After signing, run /verifywallet <signature>" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
