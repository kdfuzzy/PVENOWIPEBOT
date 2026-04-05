const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder 
} = require('discord.js');

// ===== CONFIG =====
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ===== CLIENT =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== SLASH COMMANDS =====
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check if bot is working'),

    new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Say hello')
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

// ===== REGISTER COMMANDS =====
(async () => {
    try {
        console.log('🔄 Registering commands...');
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands.map(cmd => cmd.toJSON()) }
        );
        console.log('✅ Commands registered');
    } catch (err) {
        console.error(err);
    }
})();

// ===== READY =====
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== COMMAND HANDLER =====
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // /ping
    if (interaction.commandName === 'ping') {
        await interaction.reply('🏓 Pong!');
    }

    // /hello
    if (interaction.commandName === 'hello') {
        await interaction.reply(`👋 Hello ${interaction.user.username}!`);
    }
});

// ===== LOGIN =====
client.login(TOKEN);
