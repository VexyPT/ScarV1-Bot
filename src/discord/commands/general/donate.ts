import { Command } from "#base";
import { settings } from "#settings";
import { hexToRgb } from "@magicyan/discord";
import { ApplicationCommandType, EmbedBuilder, formatEmoji } from "discord.js";

new Command({
    name: "donate",
    description: "🪙 Help us develop Scar by donating",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    async run(interaction){

        const { member } = interaction;

        const embed = new EmbedBuilder({
            title: "🪙 Donate to Scar",
            footer: {
                text: `Requested by ${member.user.globalName || member.user.username}`,
                iconURL: member.user.displayAvatarURL({
                    size: 256,
                }),
            },
            color: hexToRgb(settings.colors.azoxo),
            timestamp: new Date().toISOString()
        }); 

        if (!settings.links.donationsIsOn) {
            embed.setDescription("Currently, we do not accept any donation methods! Try again later")
            interaction.reply({
                embeds: [embed],
                ephemeral: false
            });
            return;
        }

        embed.setDescription(`> **You can donate to Scar by using the following methods:**\n\n**${formatEmoji(settings.emojis.static.paypal)} [Paypal](${settings.links.donatePaypal})**\n**${formatEmoji(settings.emojis.static.mbway)} [MbWay](${settings.links.donateMbWay})**`);

        interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
        return;

    }
});