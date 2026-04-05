const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getWallet } = require('../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('View a user wallet')
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('User')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const wallet = getWallet(user.id);

        if (!wallet) {
            return interaction.reply({
                content: `❌ ${user.username} has no wallet linked.`,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`👛 ${user.username}'s Wallet`)
            .setDescription(`\`${wallet}\``)
            .setColor('Purple');

        interaction.reply({ embeds: [embed] });
    }
};
