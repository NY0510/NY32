require("dotenv").config();
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { Manager } = require("erela.js");
const wait = require("timers/promises").setTimeout;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers] });

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
		// await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
	}
});

// Lavalink 메니저
try {
	client.manager = new Manager({
		nodes: [
			{
				host: process.env.LAVALINK_HOST,
				port: parseInt(process.env.LAVALINK_PORT),
				password: process.env.LAVALINK_PASSWORD,
			},
		],
		send(id, payload) {
			const guild = client.guilds.cache.get(id);
			if (guild) guild.shard.send(payload);
		},
	})
		.on("nodeConnect", node => console.log(`Node ${node.options.identifier} connected`))
		.on("nodeError", (node, error) => console.log(`Node ${node.options.identifier} had an error: ${error.message}`))
		.on("trackStart", (player, track) => {
			// client.channels.cache.get(player.textChannel).send(`Now playing: ${track.title}`);
			client.channels.cache.get(player.textChannel).send({ embeds: [new EmbedBuilder().setDescription(`💿 **${track.title}**`).setColor(process.env.COLOR_NORMAL)] });
		})
		.on("queueEnd", player => {
			client.channels.cache
				.get(player.textChannel)
				.send({ embeds: [new EmbedBuilder().setDescription("🎵 **대기열에 있는 음악을 모두 재생했어요**").setColor(process.env.COLOR_NORMAL)] });
			wait(1500);
			player.destroy();
		});

	client.on("raw", d => client.manager.updateVoiceState(d));
	console.log(`${chalk.green.bold("✔")} Loaded Lavalink Manager`);
} catch (err) {
	console.log(`${chalk.red.bold("✖")} Failed to load Lavalink Manager`);
	console.log(`${chalk.red.bold("✖")} ${err}`);
}

client.on("voiceStateUpdate", async (oldState, newState) => {
	// 길드와 현재 재생중인 플레이어를 가져오고
	let guildId = newState.guild.id;
	const player = client.manager.get(guildId);

	// 채널에 연결되어 있는지 체크
	if (!player || player.state !== "CONNECTED") return;

	// 비교대조할 데이터 미리 준비
	const stateChange = {};
	if (oldState.channel === null && newState.channel !== null) stateChange.type = "JOIN";
	if (oldState.channel !== null && newState.channel === null) stateChange.type = "LEAVE";
	if (oldState.channel !== null && newState.channel !== null) stateChange.type = "MOVE";
	if (oldState.channel === null && newState.channel === null) return; // you never know, right
	if (newState.serverMute == true && oldState.serverMute == false) return player.pause(true);
	if (newState.serverMute == false && oldState.serverMute == true) return player.pause(false);
	// 채널 이동 체크
	if (stateChange.type === "MOVE") {
		if (oldState.channel.id === player.voiceChannel) stateChange.type = "LEAVE";
		if (newState.channel.id === player.voiceChannel) stateChange.type = "JOIN";
	}
	if (stateChange.type === "JOIN") stateChange.channel = newState.channel;
	if (stateChange.type === "LEAVE") stateChange.channel = oldState.channel;

	if (!stateChange.channel || stateChange.channel.id !== player.voiceChannel) return;

	// 봇을 기준으로 현재 사용자 필터링
	stateChange.members = stateChange.channel.members.filter(member => !member.user.bot);

	switch (stateChange.type) {
		case "JOIN":
			if (stateChange.members.size === 1 && player.paused) {
				client.channels.cache
					.get(String(player.textChannel))
					.send({ embeds: [new EmbedBuilder().setTitle("▶️ 일시정지를 해제했어요!").setColor(process.env.COLOR_NORMAL)] });

				player.pause(false);
			}
			break;
		case "LEAVE":
			if (stateChange.members.size === 0 && !player.paused && player.playing) {
				client.channels.cache
					.get(String(player.textChannel))
					.send({ embeds: [new EmbedBuilder().setTitle("⏸️ 음성채널이 비어있어서, 음악을 일시정지 했어요").setColor(process.env.COLOR_NORMAL)] });

				player.pause(true);
			}
			break;
	}
});

client.login(process.env.BOT_TOKEN);
