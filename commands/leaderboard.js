const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllUsers } = require('../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View richest players'),

    async execute(interaction) {
        const data = getAllUsers();

        const sorted = Object.entries(data)
            .sort((a, b) => b[1].balance - a[1].balance)
            .slice(0, 10);

        let desc = '';

        for (let i = 0; i < sorted.length; i++) {
            const [userId, info] = sorted[i];
            const user = await interaction.client.users.fetch(userId);

            desc += `**${i + 1}. ${user.username}** - 💰 ${info.balance}\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 Leaderboard')
            .setDescription(desc || 'No data yet.')
            .setColor('Gold');

        interaction.reply({ embeds: [embed] });
    }
};
