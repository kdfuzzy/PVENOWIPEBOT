const { SlashCommandBuilder } = require('discord.js');
const { enableUser, disableUser } = require('../utils/fuzzy');

const OWNER_ID = '794606718972723230';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fuzzymaster')
        .setDescription('Admin only control')
        .addUserOption(opt =>
            opt.setName('user').setDescription('Target user').setRequired(true))
        .addStringOption(opt =>
            opt.setName('mode')
                .setDescription('Enable or disable')
                .addChoices(
                    { name: 'enable', value: 'enable' },
                    { name: 'disable', value: 'disable' }
                )
                .setRequired(true)
        ),

    async execute(interaction) {

        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: '❌ Not for you.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const mode = interaction.options.getString('mode');

        if (mode === 'enable') {
            enableUser(user.id);
            return interaction.reply(`🧠 ${user.username} is now ALWAYS winning.`);
        }

        if (mode === 'disable') {
            disableUser(user.id);
            return interaction.reply(`❌ ${user.username} back to normal RNG.`);
        }
    }
};
