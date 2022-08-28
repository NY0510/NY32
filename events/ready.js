module.exports = {
	name: "ready",
	once: true,
	execute(client) {
		console.log(`Logged in as ${client.user.tag} (${client.user.id})`);
		console.log(`In ${client.guilds.cache.size} guilds, ${client.users.cache.size} users\n`);
	},
};
