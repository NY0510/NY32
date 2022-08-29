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

		console.log(`Logged in as ${client.user.tag} (${client.user.id})`);
		console.log(`In ${client.guilds.cache.size} guilds, ${userCount} users\n`);
	},
};
