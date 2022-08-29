require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
// const wait = require("timers/promises").setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("avatar")
		.setDescription("🖼 유저의 프로필 사진을 불러옵니다")
		.addUserOption(option => option.setName("target").setDescription("프로필 사진을 불러올 유저")),

	async execute(interaction) {
		const member = interaction.options.getMember("target") || interaction.member;
		const e = new EmbedBuilder()
			.setTitle(`${member.user.tag}의 프로필 사진`)
			.setImage(member.user.displayAvatarURL({ size: 256, dynamic: true }))
			.setDescription(`**[[ 다운로드 ]](${member.user.displayAvatarURL({ size: 2048, dynamic: true })})**`)
			.setColor(0x212326)
			.setTimestamp();
		await interaction.reply({ embeds: [e] });
	},
};
