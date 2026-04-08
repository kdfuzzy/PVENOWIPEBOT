const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, removeBalance, addWin, addLoss, formatSol } = require('../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limbo')
        .setDescription('Play limbo (live multiplier)')
        .addNumberOption(opt =>
            opt.setName('amount').setDescription('Bet amount').setRequired(true))
        .addNumberOption(opt =>
            opt.setName('multiplier').setDescription('Target multiplier (e.g. 2)').setRequired(true)),

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

        // 🎲 Generate crash point
        const crashPoint = Math.max(1.01, (1 / Math.random()));

        let current = 1.00;
        let speed = 0.05;

        const embed = new EmbedBuilder()
            .setTitle('🚀 Limbo')
            .setColor(0xFFFF00);

        await interaction.reply({ embeds: [embed] });

        // 📈 LIVE COUNT UP LOOP
        while (current < crashPoint) {

            current += speed;
            current = parseFloat(current.toFixed(2));

            embed.setDescription(
                `Bet: ${formatSol(amount)}\n` +
                `Target: **${target}x**\n\n` +
                `📈 Multiplier: **${current}x**`
            );

            await interaction.editReply({ embeds: [embed] });

            // ⚡ speed increases (like Stake)
            speed += 0.01;

            await new Promise(r => setTimeout(r, 120));

            // Stop if already passed target (instant win feeling)
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
