require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("stop").setDescription("재생중인 음악을 정지합니다"),

	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
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

		player.destroy();
		return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`⏹️ **재생중인 음악을 정지하고 대기열을 비웠어요!**`).setColor(process.env.COLOR_NORMAL)] });
	},
};
