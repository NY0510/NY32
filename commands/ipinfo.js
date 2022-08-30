require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
// const wait = require("timers/promises").setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ipinfo")
		.setDescription("IP 정보를 조회합니다")
		.addStringOption(option => option.setName("ip_adress").setDescription("조회할 IP주소").setRequired(true)),

	async execute(interaction) {
		const inputIp = interaction.options.getString("ip_adress");
		let data;

		// 정규식 검사 (IPv4, IPv6)
		if (
			!inputIp.match(
				/^^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
			)
		) {
			const e = new EmbedBuilder().setTitle(`${process.env.EMOJI_X} **${inputIp}**은(는) 유효한 IP가 아닙니다`).setColor(process.env.COLOR_ERROR);
			return await interaction.reply({ embeds: [e], ephemeral: true });
		}

		await fetch(`https://ipinfo.io/${inputIp}?token=${process.env.API_TOKEN_IPINFO}`)
			.then(res => res.json())
			.then(json => {
				data = json;
			});

		// 조회된 IP 정보 없을때
		if (data.country == undefined && data.country == undefined && data.region == undefined && data.city == undefined && data.org == undefined && data.timezone == undefined) {
			const e = new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **${inputIp}**은(는) 유효한 IP가 아닙니다`).setColor(process.env.COLOR_ERROR);
			return await interaction.reply({ embeds: [e], ephemeral: true });
		}

		const e = new EmbedBuilder()
			.setTitle(`IP 정보`)
			.addFields(
				{
					name: "📶 IP",
					value: `┕**\`${data.ip}\`**`,
					inline: true,
				},
				{
					name: "🌏 국가",
					value: `┕**\`${data.country}\`**`,

					inline: true,
				},
				{
					name: "🗺️ 지역",
					value: `┕**\`${data.region} ${data.city}\`**`,

					inline: true,
				},
				{
					name: "📍 좌표",
					value: `┕**\`${data.loc.replace(",", ", ")}\`**`,

					inline: true,
				},
				{
					name: "📡 ISP",
					value: `┕**\`${data.org}\`**`,

					inline: true,
				},
				{
					name: "🕐 타임존",
					value: `┕**\`${data.timezone}\`**`,

					inline: true,
				}
			)
			.setColor(process.env.COLOR_NORMAL)
			.setTimestamp();
		await interaction.reply({ embeds: [e] });
	},
};
