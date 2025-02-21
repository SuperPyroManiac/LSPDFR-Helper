import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ModalSubmitInteraction } from 'discord.js';

export class ModalInteractions extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
    });
  }

  public async run(_interaction: ModalSubmitInteraction) {}
}
