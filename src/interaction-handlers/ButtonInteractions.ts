import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { AhMarkComplete, AhOpenCase, RphSendToUser } from './_CustomIds';
import { Cache } from '../Cache';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Logger } from '../Functions/Messages/Logger';
import { OpenCase } from '../Functions/AutoHelper/OpenCase';
import { CloseCase } from '../Functions/AutoHelper/CloseCase';

export class ButtonInteractions extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction) {
    const cache = Cache.getProcess(interaction.message.id);

    if (interaction.customId == RphSendToUser) {
      if (!cache) {
        await interaction.reply({
          embeds: [EmbedCreator.Alert(`__Cache Expired!__\n>>> The data for this has expired!\n-# Cached results expire after 5 minutes.`)],
          ephemeral: true,
        });
      } else {
        await cache.Processor.SendToUser().catch(async (e) => {
          await Logger.ErrLog(`Failed to send message to user!\n${e}`);
          await interaction.reply({
            embeds: [EmbedCreator.Error(`__Failed to send message to user!__\n>>> This issue has been reported to the bot developer!`)],
            ephemeral: true,
          });
        });
      }
    }

    //!NON CACHED ACTIONS
    if (interaction.customId === AhOpenCase) {
      await interaction.reply({ embeds: [EmbedCreator.Loading(`__Creating Case!__\r\n>>> A case is being created for you. Please wait...`)], ephemeral: true });

      if (Cache.getUser(interaction.user.id)?.banned) {
        interaction.editReply({
          embeds: [
            EmbedCreator.Error(
              `__Banned!__\n-# You are banned from using this bot!\n>>> It has been determined that you abused the features of this bot and your access revoked! You may dispute this by vising our Discord.`
            ),
          ],
        });
        return;
      }

      const findCase = Cache.getCases().filter((x) => x.open && x.ownerId === interaction.user.id)[0];
      if (findCase) {
        await interaction.editReply({
          embeds: [EmbedCreator.Error(`__Case Already Open!__\n>>> You already have an open case!\r\nCheck: <#${findCase.channelId}>`)],
        });
        return;
      }
      if (Cache.getServer(interaction.guildId!)?.ahChId != interaction.channelId) {
        await interaction.editReply({
          embeds: [EmbedCreator.Error(`__Server Setup Incorrectly!__\n>>> The servers AutoHelper channel ID is not set correctly. Please let server staff know!`)],
        });
        return;
      }
      const newCase = await OpenCase.Create(interaction.user.id, interaction.guildId!);
      await interaction.editReply({
        embeds: [EmbedCreator.Success(`__Case Created!__\n>>> A case has been created for you!\r\nCheck: <#${newCase?.channelId}>`)],
      });
    }

    if (interaction.customId === AhMarkComplete) {
      await interaction.reply({ embeds: [EmbedCreator.Loading(`__Closing Case!__\r\n>>> The case is being closed. Please wait...`)], ephemeral: true });
      const cs = Cache.getCases().filter((x) => x.channelId === interaction.channelId)[0];
      if (!cs) {
        await interaction.editReply({
          embeds: [
            EmbedCreator.Error(
              `__There was an error!__\n>>> The case you are trying to close could not be found! This is likely due to the cache not being updated yet! Try again in a minute.`
            ),
          ],
        });
        return;
      }
      //TODO: WE NEED TO CHECK IF THE USER IS A SERVER ADMIN OR BOT MANAGER
      if (interaction.user.id !== cs.ownerId) {
        await interaction.editReply({
          embeds: [EmbedCreator.Error(`__Not The Owner!__\n>>> You do not own this case!`)],
        });
        return;
      }
      await CloseCase.Close(cs);
      await interaction.editReply({
        embeds: [EmbedCreator.Success(`__Case Closed!__\n>>> The case has been closed successfully.`)],
      });
    }
  }
}
