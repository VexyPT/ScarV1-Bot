import { Command } from "#base";
import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock, formatEmoji, time } from "discord.js";
import { SquareCloudAPI } from "@squarecloud/api";

new Command({
    name: "status",
    description: "⌛ View Scar bot status",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {

        const { client, member } = interaction;

        const api = new SquareCloudAPI(`${process.env.SQUARECLOUD_API_KEY}`);
        const application = await api.applications.get(`${process.env.SCAR_APPLICATION_ID}`);
        const status = await application.getStatus()

        const embed = new EmbedBuilder({
            color: hexToRgb(settings.colors.azoxo),
            author: { name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() },
            description:
            `**🚀 Date launched:** ${time(client.readyAt)}
                **⏱️ Started:** ${time(client.readyAt, "R")}
            `,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by ${member.user.globalName || member.user.username}`,
                iconURL: member.user.displayAvatarURL({
                    size: 256,
                }),
            },
            fields: [
                {
                    name: `${formatEmoji(settings.emojis.static.cpu)} CPU Usage`,
                    value: `${codeBlock(`${status.usage.cpu}`)}`,
                    inline: true
                },
                {
                    name: `${formatEmoji(settings.emojis.static.ram)} RAM Usage`,
                    value: `${codeBlock(status.usage.ram)}`,
                    inline: true
                },
                {
                    name: `${formatEmoji(settings.emojis.static.casePC)} Network Usage`,
                    value: `${codeBlock(`${status.usage.network.now} / ${status.usage.network.total}`)}`,
                    inline: false
                },
                {
                    name: `${formatEmoji(settings.emojis.static.ssd)} Storage Usage`,
                    value: `${codeBlock(status.usage.storage)}`,
                    inline: true
                },
            ]
        });

        const row = createRow(
            new ButtonBuilder({
                label: "Support Server",
                emoji: settings.emojis.static.support,
                style: ButtonStyle.Link,
                url: `${settings.links.supportServer}`,
                disabled: false,
            }),
        );

        interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false
        });
        return;

    }
});