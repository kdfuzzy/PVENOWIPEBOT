const { REST, Routes } = require("discord.js");
require("dotenv").config();
const fs = require("fs");

const commands = [];

const folders = fs.readdirSync("./src/commands");

for (const folder of folders) {
    const files = fs.readdirSync(`./src/commands/${folder}`).filter(f => f.endsWith(".js"));

    for (const file of files) {
        const command = require(`./commands/${folder}/${file}`);

        if (command.data) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Deploying slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log("✅ Commands deployed!");
    } catch (err) {
        console.error(err);
    }
})();
