const { SlashCommandBuilder } = require('discord.js');
const { setBalance } = require('../utils/economy');

const OWNER_ID = '794606718972723230';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetmoney')
        .setDescription('Reset a user balance')
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('User')
                .setRequired(true)),

    async execute(interaction) {

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: '❌ You cannot use this.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        setBalance(user.id, 0);

        interaction.reply(`🔄 Reset ${user.username}'s balance.`);
    }
};
