require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");

let option;
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

if (process.argv[2] === "--guild") option = "guild";
else if (process.argv[2] === "--global") option = "global";

(async () => {
	try {
		if (option == "guild" || option === undefined) {
			console.log(`Started refreshing application (/) commands. (Guild ${process.env.DEV_GUILD_ID})`);
			await rest.put(Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID, process.env.DEV_GUILD_ID), { body: commands });
			console.log(`Successfully reloaded application (/) commands. (Guild ${process.env.DEV_GUILD_ID})`);
		} else if (option == "global") {
			console.log(`Started refreshing application (/) commands. (Global)`);
			await rest.put(Routes.applicationCommands(process.env.BOT_CLIENT_ID, process.env.DEV_GUILD_ID), { body: commands });
			console.log(`Successfully reloaded application (/) commands. (Global)`);
		}
	} catch (error) {
		console.error(error);
	}
})();
