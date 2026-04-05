const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('View your wallet or another user’s wallet')
        .addUserOption(option =>
            option.setName('user')
                  .setDescription('The user to check')
                  .setRequired(false)),
    
    async execute(interaction, client) {
        const target = interaction.options.getUser('user') || interaction.user;
        const address = client.wallets[target.id];

        if (!address) {
            return interaction.reply({ content: '❌ No wallet linked for this user.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${target.username}'s Wallet`)
            .setDescription(`Wallet Address: \`${address}\``)
            .setColor('Blue')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
