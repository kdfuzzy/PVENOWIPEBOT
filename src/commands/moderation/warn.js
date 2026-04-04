const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

global.warns = global.warns || {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user")
        .addUserOption(opt => opt.setName("user").setRequired(true))
        .addStringOption(opt => opt.setName("reason"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason";

        if (!global.warns[user.id]) global.warns[user.id] = [];

        global.warns[user.id].push({ reason, mod: interaction.user.tag });

        const embed = new EmbedBuilder()
            .setTitle("⚠️ User Warned")
            .addFields(
                { name: "User", value: user.tag },
                { name: "Reason", value: reason }
            )
            .setColor("Yellow");

        interaction.reply({ embeds: [embed] });
    }
};
