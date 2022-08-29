require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");

const guilds = JSON.parse(process.env.DEV_GUILD_ID);
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

const option = process.argv[2];
(async () => {
	try {
		if (option == "--guild") {
			for (const guild of guilds) {
				console.log(`Started refreshing application (/) commands. (Guild ${guild})`);
				await rest.put(Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID, guild), { body: commands });
				console.log(`Successfully reloaded application (/) commands. (Guild ${guild})\n`);
			}
		} else if (option == "--global") {
			console.log(`Started refreshing application (/) commands. (Global)`);
			await rest.put(Routes.applicationCommands(process.env.BOT_CLIENT_ID, process.env.DEV_GUILD_ID), { body: commands });
			console.log(`Successfully deleted all application (/) commands. (Global)\n`);
		} else if (option == "--delete") {
			console.log(`Started deleted all application (/) commands. (Global)`);
			await rest.put(Routes.applicationCommands(process.env.BOT_CLIENT_ID, process.env.DEV_GUILD_ID), { body: [] });
			console.log(`Successfully deleted all application (/) commands. (Global)\n`);
		} else {
			console.log(`Usage: node deployCommands.js [--guild | --global | --delete]`);
			console.log(`	--guild: Deploys commands to the guild (DEV_GUILD_ID)`);
			console.log(`	--global: Deploys commands to the global application (/)`);
			console.log(`	--delete: Deletes all commands from the global application (/)\n`);
		}
	} catch (error) {
		console.error(error);
	}
})();
