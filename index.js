// index.js
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --------------------
// Load Commands
// --------------------
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// --------------------
// Ready Event
// --------------------
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Auto-register slash commands for all guilds
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        if (!process.env.GUILD_ID) {
            console.warn('GUILD_ID not set. Commands will be registered globally (may take up to 1 hour).');
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
        } else {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log('Slash commands synced for guild.');
        }
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

// --------------------
// Interaction Handler
// --------------------
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
    }
});

// --------------------
// Login
// --------------------
client.login(process.env.TOKEN);
