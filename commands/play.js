require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { timeFormat } = require("../modules/timeFormat");
const { textLengthOverCut } = require("../modules/textLengthOverCut");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("음악을 재생합니다")
		.addStringOption(option => option.setName("query").setRequired(true).setDescription("음악 제목 또는 URL")),

	async execute(interaction) {
		const query = interaction.options.get("query").value;
		const { channel } = interaction.member.voice;

		if (!channel) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **음성 채널에 먼저 접속하세요!**`).setColor(process.env.COLOR_ERROR)],
				ephemeral: true,
			});
		}

		const player = await interaction.client.manager.create({
			guild: interaction.guild.id,
			voiceChannel: channel.id,
			textChannel: interaction.channel.id,
			selfDeafen: true,
		});
		const bindChannel = interaction.client.channels.cache.get(player.textChannel);

		// 음성채널 접속
		if (player.state != "CONNECTED") {
			await player.connect();
			await interaction.reply({
				embeds: [
					new EmbedBuilder().setDescription(`> **🔊 <#${channel.id}> 접속 완료!**\n> **🧾 <#${player.textChannel}> 채널에 바인딩!**`).setColor(process.env.COLOR_NORMAL),
				],
			});
		}

		let res;

		// 음악 검색
		try {
			res = await player.search(query, interaction.author);
			if (res.loadType === "LOAD_FAILD") {
				if (!player.query.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			return bindChannel.send({
				embeds: [
					new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **음악 검색 도중 오류가 발생했어요**\n**\`${err.message}\`**`).setColor(process.env.COLOR_ERROR),
				],
			});
		}

		switch (res.loadType) {
			case "NO_MATCHES":
				console.log("NO_MATCHES");
				if (!player.queue.current) player.destroy();
				return bindChannel.send({
					embeds: [new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **아쉽지만, 검색 결과가 없어요**`).setColor(process.env.COLOR_ERROR)],
				});

			case "TRACK_LOADED":
				player.queue.add(res.tracks, interaction.author);

				if (!player.playing && !player.paused && !player.queue.size) player.play();
				return bindChannel.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(`💿 음악을 대기열에 추가했어요`)
							.setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
							.setFooter({ text: `요청자: ${interaction.user.tag}` })
							.addFields(
								{
									name: "⌛ 곡 길이",
									value: ` ┕** ${res.tracks[0].isStream ? "LIVE" : timeFormat(res.tracks[0].duration)}**`,
									inline: true,
								},
								{
									name: "🔂 남은 대기열",
									value: ` ┕** ${player.queue.length}곡**`,
									inline: true,
								},
								{
									name: "📎 링크",
									value: ` ┕** [${textLengthOverCut(res.tracks[0].title.replace("[", "").replace("]", ""), 35, " ...")}](${res.tracks[0].uri})**`,
								}
							)
							.setColor(process.env.COLOR_NORMAL),
					],
				});

			case "PLAYLIST_LOADED":
				player.queue.add(res.tracks, interaction.author);

				// 재생목록 총 길이
				let duration = 0;
				res.tracks.forEach(i => {
					duration += i.duration;
				});

				if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();

				return bindChannel.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(`📀 재생목록을 대기열에 추가했어요`)
							.setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
							.setFooter({ text: `요청자: ${interaction.user.tag}` })
							.addFields(
								{
									name: "⌛ 총 길이",
									value: ` ┕** ${timeFormat(res.playlist.duration)}**`,
									inline: true,
								},
								{
									name: "🎵 트렉 개수",
									value: ` ┕** ${res.tracks.length}곡**`,
									inline: true,
								},
								{
									name: "📎 링크",
									value: ` ┕** [${textLengthOverCut(res.playlist.name.replace("[", "").replace("]", ""), 35, " ...")}](${query})**`,
								}
							)
							.setColor(process.env.COLOR_NORMAL),
					],
				});

			case "SEARCH_RESULT":
				const track = res.tracks[0];
				player.queue.add(track, interaction.author);

				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`💿 음악을 대기열에 추가했어요`)
							.setThumbnail(`https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`)
							.setFooter({ text: `요청자: ${interaction.user.tag}` })
							.addFields(
								{
									name: "⌛ 곡 길이",
									value: ` ┕** ${track.isStream ? "LIVE" : timeFormat(track.duration)}**`,
									inline: true,
								},
								{
									name: "🔂 남은 대기열",
									value: ` ┕** ${player.queue.length}곡**`,
									inline: true,
								},
								{
									name: "📎 링크",
									value: ` ┕** [${textLengthOverCut(track.title.replace("[", "").replace("]", ""), 35, " ...")}](${track.uri})**`,
								}
							)
							.setColor(process.env.COLOR_NORMAL),
					],
				});

				if (!player.playing && !player.paused && !player.queue.size) player.play();

			default:
				console.log(res.loadType);
		}
	},
};
