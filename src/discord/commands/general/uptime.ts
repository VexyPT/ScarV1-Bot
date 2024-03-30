import { Command } from "#base";
import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, time } from "discord.js";

new Command({
    name: "uptime",
    description: "⌛ View Scar bot uptime and past status",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {

        const { client, member } = interaction;
        
        const embed = new EmbedBuilder({
            title: "📈 Scar uptime",
            description:
            `**🚀 Date launched:** ${time(client.readyAt)}
                **⏱️ Started:** ${time(client.readyAt, "R")}
            `,
            timestamp: new Date().toISOString(),
            color: hexToRgb(settings.colors.azoxo),
            footer: {
                text: `Requested by ${member.user.globalName || member.user.username}`,
                iconURL: member.user.displayAvatarURL({
                    size: 256,
                }),
            }
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