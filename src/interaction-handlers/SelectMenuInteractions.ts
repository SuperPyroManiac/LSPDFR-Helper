import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { LogMultiSelect } from './_CustomIds';
import { StringSelectMenuInteraction } from 'discord.js';
import { ProcessCache } from '../CustomTypes/CacheTypes/ProcessCache';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Reports } from '../Functions/Messages/Reports';
import { ASIProcessor } from '../Functions/Processors/ASI/ASIProcessor';
import { ASIValidator } from '../Functions/Processors/ASI/ASIValidator';
import { ELSProcessor } from '../Functions/Processors/ELS/ELSProcessor';
import { ELSValidator } from '../Functions/Processors/ELS/ELSValidator';
import { RPHProcessor } from '../Functions/Processors/RPH/RPHProcessor';
import { RPHValidator } from '../Functions/Processors/RPH/RPHValidator';
import { Cache } from '../Cache';
import { Logger } from '../Functions/Messages/Logger';

export class SelectMenuInteractions extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.SelectMenu,
    });
  }

  public async run(interaction: StringSelectMenuInteraction) {
    if (interaction.customId === LogMultiSelect) {
      await interaction.deferUpdate();
      const [messageId, attachmentId] = interaction.values[0]!.split('%');
      const originalMessage = await interaction.channel?.messages.fetch(messageId!);
      if (!originalMessage)
        return interaction.editReply({ embeds: [EmbedCreator.Error('__Failed to process file!__\r\n>>> The error has been sent to the bot developer!')] });
      const attach = originalMessage.attachments.get(attachmentId!);
      if (!attach)
        return interaction.editReply({ embeds: [EmbedCreator.Error('__Failed to process file!__\r\n>>> The error has been sent to the bot developer!')] });

      if (attach.name.toLowerCase().includes('ragepluginhook')) {
        let rphProc: RPHProcessor;
        const cache = await Cache.getProcess(attachmentId!);
        if (ProcessCache.IsCacheAvailable(cache)) rphProc = cache!.Processor as RPHProcessor;
        else {
          rphProc = new RPHProcessor(await RPHValidator.validate(attach!.url), attachmentId!);
          await Cache.saveProcess(attachmentId!, new ProcessCache(originalMessage, interaction, rphProc));
        }
        if (rphProc.log.logModified) return Reports.modifiedLog(interaction, attach!);
        await rphProc.SendReply(interaction).catch(async (e) => {
          await Logger.ErrLog(`Failed to process file!\r\n${e}`);
          await interaction.editReply({ embeds: [EmbedCreator.Error('__Failed to process file!__\r\n>>> The error has been sent to the bot developer!')] });
        });
        return;
      }

      if (attach!.name.toLowerCase().includes('els')) {
        let elsProc: ELSProcessor;
        const cache = await Cache.getProcess(attachmentId!);
        if (ProcessCache.IsCacheAvailable(cache)) elsProc = cache!.Processor as ELSProcessor;
        else {
          elsProc = new ELSProcessor(await ELSValidator.validate(attach!.url), attachmentId!);
          await Cache.saveProcess(attachmentId!, new ProcessCache(originalMessage, interaction, elsProc));
        }
        await elsProc.SendReply(interaction).catch(async (e) => {
          await Logger.ErrLog(`Failed to process file!\r\n${e}`);
          await interaction.editReply({ embeds: [EmbedCreator.Error('__Failed to process file!__\r\n>>> The error has been sent to the bot developer!')] });
        });
        return;
      }

      if (attach!.name.toLowerCase().includes('asiloader')) {
        let asiProc: ASIProcessor;
        const cache = await Cache.getProcess(attachmentId!);
        if (ProcessCache.IsCacheAvailable(cache)) asiProc = cache!.Processor as ASIProcessor;
        else {
          asiProc = new ASIProcessor(await ASIValidator.validate(attach!.url), attachmentId!);
          await Cache.saveProcess(attachmentId!, new ProcessCache(originalMessage, interaction, asiProc));
        }
        await asiProc.SendReply(interaction).catch(async (e) => {
          await Logger.ErrLog(`Failed to process file!\r\n${e}`);
          await interaction.editReply({ embeds: [EmbedCreator.Error('__Failed to process file!__\r\n>>> The error has been sent to the bot developer!')] });
        });
        return;
      }
    }
  }
}
