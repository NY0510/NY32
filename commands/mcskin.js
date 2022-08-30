require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
// const wait = require("timers/promises").setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("mcskin")
		.setDescription("마인크래프트 스킨을 불러옵니다")
		.addStringOption(option => option.setName("nickname").setDescription("마인크래프트 닉네임").setRequired(true)),

	async execute(interaction) {
		const nickname = interaction.options.getString("nickname");
		let uuid;

		await fetch(`https://api.mojang.com/users/profiles/minecraft/${nickname}`)
			.then(res => res.json())
			.then(json => (uuid = json.id));

		let e = new EmbedBuilder()
			.setTitle(`${nickname}의 마인크래프트 스킨`)
			.setDescription(`**[[ 다운로드 ]](https://minotar.net/download/${nickname})**`)
			.setImage(`https://visage.surgeplay.com/full/256/${uuid}`)
			.setThumbnail(`https://visage.surgeplay.com/face/128/${uuid}`)
			.setColor(process.env.COLOR_NORMAL)
			.setTimestamp();
		if (uuid === undefined) {
			e = new EmbedBuilder().setTitle(`${nickname}은(는) 존재하지 않는 유저입니다`).setColor(process.env.COLOR_ERROR).setTimestamp();
		}
		await interaction.reply({ embeds: [e], ephemeral: uuid === undefined ? true : false });
	},
};
