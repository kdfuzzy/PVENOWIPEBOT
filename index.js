const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, removeBalance, addWin, addLoss, formatSol } = require('../utils/economy');
const { isLucky } = require('../utils/fuzzy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Play dice')
        .addNumberOption(opt =>
            opt.setName('amount').setDescription('Bet amount').setRequired(true)),

    async execute(interaction) {

        const user = interaction.user;
        const amount = interaction.options.getNumber('amount');

        if (amount <= 0) return interaction.reply({ content: '❌ Invalid amount.', ephemeral: true });

        const balance = getBalance(user.id);
        if (balance < amount) {
            return interaction.reply({ content: `❌ You only have ${formatSol(balance)}`, ephemeral: true });
        }

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle('🎲 Rolling...')
                .setDescription(`Bet: ${formatSol(amount)}`)
                .setColor(0xFFFF00)]
        });

        await new Promise(r => setTimeout(r, 1500));

        let userRoll = Math.floor(Math.random() * 6) + 1;
        let botRoll = Math.floor(Math.random() * 6) + 1;

        // 🧠 FUZZY FORCE WIN
        if (isLucky(user.id)) {
            userRoll = 6;
            botRoll = 1;
        }

        let result, color;

        if (userRoll > botRoll) {
            addBalance(user.id, amount);
            addWin(user.id);
            result = `🏆 You win!\n+${formatSol(amount)}`;
            color = 0x00FF00;
        } else if (botRoll > userRoll) {
            removeBalance(user.id, amount);
            addLoss(user.id);
            result = `💀 You lost!\n-${formatSol(amount)}`;
            color = 0xFF0000;
        } else {
            result = `🤝 Tie!`;
            color = 0x5865F2;
        }

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setTitle('🎲 Result')
                .addFields(
                    { name: 'You', value: `🎲 ${userRoll}`, inline: true },
                    { name: 'Bot', value: `🎲 ${botRoll}`, inline: true }
                )
                .setDescription(result)
                .setColor(color)]
        });
    }
};
