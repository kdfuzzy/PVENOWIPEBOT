const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getBalance, addBalance, removeBalance, addWin, addLoss, formatSol } = require('../utils/economy');
const { isLucky } = require('../utils/fuzzy');

function drawCard() {
    const cards = [2,3,4,5,6,7,8,9,10,10,10,10,11];
    return cards[Math.floor(Math.random() * cards.length)];
}

function getTotal(hand) {
    let total = hand.reduce((a, b) => a + b, 0);

    // Handle Ace (11 → 1)
    while (total > 21 && hand.includes(11)) {
        const index = hand.indexOf(11);
        hand[index] = 1;
        total = hand.reduce((a, b) => a + b, 0);
    }

    return total;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play blackjack')
        .addNumberOption(opt =>
            opt.setName('amount')
                .setDescription('Bet amount')
                .setRequired(true)
        ),

    async execute(interaction) {

        const user = interaction.user;
        const amount = interaction.options.getNumber('amount');

        if (amount <= 0) {
            return interaction.reply({ content: '❌ Invalid amount.', ephemeral: true });
        }

        const balance = getBalance(user.id);
        if (balance < amount) {
            return interaction.reply({
                content: `❌ You only have ${formatSol(balance)}`,
                ephemeral: true
            });
        }

        await interaction.deferReply();

        let playerHand = [drawCard(), drawCard()];
        let dealerHand = [drawCard(), drawCard()];

        const getEmbed = (hideDealer = true) => {
            return new EmbedBuilder()
                .setTitle('🃏 Blackjack')
                .setDescription(
                    `💰 Bet: ${formatSol(amount)}\n\n` +
                    `**Your Hand:** ${playerHand.join(', ')} (Total: ${getTotal([...playerHand])})\n\n` +
                    `**Dealer:** ${
                        hideDealer
                            ? `${dealerHand[0]}, ❓`
                            : `${dealerHand.join(', ')} (Total: ${getTotal([...dealerHand])})`
                    }`
                )
                .setColor(0x5865F2);
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('bj_hit').setLabel('Hit').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('bj_stand').setLabel('Stand').setStyle(ButtonStyle.Success)
        );

        await interaction.editReply({
            embeds: [getEmbed()],
            components: [row]
        });

        const filter = i => i.user.id === user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {

            if (i.customId === 'bj_hit') {

                playerHand.push(drawCard());

                if (getTotal([...playerHand]) > 21) {
                    collector.stop('bust');
                } else {
                    await i.update({
                        embeds: [getEmbed()],
                        components: [row]
                    });
                }
            }

            if (i.customId === 'bj_stand') {
                collector.stop('stand');
            }
        });

        collector.on('end', async (_, reason) => {

            let playerTotal = getTotal([...playerHand]);
            let dealerTotal = getTotal([...dealerHand]);

            // Dealer plays
            if (reason !== 'bust') {
                while (dealerTotal < 17) {
                    dealerHand.push(drawCard());
                    dealerTotal = getTotal([...dealerHand]);
                }
            }

            // 🧠 FUZZY FORCE WIN
            if (isLucky(user.id)) {
                playerTotal = 21;
                dealerTotal = 18;
            }

            let result;
            let color;

            if (playerTotal > 21) {
                removeBalance(user.id, amount);
                addLoss(user.id);
                result = `💀 Bust! You lost ${formatSol(amount)}`;
                color = 0xFF0000;

            } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
                addBalance(user.id, amount);
                addWin(user.id);
                result = `🏆 You win! +${formatSol(amount)}`;
                color = 0x00FF00;

            } else if (playerTotal === dealerTotal) {
                result = `🤝 Push (tie)`;
                color = 0xFFFF00;

            } else {
                removeBalance(user.id, amount);
                addLoss(user.id);
                result = `💀 You lost ${formatSol(amount)}`;
                color = 0xFF0000;
            }

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🃏 Blackjack Result')
                        .setDescription(
                            `💰 Bet: ${formatSol(amount)}\n\n` +
                            `Your Hand: ${playerHand.join(', ')} (${playerTotal})\n` +
                            `Dealer: ${dealerHand.join(', ')} (${dealerTotal})\n\n` +
                            result
                        )
                        .setColor(color)
                ],
                components: []
            });
        });
    }
};
