const chalk = require("chalk");

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

		console.log("\n");
		console.log(`Logged in as ${chalk.yellow.bold(client.user.tag)} ${chalk.gray(`(${client.user.id})`)}`);
		console.log(`In ${client.guilds.cache.size} guilds, ${userCount} users\n`);
	},
};
