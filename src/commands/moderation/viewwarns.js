const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("viewwarns")
        .setDescription("View warns")
        .addUserOption(opt => opt.setName("user").setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const warns = global.warns?.[user.id] || [];

        const embed = new EmbedBuilder()
            .setTitle(`Warnings for ${user.tag}`)
            .setDescription(
                warns.length
                    ? warns.map((w, i) => `${i + 1}. ${w.reason} - ${w.mod}`).join("\n")
                    : "No warnings"
            )
            .setColor("Blue");

        interaction.reply({ embeds: [embed] });
    }
};
