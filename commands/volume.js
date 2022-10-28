require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("volume")
		.setDescription("볼륨을 조정합니다")
		.addIntegerOption(option => option.setName("volume").setRequired(false).setDescription("변경할 볼륨을 입력하세요")),

	async execute(interaction) {
		const player = interaction.client.manager.get(interaction.guild.id);
		const volume = interaction.options.get("volume")?.value;

		if (!player)
			return interaction.reply({
				embeds: [new EmbedBuilder().setDescription(`${process.env.EMOJI_X} **이 서버에서 재생중인 음악이 없어요**`).setColor(process.env.COLOR_ERROR)],
				ephemeral: true,
			});

		if (!volume)
			return interaction.reply({
				embeds: [new EmbedBuilder().setTitle(`🔊 현재 볼륨은 **\`${player.volume}%\`**에요`).setColor(process.env.COLOR_NORMAL)],
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

		if (!volume || volume < 1 || volume > 100)
			return interaction.reply({
				embeds: [new EmbedBuilder().setTitle(`${config.EMOJI_X} 볼륨은 1에서 100사이의 숫자만 입력해주세요`).setColor(process.env.COLOR_ERROR)],
				ephemeral: true,
			});

		player.setVolume(volume);
		interaction.reply({
			embeds: [new EmbedBuilder().setTitle(`🔊 볼륨을 **\`${volume}%\`**로 변경했어요!`).setColor(process.env.COLOR_NORMAL)],
		});
	},
};
