require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("pause").setDescription("재생중인 음악을 일시정지 합니다"),

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

		if (player.paused)
			return interaction.reply({
				embeds: [new EmbedBuilder().setDescription(`${process.env.EMOJI_X} 음악이 이미 일시정지 상태에요!`).setColor(process.env.COLOR_ERROR)],
				ephemeral: true,
			});

		player.pause(true);
		return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`⏸️ 재샹중인 음악을 일시정지 했어요!`).setColor(process.env.COLOR_NORMAL)] });
	},
};
