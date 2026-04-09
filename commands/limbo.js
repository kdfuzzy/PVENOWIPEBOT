const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBalance, addBalance, removeBalance, addWin, addLoss, formatSol } = require('../utils/economy');
const { isLucky } = require('../utils/fuzzy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limbo')
        .setDescription('Play limbo')
        .addNumberOption(opt =>
            opt.setName('amount')
                .setDescription('Amount to bet') // ✅ FIXED
                .setRequired(true)
        )
        .addNumberOption(opt =>
            opt.setName('multiplier')
                .setDescription('Target multiplier (e.g. 2x)') // ✅ FIXED
                .setRequired(true)
        ),

    async execute(interaction) {

        const user = interaction.user;
        const amount = interaction.options.getNumber('amount');
        const target = interaction.options.getNumber('multiplier');

        if (amount <= 0 || target < 1.01) {
            return interaction.reply({ content: '❌ Invalid input.', ephemeral: true });
        }

        const balance = getBalance(user.id);
        if (balance < amount) {
            return interaction.reply({
                content: `❌ You only have ${formatSol(balance)}`,
                ephemeral: true
            });
        }

        await interaction.deferReply();

        let crashPoint = Math.max(1.01, (1 / Math.random()));

        if (isLucky(user.id)) {
            crashPoint = target + 1;
        }

        let current = 1.0;
        let growth = 1.07;

        const embed = new EmbedBuilder().setTitle('🚀 Limbo');

        for (let i = 0; i < 25; i++) {

            current *= growth;
            current = Number(current.toFixed(2));

            embed.setDescription(
                `Bet: ${formatSol(amount)}\nTarget: ${target}x\n\n📈 ${current}x`
            );

            await interaction.editReply({ embeds: [embed] });

            growth += 0.01;

            await new Promise(r => setTimeout(r, 100));

            if (current >= crashPoint || current >= target) break;
        }

        let result;
        let color;

        if (crashPoint >= target) {
            const win = amount * target;
            addBalance(user.id, win);
            addWin(user.id);
            result = `🎉 Win! +${formatSol(win)}`;
            color = 0x00FF00;
        } else {
            removeBalance(user.id, amount);
            addLoss(user.id);
            result = `💀 Lost -${formatSol(amount)}`;
            color = 0xFF0000;
        }

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('🚀 Result')
                    .setDescription(`${result}\nCrash: ${crashPoint.toFixed(2)}x`)
                    .setColor(color)
            ]
        });
    }
};
