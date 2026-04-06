const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway')
        .addStringOption(opt =>
            opt.setName('name').setDescription('Giveaway name').setRequired(true))
        .addIntegerOption(opt =>
            opt.setName('duration').setDescription('Duration (seconds)').setRequired(true))
        .addIntegerOption(opt =>
            opt.setName('winners').setDescription('Number of winners').setRequired(true))
        .addStringOption(opt =>
            opt.setName('prize').setDescription('Prize').setRequired(true)),

    async execute(interaction) {

        const name = interaction.options.getString('name');
        const duration = interaction.options.getInteger('duration');
        const winnersCount = interaction.options.getInteger('winners');
        const prize = interaction.options.getString('prize');

        const embed = new EmbedBuilder()
            .setTitle(`🎉 ${name}`)
            .setDescription(`Prize: **${prize}**\nReact with 🎉 to enter!\n\nEnds <t:${Math.floor(Date.now()/1000)+duration}:R>`)
            .setColor(0x5865F2);

        const msg = await interaction.reply({
            embeds: [embed],
            fetchReply: true
        });

        await msg.react('🎉');

        setTimeout(async () => {
            const message = await interaction.channel.messages.fetch(msg.id);
            const reaction = message.reactions.cache.get('🎉');

            if (!reaction) return;

            const users = await reaction.users.fetch();
            const filtered = users.filter(u => !u.bot);

            if (filtered.size === 0) {
                return interaction.followUp('❌ No valid entries.');
            }

            const winners = [];
            const arr = [...filtered.values()];

            for (let i = 0; i < winnersCount; i++) {
                const random = arr[Math.floor(Math.random() * arr.length)];
                winners.push(random);
            }

            interaction.followUp(`🎉 Winners: ${winners.map(w => `<@${w.id}>`).join(', ')}`);
        }, duration * 1000);
    }
};
