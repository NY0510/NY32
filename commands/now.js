require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { timeFormat } = require("../modules/timeFormat");
const { textLengthOverCut } = require("../modules/textLengthOverCut");
const { progressBar } = require("../modules/progressBar");

module.exports = {
	data: new SlashCommandBuilder().setName("now").setDescription("현재 재생중인 음악의 정보를 보여줍니다"),

	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		if (!player || !player?.queue?.current?.title)
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

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`🎵 현재 재생중인 음악`)
					.setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
					.setDescription(`${player.playing ? "▶️" : "⏸️"} ${textLengthOverCut(player.queue.current.title, 35, " ...")}\n\n${progressBar(player)}`)
					.addFields(
						{
							name: "⌛ 곡 길이",
							value: ` ┕** ${player.queue.current.isStream ? "LIVE" : timeFormat(player.queue.current.duration)}**`,
							inline: true,
						},
						{
							name: "🔂 남은 대기열",
							value: ` ┕** ${player.queue.length}곡**`,
							inline: true,
						},
						{
							name: "📎 링크",
							value: ` ┕** [${textLengthOverCut(player.queue.current.title.replace("[", "").replace("]", ""), 35, " ...")}](${player.queue.current.uri})**`,
						}
					)
					.setColor(process.env.COLOR_NORMAL),
			],
		});
	},
};
