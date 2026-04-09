const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, removeBalance, addWin, addLoss, formatSol } = require('../utils/economy');
const { isLucky } = require('../utils/fuzzy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limbo')
        .setDescription('Play limbo')
        .addNumberOption(opt =>
            opt.setName('amount').setDescription('Bet amount').setRequired(true))
        .addNumberOption(opt =>
            opt.setName('multiplier').setDescription('Target multiplier').setRequired(true)),

    async execute(interaction) {

        const user = interaction.user;
        const amount = interaction.options.getNumber('amount');
        const target = interaction.options.getNumber('multiplier');

        if (amount <= 0) {
            return interaction.reply({ content: '❌ Invalid amount.', ephemeral: true });
        }

        if (target < 1.01) {
            return interaction.reply({ content: '❌ Minimum multiplier is 1.01x', ephemeral: true });
        }

        const balance = getBalance(user.id);

        if (balance < amount) {
            return interaction.reply({
                content: `❌ You only have ${formatSol(balance)}`,
                ephemeral: true
            });
        }

        // ⚡ CRITICAL FIX
        await interaction.deferReply();

        let crashPoint = Math.max(1.01, (1 / Math.random()));

        // 🧠 FUZZY
        if (isLucky(user.id)) {
            crashPoint = target + 1;
        }

        let current = 1.00;
        let speed = 0.05;

        const embed = new EmbedBuilder()
            .setTitle('🚀 Limbo')
            .setColor(0xFFFF00);

        // 🚀 LOOP WITH LIMIT (prevents freezing)
        while (current < crashPoint && current < target + 2) {

            current += speed;
            current = parseFloat(current.toFixed(2));

            embed.setDescription(
                `Bet: ${formatSol(amount)}\n` +
                `Target: **${target}x**\n\n` +
                `📈 Multiplier: **${current}x**`
            );

            await interaction.editReply({ embeds: [embed] });

            speed += 0.01;

            await new Promise(r => setTimeout(r, 120));

            if (current >= target) break;
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
                `Target: **${target}x**\n\n` +
                `💰 Won: ${formatSol(winnings)}`;

            color = 0x00FF00;

        } else {

            removeBalance(user.id, amount);
            addLoss(user.id);

            resultText =
                `💀 LOST!\n\n` +
                `Crashed at: **${crashPoint.toFixed(2)}x**\n\n` +
                `💸 Lost: ${formatSol(amount)}`;

            color = 0xFF0000;
        }

        const resultEmbed = new EmbedBuilder()
            .setTitle('🚀 Limbo Result')
            .setDescription(resultText)
            .setColor(color);

        await interaction.editReply({ embeds: [resultEmbed] });
    }
};
