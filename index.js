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
    }
}

// 🚀 REGISTER COMMANDS
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('🔄 Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('✅ Commands registered.');
    } catch (err) {
        console.error(err);
    }
});

// 🎮 INTERACTIONS
client.on('interactionCreate', async (interaction) => {

    // 🔹 SLASH COMMANDS
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            interaction.reply({ content: '❌ Error.', ephemeral: true });
        }
    }

    // 🔘 BUTTONS
    if (interaction.isButton()) {

        // =====================
        // 🎫 TICKET SYSTEM
        // =====================

        const supportRole = '1489800529365172434';
        const ticketCategory = '1489805003857330226';
        const transcriptChannelId = '1490475430095093845';

        // CREATE
        if (interaction.customId === 'create_ticket') {

            const existing = interaction.guild.channels.cache.find(
                c => c.name === `ticket-${interaction.user.username}`
            );

            if (existing) {
                return interaction.reply({
                    content: '❌ You already have a ticket.',
                    ephemeral: true
                });
            }

            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: 0,
                parent: ticketCategory,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: ['ViewChannel'] },
                    { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
                    { id: supportRole, allow: ['ViewChannel', 'SendMessages'] }
                ]
            });

            const embed = {
                title: '🎫 Ticket Opened',
                description: 'Use buttons below to manage this ticket.',
                color: 0x5865F2
            };

            const row = {
                type: 1,
                components: [
                    { type: 2, label: 'Claim', style: 1, custom_id: 'claim_ticket' },
                    { type: 2, label: 'Rename', style: 2, custom_id: 'rename_ticket' },
                    { type: 2, label: 'Close', style: 4, custom_id: 'close_ticket' }
                ]
            };

            await channel.send({
                content: `<@${interaction.user.id}>`,
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                content: `✅ Created: ${channel}`,
                ephemeral: true
            });
        }

        // CLAIM
        if (interaction.customId === 'claim_ticket') {

            if (!interaction.member.roles.cache.has(supportRole)) {
                return interaction.reply({ content: '❌ No permission.', ephemeral: true });
            }

            await interaction.channel.send(`👤 Claimed by <@${interaction.user.id}>`);
            return interaction.deferUpdate();
        }

        // RENAME
        if (interaction.customId === 'rename_ticket') {

            if (!interaction.member.roles.cache.has(supportRole)) {
                return interaction.reply({ content: '❌ No permission.', ephemeral: true });
            }

            await interaction.channel.setName(`ticket-renamed`);
            return interaction.reply({ content: '✏️ Renamed.', ephemeral: true });
        }

        // CLOSE
        if (interaction.customId === 'close_ticket') {

            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = messages
                .map(m => `${m.author.tag}: ${m.content}`)
                .reverse()
                .join('\n');

            const fileName = `transcript-${interaction.channel.id}.txt`;
            fs.writeFileSync(fileName, transcript);

            const logChannel = interaction.guild.channels.cache.get(transcriptChannelId);

            if (logChannel) {
                await logChannel.send({
                    content: `📜 Transcript for ${interaction.channel.name}`,
                    files: [fileName]
                });
            }

            await interaction.reply('🔒 Closing...');
            setTimeout(() => interaction.channel.delete(), 3000);
        }

        // =====================
        // 🪙 COINFLIP SYSTEM
        // =====================

        const parts = interaction.customId.split('_');
        const action = parts[0];

        if (action !== 'accept' && action !== 'decline') return;

        const userId = parts[1];
        const opponentId = parts[2];
        const amount = parts[3];
        const chosenSide = parts[4];

        if (interaction.user.id !== opponentId) {
            return interaction.reply({
                content: '❌ Not your challenge.',
                ephemeral: true
            });
        }

        if (action === 'decline') {
            return interaction.update({
                content: '❌ Declined.',
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
                    content: '❌ Not enough money.',
                    components: []
                });
            }

            await interaction.update({
                embeds: [{
                    title: '🪙 Flipping...',
                    description: 'The coin is spinning...',
                    color: 0xFFFF00
                }],
                components: []
            });

            await new Promise(r => setTimeout(r, 2000));

            const result = Math.random() < 0.5 ? 'heads' : 'tails';
            const opponentSide = chosenSide === 'heads' ? 'tails' : 'heads';

            let winnerId = result === chosenSide ? userId : opponentId;
            let loserId = winnerId === userId ? opponentId : userId;

            removeBalance(loserId, bet);
            addBalance(winnerId, bet);

            addWin(winnerId);
            addLoss(loserId);

            const winner = await client.users.fetch(winnerId);
            const challenger = await client.users.fetch(userId);
            const opponent = await client.users.fetch(opponentId);

            await interaction.editReply({
                embeds: [{
                    title: '🪙 Result',
                    description:
                        `Result: **${result}**\n\n` +
                        `${challenger.username}: ${chosenSide}\n` +
                        `${opponent.username}: ${opponentSide}\n\n` +
                        `🏆 Winner: ${winner.username}`,
                    color: 0x00FF00
                }]
            });

            const logChannel = client.channels.cache.get('1490466866915836095');

            if (logChannel) {
                logChannel.send({
                    embeds: [{
                        title: '📜 Coinflip Log',
                        description:
                            `${challenger.username} vs ${opponent.username}\n` +
                            `Bet: ${bet}\nWinner: ${winner.username}`,
                        color: 0x5865F2
                    }]
                });
            }
        }
    }
});

client.login(process.env.TOKEN);
