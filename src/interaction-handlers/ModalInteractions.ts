import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ModalSubmitInteraction } from 'discord.js';
import { SetupAhCh, SetupAhMnCh, SetupModal } from './_CustomIds';
import { Cache } from '../Cache';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { AhChannel } from '../Functions/AutoHelper/AhChannel';
import { CaseMonitor } from '../Functions/AutoHelper/CaseMonitor';
import { DBManager } from '../Functions/DBManager';

export class ModalInteractions extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
    });
  }

  public async run(interaction: ModalSubmitInteraction) {
    if (interaction.customId === SetupModal) {
      await interaction.reply({ embeds: [EmbedCreator.Loading(`__Processing!__\r\n>>> Changing settings in the DB. Please wait...`)], ephemeral: true });
      const ahChInput = interaction.fields.getTextInputValue(SetupAhCh);
      const ahChId = interaction.guild?.channels.cache.get(ahChInput) ? ahChInput : '0';
      const ahMonChInput = interaction.fields.getTextInputValue(SetupAhMnCh);
      const ahMonChId = interaction.guild?.channels.cache.get(ahMonChInput) ? ahMonChInput : '0';
      const servr = Cache.getServer(interaction.guildId!);

      if (!servr) return;
      servr.ahChId = ahChId;
      servr.ahMonChId = ahMonChId;
      await DBManager.editServer(servr);
      await AhChannel.UpdateCaseMsg(interaction.guildId!);
      await CaseMonitor.Update(interaction.guildId!);
      await interaction.editReply({
        embeds: [
          EmbedCreator.Question(
            '__LSPDFR Helper Setup__\n-# Updated your settings!\n\n' +
              `__**Your New Settings:**__\n**AutoHelper Channel ID:** ${servr?.ahChId}\n**Monitor Channel ID:** ${servr?.ahMonChId}`
          ),
        ],
      });
    }
  }
}
