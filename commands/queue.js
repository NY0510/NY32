require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { textLengthOverCut } = require("../modules/textLengthOverCut");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("재생목록을 확인합니다")
		.addIntegerOption(option => option.setName("max").setDescription("한번에 표시할 노래 개수"))
		.addIntegerOption(option => option.setName("page").setDescription("페이지 번호")),

	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);

		if (!player)
			return interaction.reply({
				embeds: [new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **이 서버에서 재생중인 음악이 없어요**`).setColor(process.env.COLOR_ERROR)],
				ephemeral: true,
			});

		const queue = player.queue;
		const e = new EmbedBuilder().setAuthor({ name: `📃 ${interaction.guild.name} 의 재생목록` }).setColor(process.env.COLOR_NORMAL);

		const multiple = interaction.options.get("max")?.value || 10;
		const page = interaction.options.get("page")?.value || 1;

		const end = page * multiple;
		const start = end - multiple;

		const tracks = queue.slice(start, end);

		if (queue.current)
			if (!tracks.length)
				// e.addFields({
				// 	name: "🎵 현재 재생중",
				// 	value: ` ┕** [${textLengthOverCut(queue.current.title, 35, " ...")}](${queue.current.uri})**`,
				// });

				e.setDescription(`${page > 1 ? ` 페이지에 ${page}` : "재생목록에"} 음악이 없어요`);
			else e.setDescription(tracks.map((track, i) => `**•** [${textLengthOverCut(track.title.replace("[", "").replace("]", ""), 35, " ...")}](${track.uri})`).join("\n"));

		const maxPages = Math.ceil(queue.length / multiple);

		e.setFooter({ text: `Page ${page > maxPages ? maxPages : page} of ${maxPages}` });

		return interaction.reply({ embeds: [e] });
	},
};
