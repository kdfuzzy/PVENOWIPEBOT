const { SlashCommandBuilder } = require('discord.js');
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

        const userBal = getBalance(user.id);
        const oppBal = getBalance(opponent.id);

        if (userBal < amount) {
            return interaction.reply({ content: '❌ You don’t have enough money.', ephemeral: true });
        }

        if (oppBal < amount) {
            return interaction.reply({ content: '❌ Opponent doesn’t have enough money.', ephemeral: true });
        }

        await interaction.reply(`🪙 ${opponent}, you’ve been challenged by ${user} for **${amount}**!\nType **accept** to play.`);

        const filter = m => m.author.id === opponent.id && m.content.toLowerCase() === 'accept';

        const collector = interaction.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', async () => {
            const winner = Math.random() < 0.5 ? user : opponent;
            const loser = winner.id === user.id ? opponent : user;

            removeBalance(loser.id, amount);
            addBalance(winner.id, amount);

            interaction.followUp(`🪙 Coinflip result!\n🏆 Winner: ${winner}\n💰 Won: ${amount}`);
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp('❌ Challenge expired.');
            }
        });
    }
};
