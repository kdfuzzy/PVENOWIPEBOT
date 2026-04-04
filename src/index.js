const fs = require("fs");
const { Client, Collection, GatewayIntentBits, REST, Routes } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// ===== Load commands dynamically =====
const commandFolders = fs.readdirSync("./src/commands");
for (const folder of commandFolders) {
    const folderPath = `./src/commands/${folder}`;
    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`${folderPath}/${file}`);
        if (command.data && command.execute) client.commands.set(command.data.name, command);
    }
}

// ===== Handle interactions =====
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: "❌ Error executing command", ephemeral: true });
    }
});

// ===== Auto-sync slash commands on startup =====
client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    const commands = Array.from(client.commands.values()).map(c => c.data.toJSON());

    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log("✅ Slash commands synced successfully!");
    } catch (err) {
        console.error("❌ Failed to sync commands:", err);
    }
});

// ===== Login using Railway environment variables =====
client.login(process.env.TOKEN);
