require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
// const wait = require("timers/promises").setTimeout;

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("🏓 핑-퐁!"),

	async execute(interaction) {
		const startTime = Date.now();
		const e = new EmbedBuilder().setDescription("**지연시간 측정중...**").setColor(0x212326);

		await interaction.reply({ embeds: [e] }).then(async () => {
			const botLatency = Date.now() - startTime;
			const apiLatency = Math.round(interaction.client.ws.ping);
			const description = `⏱️ **\`봇 지연시간: ${botLatency}ms\`**\n⌛ **\`API 지연시간: ${apiLatency}ms\`**`;
			const e = new EmbedBuilder().setTitle("🏓 핑-퐁!").setDescription(description).setColor(0x212326).setTimestamp();

			await interaction.editReply({ embeds: [e] });
		});
	},
};
