const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const web3 = require("@solana/web3.js");

// shared storage
const wallets = new Map();

module.exports = {
    wallets,

    data: new SlashCommandBuilder()
        .setName("addwallet")
        .setDescription("Link or update your Solana wallet")
        .addStringOption(option =>
            option.setName("address")
                .setDescription("Your Solana wallet address")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const address = interaction.options.getString("address");

        // ✅ Validate Solana address
        try {
            new web3.PublicKey(address);
        } catch {
            return interaction.editReply("❌ Invalid Solana wallet address.");
        }

        const alreadyHad = wallets.has(interaction.user.id);

        // Save/update wallet
        wallets.set(interaction.user.id, address);

        const embed = new EmbedBuilder()
            .setTitle(alreadyHad ? "🔄 Wallet Updated" : "🔗 Wallet Linked")
            .setColor("Green")
            .addFields(
                { name: "User", value: interaction.user.tag, inline: true },
                { name: "Wallet", value: `\`${address}\`` }
            )
            .setFooter({ text: "⚠️ Ownership not verified yet" })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
