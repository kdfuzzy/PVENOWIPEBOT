const { 
    Client, 
    GatewayIntentBits, 
    Collection, 
    REST, 
    Routes 
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.commands = new Collection();

// 📂 LOAD COMMANDS
const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    } else {
        console.log(`⚠️ Skipped ${file} (missing data/execute)`);
    }
}

// 🚀 REGISTER SLASH COMMANDS
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('🔄 Registering slash commands...');

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log('✅ Slash commands registered.');
    } catch (err) {
        console.error(err);
    }
});

// 🎮 HANDLE INTERACTIONS
client.on('interactionCreate', async (interaction) => {

    // 🔹 SLASH COMMANDS
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.log(`❌ Command not found: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);

            if (interaction.replied || interaction.deferred) {
                interaction.followUp({ content: '❌ Error executing command.', ephemeral: true });
            } else {
                interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
            }
        }
    }

    // 🎲 BUTTON HANDLER (COINFLIP)
    if (interaction.isButton()) {

        const parts = interaction.customId.split('_');
        const action = parts[0];

        if (action !== 'accept' && action !== 'decline') return;

        const userId = parts[1];
        const opponentId = parts[2];
        const amount = parts[3];
        const chosenSide = parts[4];

        if (interaction.user.id !== opponentId) {
            return interaction.reply({
                content: '❌ This is not your challenge.',
                ephemeral: true
            });
        }

        if (action === 'decline') {
            return interaction.update({
                content: '❌ Coinflip declined.',
                embeds: [],
                components: []
            });
        }

        if (action === 'accept') {
            const bet = parseInt(amount);

            const { 
                getBalance, 
                removeBalance, 
                addBalance,
                addWin,
                addLoss
            } = require('./utils/economy');

            const userBal = getBalance(userId);
            const oppBal = getBalance(opponentId);

            if (userBal < bet || oppBal < bet) {
                return interaction.update({
                    content: '❌ One of you no longer has enough money.',
                    components: []
                });
            }

            // 🎬 ANIMATION
            await interaction.update({
                embeds: [{
                    title: '🪙 Flipping...',
                    description: 'The coin is spinning...',
                    color: 0xFFFF00
                }],
                components: []
            });

            await new Promise(r => setTimeout(r, 2000));

            // 🎲 RESULT
            const result = Math.random() < 0.5 ? 'heads' : 'tails';
            const opponentSide = chosenSide === 'heads' ? 'tails' : 'heads';

            let winnerId = result === chosenSide ? userId : opponentId;
            let loserId = winnerId === userId ? opponentId : userId;

            removeBalance(loserId, bet);
            addBalance(winnerId, bet);

            // 📊 TRACK STATS
            addWin(winnerId);
            addLoss(loserId);

            const winner = await client.users.fetch(winnerId);
            const challenger = await client.users.fetch(userId);
            const opponent = await client.users.fetch(opponentId);

            const resultEmbed = {
                title: '🪙 Coinflip Result',
                description:
                    `🎯 Result: **${result.toUpperCase()}**\n\n` +
                    `👤 ${challenger.username}: ${chosenSide.toUpperCase()}\n` +
                    `👤 ${opponent.username}: ${opponentSide.toUpperCase()}\n\n` +
                    `🏆 Winner: **${winner.username}**\n💰 Won: **${bet}**`,
                color: 0x00FF00
            };

            await interaction.editReply({
                embeds: [resultEmbed]
            });

            // 📜 LOGGING
            const logChannel = client.channels.cache.get('1490466866915836095');

            if (logChannel) {
                logChannel.send({
                    embeds: [{
                        title: '📜 Coinflip Log',
                        description:
                            `👤 ${challenger.username} vs ${opponent.username}\n` +
                            `💰 Bet: ${bet}\n` +
                            `🎯 Result: ${result}\n` +
                            `🏆 Winner: ${winner.username}`,
                        color: 0x5865F2
                    }]
                });
            }
        }
    }
});

client.login(process.env.TOKEN);
