const { SlashCommandBuilder } = require('discord.js');
const { getBalance, removeBalance, addBalance, formatSol } = require('../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tip')
        .setDescription('Tip a user (SOL)')
        .addUserOption(opt =>
            opt.setName('user').setDescription('User').setRequired(true))
        .addNumberOption(opt =>
            opt.setName('amount').setDescription('Amount in SOL').setRequired(true)),

    async execute(interaction) {

        const sender = interaction.user;
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getNumber('amount');

        if (target.bot) return interaction.reply({ content: '❌ Cannot tip bots.', ephemeral: true });
        if (amount <= 0) return interaction.reply({ content: '❌ Invalid amount.', ephemeral: true });

        const bal = getBalance(sender.id);
        if (bal < amount) {
            return interaction.reply({ content: `❌ You only have ${formatSol(bal)}`, ephemeral: true });
        }

        removeBalance(sender.id, amount);
        addBalance(target.id, amount);

        interaction.reply(`💸 ${sender.username} sent ${formatSol(amount)} to ${target.username}`);
    }
};
