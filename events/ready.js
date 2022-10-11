const chalk = require("chalk");
const { ActivityType } = require("discord.js");

module.exports = {
	name: "ready",
	once: true,
	execute(client) {
		let userCount = 0;

		client.guilds.cache.forEach(guild => {
			guild.members.cache.forEach(member => {
				userCount++;
			});
		});

		client.user.setPresence({
			activities: [{ name: process.env.BOT_PRESENCE_NAME, type: ActivityType.Playing }],
			status: process.env.BOT_PRESENCE_STATUS,
		});

		console.log("\n");
		console.log(`Logged in as ${chalk.yellow.bold(client.user.tag)} ${chalk.gray(`(${client.user.id})`)}`);
		console.log(`In ${client.guilds.cache.size} guilds, ${userCount} users\n`);
	},
};
