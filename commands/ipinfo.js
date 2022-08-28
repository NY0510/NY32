require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
// const wait = require("timers/promises").setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ipinfo")
		.setDescription("📡 IP 정보 조회")
		.addStringOption(option => option.setName("ip_adress").setDescription("조회할 IP주소를 입력하세요").setRequired(true)),

	async execute(interaction) {
		const inputIp = interaction.options.getString("ip_adress");
		console.log(inputIp);

		// 정규식 검사 (IPv4, IPv6)
		if (
			!inputIp.match(
				/^^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
			)
		) {
			const e = new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **${inputIp}**는 유효한 IP가 아닙니다`).setColor(0x212326);
			return await interaction.reply({ embeds: [e], ephemeral: true });
		}

		const request = await fetch(`https://ipinfo.io/${inputIp}?token=${process.env.API_TOKEN_IPINFO}`);
		const json = await request.json();

		// 조회된 IP 정보 없을때
		if (json.country == undefined && json.country == undefined && json.region == undefined && json.city == undefined && json.org == undefined && json.timezone == undefined) {
			const e = new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **${inputIp}**는 유효한 IP가 아닙니다`).setColor(0x212326);
			return await interaction.reply({ embeds: [e], ephemeral: true });
		}

		const e = new EmbedBuilder()
			.setTitle(`IP 정보`)
			.addFields(
				{
					name: "📶 IP",
					value: `┕**\`${json.ip}\`**`,
					inline: true,
				},

				{
					name: "🌏 국가",
					value: `┕**\`${json.country}\`**`,

					inline: true,
				},

				{
					name: "🗺️ 지역",
					value: `┕**\`${json.region} ${json.city}\`**`,

					inline: true,
				},

				{
					name: "📍 좌표",
					value: `┕**\`${json.loc.replace(",", ", ")}\`**`,

					inline: true,
				},

				{
					name: "📡 ISP",
					value: `┕**\`${json.org}\`**`,

					inline: true,
				},

				{
					name: "🕐 타임존",
					value: `┕**\`${json.timezone}\`**`,

					inline: true,
				}
			)
			.setColor(0x212326)
			.setTimestamp();
		await interaction.reply({ embeds: [e] });
	},
};
