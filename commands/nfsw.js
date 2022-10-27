require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder, Embed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("nsfw")
		.setDescription("NSFW 이미지를 불러옵니다")
		.addStringOption(option =>
			option
				.setName("tag")
				.setDescription("이미지 태그")
				.addChoices({ name: "Waifu", value: "waifu" }, { name: "Neko", value: "neko" }, { name: "Trap", value: "trap" }, { name: "Blowjob", value: "blowjob" })
		)
		.addBooleanOption(option => option.setName("onlyme").setDescription("상대방에게 보이지 메세지를 않게 전송합니다")),

	async execute(interaction) {
		const inputTag = interaction.options.getString("tag");
		let onlyMe = interaction.options.getBoolean("onlyme") ?? false;
		const channelNsfw = interaction.channel.nsfw;

		const e = new EmbedBuilder().setTitle("🔞 NSFW 이미지");
		if (!channelNsfw) {
			onlyMe = true;
			e.setFooter({ text: "* 연령제한 채널이 아니기 때문에 onlyme 값이 True로 변경되었습니다" });
		}

		await fetch(`https://api.ny64.kr/nsfw?categorie=${inputTag}`)
			.then(res => res.json())
			.then(data => {
				e.addFields(
					{
						name: "카테고리",
						value: `**\`${data.categorie[0].toUpperCase() + data.categorie.slice(1)}\`**`,
					},
					{
						name: "이미지 URL",
						value: `**\`${data.url}\`**`,
					}
				);
				e.setImage(data.url);
			});

		await interaction.reply({ embeds: [e], ephemeral: onlyMe });
	},
};
