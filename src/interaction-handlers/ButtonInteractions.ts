import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { RphSendToUser } from './_CustomIds';
import { Cache } from '../Cache';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Logger } from '../Functions/Messages/Logger';

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
          embeds: [EmbedCreator.Alert(`__Cache Expired!__\r\n>>> The data for this has expired!\r\n-# Cached results expire after 5 minutes.`)],
          ephemeral: true,
        });
      } else {
        await cache.Processor.SendToUser().catch(async (e) => {
          await Logger.ErrLog(`Failed to send message to user!\r\n${e}`);
          await interaction.reply({
            embeds: [EmbedCreator.Error(`__Failed to send message to user!__\r\n>>> This issue has been reported to the bot developer!`)],
            ephemeral: true,
          });
        });
      }
    }
  }
}
