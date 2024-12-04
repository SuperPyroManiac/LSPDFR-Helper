import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { RphSendToUser } from './_CustomIds';
import { Cache } from '../Cache';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';

export class ButtonInteractions extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction) {
    if (interaction.customId == RphSendToUser) {
      //interaction.message.id
      const cache = Cache.getProcess('123');
      if (!cache) {
        await interaction.reply({
          embeds: [EmbedCreator.Alert(`__Cache Expired!__\r\n>>> The data for this has expired!\r\n-# Cached results expire after 5 minutes.`)],
          ephemeral: true,
        });
      } else await cache.Processor.SendServerContextReply(true);
    }
  }
}
