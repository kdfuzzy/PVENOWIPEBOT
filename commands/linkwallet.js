const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const web3 = require("@solana/web3.js");

// Temporary storage (replace with DB later)
const wallets = new Map();

module.exports = {
    wallets,

    data: new SlashCommandBuilder()
        .setName("linkwallet")
        .setDescription("Link your Solana wallet")
        .addStringOption(option =>
            option.setName("address")
                .setDescription("Your Solana wallet address")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const address = interaction.options.getString("address");

        // ✅ Validate Solana address
        let publicKey;
        try {
            publicKey = new web3.PublicKey(address);
        } catch {
            return interaction.editReply("❌ Invalid Solana wallet address.");
        }

        // Save wallet
        wallets.set(interaction.user.id, address);

        const embed = new EmbedBuilder()
            .setTitle("🔗 Wallet Linked")
            .setColor("Green")
            .addFields(
                { name: "User", value: interaction.user.tag, inline: true },
                { name: "Wallet", value: `\`${address}\`` }
            )
            .setFooter({ text: "⚠️ Wallet ownership not verified yet" })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
