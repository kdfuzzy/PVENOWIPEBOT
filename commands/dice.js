const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, removeBalance, addWin, addLoss, formatSol } = require('../utils/economy');
const { isLucky } = require('../utils/fuzzy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Play dice')
        .addNumberOption(opt =>
            opt.setName('amount')
                .setDescription('Amount to bet') // ✅ FIXED
                .setRequired(true)
        ),

    async execute(interaction) {

        const user = interaction.user;
        const amount = interaction.options.getNumber('amount');

        if (amount <= 0) {
            return interaction.reply({ content: '❌ Invalid amount.', ephemeral: true });
        }

        const balance = getBalance(user.id);
        if (balance < amount) {
            return interaction.reply({
                content: `❌ You only have ${formatSol(balance)}`,
                ephemeral: true
            });
        }

        await interaction.deferReply();

        const embed = new EmbedBuilder()
            .setTitle('🎲 Rolling Dice...')
            .setColor(0xFFFF00);

        for (let i = 0; i < 5; i++) {
            embed.setDescription(`🎲 ${Math.ceil(Math.random()*6)} vs 🎲 ${Math.ceil(Math.random()*6)}`);
            await interaction.editReply({ embeds: [embed] });
            await new Promise(r => setTimeout(r, 200));
        }

        let userRoll = Math.ceil(Math.random() * 6);
        let botRoll = Math.ceil(Math.random() * 6);

        if (isLucky(user.id)) {
            userRoll = 6;
            botRoll = 1;
        }

        let result;
        let color;

        if (userRoll > botRoll) {
            addBalance(user.id, amount);
            addWin(user.id);
            result = `🏆 You win! +${formatSol(amount)}`;
            color = 0x00FF00;
        } else if (botRoll > userRoll) {
            removeBalance(user.id, amount);
            addLoss(user.id);
            result = `💀 You lost -${formatSol(amount)}`;
            color = 0xFF0000;
        } else {
            result = `🤝 Tie`;
            color = 0x5865F2;
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('🎲 Result')
                    .setDescription(`You: ${userRoll}\nBot: ${botRoll}\n\n${result}`)
                    .setColor(color)
            ]
        });
    }
};
