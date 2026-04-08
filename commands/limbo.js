const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, removeBalance, addWin, addLoss, formatSol } = require('../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limbo')
        .setDescription('Play limbo (high risk, high reward)')
        .addNumberOption(opt =>
            opt.setName('amount')
                .setDescription('Amount of SOL to bet')
                .setRequired(true))
        .addNumberOption(opt =>
            opt.setName('multiplier')
                .setDescription('Target multiplier (e.g. 2 = 2x)')
                .setRequired(true)),

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

        // 🎬 Animation
        const loading = new EmbedBuilder()
            .setTitle('🚀 Limbo...')
            .setDescription(
                `Bet: ${formatSol(amount)}\n` +
                `Target: **${target}x**`
            )
            .setColor(0xFFFF00);

        await interaction.reply({ embeds: [loading] });

        await new Promise(r => setTimeout(r, 2000));

        // 🎲 Generate multiplier (provably fair style)
        const roll = Math.max(1.00, (1 / Math.random())).toFixed(2);

        let resultText;
        let color;

        if (roll >= target) {
            const winnings = amount * target;

            addBalance(user.id, winnings);
            addWin(user.id);

            resultText =
                `🎉 You WON!\n\n` +
                `Roll: **${roll}x**\n` +
                `Target: **${target}x**\n\n` +
                `💰 Won: ${formatSol(winnings)}`;

            color = 0x00FF00;

        } else {
            removeBalance(user.id, amount);
            addLoss(user.id);

            resultText =
                `💀 You LOST!\n\n` +
                `Roll: **${roll}x**\n` +
                `Target: **${target}x**\n\n` +
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
