require("dotenv").config();
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 커맨드 핸들러
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	try {
		client.commands.set(command.data.name, command);
		console.log(`${chalk.green.bold("✔")} Loaded command ${chalk.green.bold(command.data.name)}`);
	} catch (err) {
		console.log(`${chalk.red.bold("✖")} Failed to load command ${chalk.green.bold(command.data.name)}`);
		console.log(`${chalk.red.bold("✖")} ${err}`);
	}
}

// 이밴트 핸들러
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	try {
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
		console.log(`${chalk.green.bold("✔")} Loaded event ${chalk.blue.bold(event.name)}`);
	} catch (err) {
		console.log(`${chalk.red.bold("✖")} Failed to load event ${chalk.blue.bold(event.name)}`);
		console.log(`${chalk.red.bold("✖")} ${err}`);
	}
}

client.on("interactionCreate", async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
	}
});

client.login(process.env.BOT_TOKEN);
