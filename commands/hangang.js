require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
// const wait = require("timers/promises").setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("hangang")
		.setDescription("오늘 한강물은 몇도..?")
		.addStringOption(option =>
			option
				.setName("location")
				.setDescription("위치")
				.setRequired(true)
				.addChoices(
					{ name: "탄천", value: "tancheon" },
					{ name: "중랑천", value: "jungnangcheon" },
					{ name: "선유", value: "seonyu" },
					{ name: "노량진", value: "noryangjin" },
					{ name: "안양천", value: "anyang" }
				)
		),

	async execute(interaction) {
		const locationData = [
			{ name: "탄천", value: "tancheon" },
			{ name: "중랑천", value: "jungnangcheon" },
			{ name: "선유", value: "seonyu" },
			{ name: "노량진", value: "noryangjin" },
			{ name: "안양천", value: "anyang" },
		];

		const inputLocation = interaction.options.getString("location");
		const locationName = locationData.find(data => data.value === inputLocation).name;

		const e = new EmbedBuilder().setTitle(`${locationName}의 한강물 온도`);

		const fetchUrl = `https://api.projecttl.net/v1/hangang/${inputLocation}`;
		await fetch(fetchUrl)
			.then(res => res.json())
			.then(data => {
				e.addFields(
					{
						name: "🌡️ 온도",
						value: `┕**\`${data.temp}℃\`**`,
						inline: true,
					},
					{
						name: "🕐 측정시각",
						value: `┕**\`${data.date} ${data.time}\`**`,
						inline: true,
					},
					{
						name: "🦠 수소이온농도",
						value: `┕**\`${data.ph} pH\`**`,
						inline: true,
					}
				);
			});

		await fetch("https://hangang.ivlis.kr/aapi.php?type=text")
			.then(res => res.text())
			.then(data => {
				e.setFooter({ text: data });
				mogyok;
			});

		await interaction.reply({ embeds: [e] });
	},
};
