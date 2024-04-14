import { Command } from "#base";
import { settings } from "#settings";
import { brBuilder, createRow, hexToRgb } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, codeBlock, formatEmoji, parseEmoji } from "discord.js";
import axios from "axios";

new Command({
    name: "emoji",
    description: "gerencia o modulo de emojis",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
          name: "add",
          description: "➕ Add a custom emoji for the server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "emoji",
              description: "Copy an existing emoji",
              type: ApplicationCommandOptionType.String,
              required: true
            },
            {
              name: "name",
              description: "Name of emoji to create",
              type: ApplicationCommandOptionType.String,
              required: false,
            }
          ],
        }, {
          name: "info",
          description: "ℹ️ Receive information from a Discord emoji",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "emoji",
              description: "The emoji you want to view information about",
              type: ApplicationCommandOptionType.String,
              required: true
            },
          ],
        }, {
          name: "delete",
          description: "➖ Remove a custom emoji from the server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "emoji",
              description: "The emoji you want to remove",
              type: ApplicationCommandOptionType.String,
              required: true
            },
          ]
        }, {
          name: "enlarge",
          description: "📐 Enlarge an emoji to see it better",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "emoji",
              description: "The emoji you want to enlarge",
              type: ApplicationCommandOptionType.String,
              required: true
            },
          ]
        }
      ],
    async run(interaction) {

        const { options, user, guild, channel } = interaction;

        switch (options.getSubcommand()) {

          case "add": {

            if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
              interaction.reply({
                content: `${formatEmoji(settings.emojis.static.error)} I need the permission: \`ManageGuildExpressions\``,
                ephemeral
              });
              return;
            }

            if (!channel?.permissionsFor(user)?.has(PermissionFlagsBits.ManageGuildExpressions)) {
              interaction.reply({
                content: `${formatEmoji(settings.emojis.static.error)} You need the permission \`ManageGuildExpressions\``,
                ephemeral
              });
              return;
            }

            let emojiName = options.getString("name");

            if (emojiName) {

              if (interaction.guild.emojis.cache.find((findEmoji) => findEmoji.name?.toLowerCase() === emojiName?.toLowerCase())) {
                interaction.reply({
                  content: `${formatEmoji(settings.emojis.static.error)} An emoji with that name already exists!`,
                  ephemeral
                });
                return;
              }
  
              if (emojiName.length > 32) {
                interaction.reply({
                  content: `${formatEmoji(settings.emojis.static.error)} Emoji name must be less than 32 characters!`,
                  ephemeral
                });
                return;
              }

              if (emojiName.length < 2) {
                interaction.reply({
                  content: `${formatEmoji(settings.emojis.static.error)} Emoji name must be more than 2 characters!`,
                  ephemeral
                });
                return;
              }
            }

            const string = options.getString("emoji", true);

            const parsed = parseEmoji(string);

            const link = `https://cdn.discordapp.com/emojis/${parsed?.id}${parsed?.animated ? '.gif' : '.png'}`;

            if (!emojiName) emojiName = parsed!.name;

            guild.emojis.create({ attachment: link, name: `${emojiName}` })
            .then((em) => {
              const embed = new EmbedBuilder({
                color: hexToRgb(settings.colors.azoxo),
                timestamp: new Date().toISOString(),
                title: `${formatEmoji(settings.emojis.static.sucess)} Emoji successfully created!`,
                thumbnail: { url: `${em.imageURL()}` },
                footer: {
                  text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
                  iconURL: user.displayAvatarURL({ size: 256 })
                },
                fields: [
                  {
                    name: `${formatEmoji(settings.emojis.static.info)} Emoji name`,
                    value: codeBlock(String(em.name)),
                    inline: true,
                   },
                   {
                    name: `${formatEmoji(settings.emojis.static.id)} Emoji ID`,
                    value: codeBlock(em.id),
                    inline: true,
                   },
                   {
                    name: `${formatEmoji(settings.emojis.static.link)} Emoji URL`,
                    value: `> <${em.imageURL()}>`,
                   },
                  ]
              });

              interaction.reply({
                embeds: [embed],
                ephemeral: false
              });
              return;
            })
            .catch((error) => {
              console.log("[DEBUG] Emoji add:\n", error);
              interaction.reply({
                content: brBuilder(`${formatEmoji(settings.emojis.static.error)} Cannot create emoji! It may be because of the following reasons:\n\n>>> - You have reached the maximum number of emojis on this server\n- The emoji URL is invalid\n- The emoji name is invalid`),
                ephemeral: true,
              });
              return;
            });

            break;
          } // fim do /emoji add

          case "delete": {
            try {
              if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
                interaction.reply({
                  content: `${formatEmoji(settings.emojis.static.error)} I need the permission: \`ManageGuildExpressions\``,
                  ephemeral
                });
                return;
              }
  
              if (!channel?.permissionsFor(user)?.has(PermissionFlagsBits.ManageGuildExpressions)) {
                interaction.reply({
                  content: `${formatEmoji(settings.emojis.static.error)} You need the permission \`ManageGuildExpressions\``,
                  ephemeral: true
                });
                return;
              }
  
              const emojiQuery = options.getString("emoji", true);
              let emojiToDelete;
  
              if (!isNaN(parseInt(emojiQuery))) {
                emojiToDelete = await interaction.guild.emojis.fetch(emojiQuery);
            } else {
                emojiToDelete = interaction.guild.emojis.cache.find((findEmoji) => findEmoji.name === emojiQuery || findEmoji.name?.toLowerCase() === emojiQuery.toLowerCase() || findEmoji.name === emojiQuery.split(":")[0] || findEmoji.name === emojiQuery.split(":")[1]);
            }
  
            if (!emojiToDelete) {
              interaction.reply({
                content: `${formatEmoji(settings.emojis.static.error)} It seems like that emoji doesn't exist!`,
                ephemeral: true
              });
              return;
             }
         
             if (emojiToDelete?.managed) {
              interaction.reply({
                content: `${formatEmoji(settings.emojis.static.error)} You cannot delete an emoji that is managed by an external service!`,
                ephemeral: true
              });
              return;
             }
  
             try {
              await emojiToDelete?.delete();
             } catch (err) {
              interaction.reply({
                content: `${formatEmoji(settings.emojis.static.error)} I couldn't delete the emoji! It may be because of the following reasons:\n\n>>> - The emoji is not from this server\n- The emoji is not found\n - This is just a bug`,
                ephemeral: true
              });
              return;
             }
  
             const embed = new EmbedBuilder({
              color: hexToRgb(settings.colors.azoxo),
              timestamp: new Date().toISOString(),
              title: `${formatEmoji(settings.emojis.static.sucess)} Emoji successfully deleted!`,
              thumbnail: { url: `${emojiToDelete.imageURL()}` },
              footer: {
                text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
                iconURL: user.displayAvatarURL({ size: 256 })
              },
              fields: [
                {
                  name: `${formatEmoji(settings.emojis.static.info)} Emoji name`,
                  value: codeBlock(String(emojiToDelete.name)),
                  inline: true,
                 },
                 {
                  name: `${formatEmoji(settings.emojis.static.id)} Emoji ID`,
                  value: codeBlock(emojiToDelete.id),
                  inline: true,
                 },
                 {
                  name: `${formatEmoji(settings.emojis.static.link)} Emoji URL`,
                  value: `> <${emojiToDelete.imageURL()}>`,
                 },
                ]
              });

              await interaction.reply({
                embeds: [embed],
                ephemeral: false
              });

            } catch (err) {
              console.log("[DEBUG 1] Emoji remove:\n", err);
            }
                        
            break;
          } // fim do /emoji delete

          case "info": {

            await interaction.deferReply();

            const emote = options.getString('emoji');
            const regex = emote?.replace(/^<a?:\w+:(\d+)>$/, '$1');

            const emoji = guild.emojis.cache.find((emj) => emj.id === regex);
            if (!emoji) {
              interaction.editReply({
                content: `${formatEmoji(settings.emojis.static.error)} Send only emojis from this server.`
              });
              return;
            }

            const row = createRow(
              new ButtonBuilder({
                label: "Download",
                emoji: formatEmoji(settings.emojis.static.link),
                style: ButtonStyle.Link,
                url: `https://cdn.discordapp.com/emojis/${emoji.id}${emoji.animated ? '.gif' : '.png'}`
              })
            );

            const embed_info = new EmbedBuilder({
              title: `${emoji} ${emoji.name}`,
              color: hexToRgb(settings.colors.azoxo),
              thumbnail: { url: emoji.imageURL() },
              fields: [
                { name: `${formatEmoji(settings.emojis.static.id)} ID`, value: `**\`\`\`${emoji.id}\`\`\`**`, inline: true },
                { name: `${formatEmoji(settings.emojis.static.mention)} Mention`, value: emoji.animated ? `**\`\`\`<a:${emoji.name}:${emoji.id}>\`\`\`**` : `\`\`\`<:${emoji.name}:${emoji.id}>\`\`\``, inline: true },
                { name: `${formatEmoji(settings.emojis.static.calendar)} Creation Date`, value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:f>`, inline: true },
                { name: `${formatEmoji(settings.emojis.static.image)} Format`, value: `${emoji.animated ? '**```GIF```**' : '**```Static```**'}`, inline: false },
              ]
            });

            interaction.editReply({
              embeds: [embed_info],
              components: [row]
            });
            break;
          } // fim do /emoji info

          case "enlarge": {

            let emoji = options.getString('emoji')?.trim();

            if (emoji?.startsWith("<") && emoji.endsWith(">")) {

              const id = emoji.match(/\d{15,}/g)?.[0];

              const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`).then(image => {
                if (image) return "gif"
                else return "png"
              }).catch(() => {
                return "png"
              });

              emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;

              const embed = new EmbedBuilder({
                color: hexToRgb(settings.colors.azoxo),
                image: { url: emoji },
                footer: {
                  text: `Emoji enlarged by ${user.username}`,
                },
              });

              const button = createRow(
                new ButtonBuilder({
                  style: ButtonStyle.Link,
                  url: emoji,
                  emoji: formatEmoji(settings.emojis.static.link),
                  label: "Download"
                }),
              );

              await interaction.reply({
                embeds: [embed],
                components: [button]
              });
            } else {
              interaction.reply({
                content: `${formatEmoji(settings.emojis.static.error)} Please send a valid emoji.`,
                ephemeral: true
              });
            }

            break;
          }
        }
        
    }
});