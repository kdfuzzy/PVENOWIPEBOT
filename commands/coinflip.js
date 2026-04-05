const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

const { getBalance, removeBalance, addBalance } = require('../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Challenge someone to a coinflip')
        .addUserOption(opt =>
            opt.setName('opponent').setDescription('Opponent').setRequired(true))
        .addIntegerOption(opt =>
            opt.setName('amount').setDescription('Bet amount').setRequired(true)),

    async execute(interaction) {
        const opponent = interaction.options.getUser('opponent');
        const amount = interaction.options.getInteger('amount');
        const user = interaction.user;

        if (opponent.bot) {
            return interaction.reply({ content: '❌ You cannot challenge bots.', ephemeral: true });
        }

        if (opponent.id === user.id) {
            return interaction.reply({ content: '❌ You cannot challenge yourself.', ephemeral: true });
        }

        if (amount <= 0) {
            return interaction.reply({ content: '❌ Invalid amount.', ephemeral: true });
        }

        const userBal = getBalance(user.id);
        const oppBal = getBalance(opponent.id);

        if (userBal < amount) {
            return interaction.reply({ content: '❌ You don’t have enough money.', ephemeral: true });
        }

        if (oppBal < amount) {
            return interaction.reply({ content: '❌ Opponent doesn’t have enough money.', ephemeral: true });
        }

        // 🎮 BUTTONS
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`accept_${user.id}_${opponent.id}_${amount}`)
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(`decline_${user.id}_${opponent.id}`)
                .setLabel('Decline')
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            content: `🪙 ${opponent}, you’ve been challenged by ${user} for **${amount}**!`,
            components: [row]
        });
    }
};
