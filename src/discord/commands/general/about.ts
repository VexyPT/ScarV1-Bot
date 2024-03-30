import { Command } from "#base";
import { settings } from "#settings";
import { createRow, hexToRgb } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

new Command({
    name: "about",
    description: "🏷️ Learn more about Scar",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    async run(interaction){

        const { client, member } = interaction;

        const embed = new EmbedBuilder({
            title: `🤖 About ${client.user.username}`,
            description:
            `Experience the pinnacle of server security, comfort, and entertainment • **Moderation, Backups, Giveaways, Ranks, Economy, Logs, Reaction Roles, Tickets, and more!** 🎉
            
            ${settings.links.invite ? `**If you want to invite Scar to your server, you can do so by clicking [here](${settings.links.invite})**` : ""}
            `,
            footer: {
                text: `Requested by ${member.user.globalName || member.user.username}`,
                iconURL: interaction.member.user.displayAvatarURL({
                    size: 256,
                }),
            },
            timestamp: new Date().toISOString(),
            color: hexToRgb(settings.colors.azoxo),
        });

        if(settings.links.invite) {
            const row = createRow(
                new ButtonBuilder({
                    label: "Dashboard",
                    emoji: settings.emojis.static.partners.scar,
                    style: ButtonStyle.Link,
                    url: "https://google.com",
                    disabled: true
                }),
                new ButtonBuilder({
                    label: "Support Server",
                    emoji: settings.emojis.static.support,
                    style: ButtonStyle.Link,
                    url: `${settings.links.supportServer}`,
                    disabled: false
                }),
            );

            interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: false
            });
            return;
        }
        else {
            interaction.reply({
                embeds: [embed],
                ephemeral: false
            });
        }
        return;
    }
});