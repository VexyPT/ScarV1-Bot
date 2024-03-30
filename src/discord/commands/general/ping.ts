import { Command } from "#base";
import { settings } from "#settings";
import { hexToRgb } from "@magicyan/discord";
import { ApplicationCommandType, EmbedBuilder, Status, codeBlock, formatEmoji } from "discord.js";

new Command({
    name: "ping",
    description: "🏓 replies with pong",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const { client, member, guild } = interaction;

        const dbTime = performance.now();
        const dbTiming = performance.now() - dbTime;
		const thisServerShard = client.ws.shards.get(guild.shardId);

        await interaction.deferReply();

        const waitEmbed = new EmbedBuilder({
            color: hexToRgb(settings.colors.azoxo),
            description: "🏓 Pong!..."
        });
        const i = interaction.followUp({ embeds: [waitEmbed] });
		
        
        const pingMessage = new EmbedBuilder({
            color: hexToRgb(settings.colors.azoxo),
            timestamp: new Date().toISOString(),
			author: { name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() },
			thumbnail: { url: client.user.displayAvatarURL() },
            title: "🏓 Pong!",
            fields: [
                {
                    name: "Host Latency",
                    value: codeBlock("yaml", client.ws.ping > 0 ? `${Math.floor(client.ws.ping)}ms` : "Calculating..."),
                    inline: true,
                },
                {
                    name: "Client Latency",
                    value: codeBlock("yaml", `${Math.floor((await i).createdTimestamp - interaction.createdTimestamp)}ms`),
                    inline: true,
                },
                {
                    name: "Database Latency",
                    value: codeBlock("yaml", `${Math.floor(dbTiming)}ms`),
                    inline: true,
                },
				{
					name: "Websocket",
					value: codeBlock("yaml", `${Status[thisServerShard!.status]}`),
					inline: true,
				   },
				   {
					name: "Shard",
					value: codeBlock("yaml", `${thisServerShard!.id}/${client.ws.shards.size} (${thisServerShard!.ping > 0 ? `${Math.floor(thisServerShard!.ping)}ms` : "Calculating..."})`),
					inline: true,
				   },
                {
                    name: `${formatEmoji(settings.emojis.static.info)} Did you know about this?`,
                    value: `>>> **The stats above are due to our wonderful hosting:\n${formatEmoji(settings.emojis.static.partners.squarecloud)} [SquareCloud](https://squarecloud.app/home)**`,
                },
            ],
            footer: {
                text: `Requested by ${member.user.globalName || member.user.username}`,
                iconURL: member.user.displayAvatarURL({
                    size: 256,
                })
            }
        });
        
        await interaction.editReply({ embeds: [pingMessage] });
        return;
    }
});