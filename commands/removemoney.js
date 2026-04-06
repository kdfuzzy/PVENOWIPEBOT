const { SlashCommandBuilder } = require('discord.js');
const { removeBalance } = require('../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removemoney')
        .setDescription('Remove money from a user')
        .addUserOption(opt =>
            opt.setName('user').setDescription('User').setRequired(true))
        .addIntegerOption(opt =>
            opt.setName('amount').setDescription('Amount').setRequired(true)),

    async execute(interaction) {

        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        removeBalance(user.id, amount);

        interaction.reply(`💸 Removed ${amount} from ${user.username}`);
    }
};
