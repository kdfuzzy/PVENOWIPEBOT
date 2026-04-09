const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, removeBalance, addWin, addLoss, formatSol } = require('../utils/economy');
const { isLucky } = require('../utils/fuzzy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limbo')
        .setDescription('Play limbo')
        .addNumberOption(opt => opt.setName('amount').setRequired(true))
        .addNumberOption(opt => opt.setName('multiplier').setRequired(true)),

    async execute(interaction) {

        const user = interaction.user;
        const amount = interaction.options.getNumber('amount');
        const target = interaction.options.getNumber('multiplier');

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

        // ✅ CRITICAL: respond instantly
        await interaction.deferReply();

        let crashPoint = Math.max(1.01, (1 / Math.random()));

        // 🧠 FUZZY
        if (isLucky(user.id)) {
            crashPoint = target + 1;
        }

        let current = 1.00;
        let growth = 1.07;

        const embed = new EmbedBuilder()
            .setTitle('🚀 Limbo')
            .setColor(0xFFFF00);

        // ⚠️ LIMIT updates (THIS FIXES EVERYTHING)
        const maxSteps = 25;

        for (let i = 0; i < maxSteps; i++) {

            current *= growth;
            current = parseFloat(current.toFixed(2));

            embed.setDescription(
                `Bet: ${formatSol(amount)}\n` +
                `Target: **${target}x**\n\n` +
                `📈 Multiplier: **${current}x**`
            );

            await interaction.editReply({ embeds: [embed] });

            growth += 0.01;

            await new Promise(r => setTimeout(r, 100));

            if (current >= crashPoint || current >= target) break;
        }

        // 🎯 RESULT
        let resultText;
        let color;

        if (crashPoint >= target) {

            const winnings = amount * target;

            addBalance(user.id, winnings);
            addWin(user.id);

            resultText =
                `🎉 WIN!\n\n` +
                `Final: **${crashPoint.toFixed(2)}x**\n` +
                `💰 Won: ${formatSol(winnings)}`;

            color = 0x00FF00;

        } else {

            removeBalance(user.id, amount);
            addLoss(user.id);

            resultText =
                `💀 LOST!\n\n` +
                `Crashed at: **${crashPoint.toFixed(2)}x**\n` +
                `💸 Lost: ${formatSol(amount)}`;

            color = 0xFF0000;
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('🚀 Limbo Result')
                    .setDescription(resultText)
                    .setColor(color)
            ]
        });
    }
};
