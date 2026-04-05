const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { setWallet } = require('../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connectwallet')
        .setDescription('Link your crypto wallet')
        .addStringOption(opt =>
            opt.setName('address')
                .setDescription('Your wallet address')
                .setRequired(true)
        ),

    async execute(interaction) {
        const address = interaction.options.getString('address');

        // basic validation (Solana style length)
        if (address.length < 30 || address.length > 60) {
            return interaction.reply({
                content: '❌ Invalid wallet address.',
                ephemeral: true
            });
        }

        setWallet(interaction.user.id, address);

        const embed = new EmbedBuilder()
            .setTitle('🔗 Wallet Connected')
            .setDescription(`Your wallet has been linked:\n\`${address}\``)
            .setColor('Green');

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
