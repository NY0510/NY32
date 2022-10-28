require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("repeat")
		.setDescription("음악을 반복 재생합니다")
		.addBooleanOption(option => option.setName("state").setDescription("반복 상태").setRequired(true))
		.addBooleanOption(option => option.setName("queue_repeat").setDescription("전체 반복 여부")),

	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
		const state = interaction.options.get("state")?.value;
		const queueRepeat = interaction.options.get("queue_repeat")?.value;

		if (!player)
			return interaction.reply({
				embeds: [new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **이 서버에서 재생중인 음악이 없어요**`).setColor(process.env.COLOR_ERROR)],
				ephemeral: true,
			});

		const { channel } = interaction.member.voice;

		if (!channel)
			return interaction.reply({
				embeds: [new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **음성 채널에 먼저 접속하세요!**`).setColor(process.env.COLOR_ERROR)],
				ephemeral: true,
			});

		if (channel.id !== player.voiceChannel)
			return interaction.reply({
				embeds: [new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **저와 같은 음성채널에 접속해 있지 않아요**`).setColor(process.env.COLOR_ERROR)],
				ephemeral: true,
			});

		// if (state === null) {
		// 	const repeatMode = player.trackRepeat ? "현재 곡" : player.queueRepeat ? "전체" : false;
		// 	const e = new EmbedBuilder().setDescription(`🔁 **${repeatMode} 반복 상태에요!**`).setColor(process.env.COLOR_NORMAL);
		// 	if (!repeatMode) e.setDescription(`🔁 **반복 상태가 아니에요!**`);
		// 	return interaction.reply({
		// 		embeds: [e],
		// 	});
		// }

		if (queueRepeat) {
			player.setQueueRepeat(state);
			const repeatMode = player.queueRepeat ? "설정" : "해제";
			return interaction.reply({
				embeds: [new EmbedBuilder().setDescription(`🔁 **전체 반복을 ${repeatMode}했어요!**`).setColor(process.env.COLOR_NORMAL)],
			});
		}

		player.setTrackRepeat(state);
		const repeatMode = player.trackRepeat ? "설정" : "해제";
		return interaction.reply({
			embeds: [new EmbedBuilder().setDescription(`🔁 **현재 곡 반복을 ${repeatMode}했어요!**`).setColor(process.env.COLOR_NORMAL)],
		});
	},
};
