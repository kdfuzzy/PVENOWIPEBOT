const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ===== CONFIG =====
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ===== CLIENT =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== LOAD COMMANDS =====
client.commands = new Map();
const commandsArray = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command.data || !command.execute) {
        console.log(`❌ Invalid command file: ${file}`);
        continue;
    }

    client.commands.set(command.data.name, command);

    commandsArray.push({
        name: command.data.name,
        description: command.data.description
    });
}

// ===== REGISTER COMMANDS =====
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🔄 Auto-registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commandsArray }
        );

        console.log('✅ Commands registered automatically');
    } catch (err) {
        console.error(err);
    }
})();

// ===== READY =====
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== HANDLE COMMANDS =====
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        return interaction.reply({ content: '❌ Command not found', ephemeral: true });
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Error executing command', ephemeral: true });
    }
});

// ===== LOGIN =====
client.login(TOKEN);
