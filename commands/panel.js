const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Send ticket panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('🎫 Support Tickets')
            .setDescription('Click the button below to open a support ticket.')
            .setColor('Blue');

        const row = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Open Ticket',
                    style: 3,
                    custom_id: 'create_ticket'
                }
            ]
        };

        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        interaction.reply({ content: '✅ Panel sent.', ephemeral: true });
    }
};
