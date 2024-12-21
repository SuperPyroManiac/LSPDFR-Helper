/* eslint-disable quotes */
import { Command } from '@sapphire/framework';
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ApplicationIntegrationType,
  Attachment,
  ContextMenuCommandType,
  Message,
  MessageContextMenuCommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Logger } from '../Functions/Messages/Logger';
import { Cache } from '../Cache';
import { ProcessCache } from '../CustomTypes/CacheTypes/ProcessCache';
import { RPHProcessor } from '../Functions/Processors/RPH/RPHProcessor';
import { RPHValidator } from '../Functions/Processors/RPH/RPHValidator';
import { Reports } from '../Functions/Messages/Reports';
import { XMLProcessor } from '../Functions/Processors/XML/XMLProcessor';
import { ELSProcessor } from '../Functions/Processors/ELS/ELSProcessor';
import { ELSValidator } from '../Functions/Processors/ELS/ELSValidator';
import { ASIProcessor } from '../Functions/Processors/ASI/ASIProcessor';
import { ASIValidator } from '../Functions/Processors/ASI/ASIValidator';
import { LogMultiSelect } from '../interaction-handlers/_CustomIds';

export class ValidateFilesCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options, description: 'Validate the selected files.' });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerContextMenuCommand((builder) =>
      builder
        .setName('Validate Files')
        .setType(ApplicationCommandType.Message as ContextMenuCommandType)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    );
  }

  public override async contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply({ embeds: [EmbedCreator.Loading(`__Validating!__\r\n>>> The file is currently being processed. Please wait...`)] });
      const targetMessage: Message = interaction.targetMessage;
      const acceptedTypes = ['ragepluginhook', 'els', 'asiloader', '.xml', '.meta'];
      let attach: Attachment | undefined;

      if (targetMessage.attachments.size === 0) {
        // prettier-ignore
        await interaction.editReply({embeds: [EmbedCreator.Error('__No File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')]});
        return;
      } else if (targetMessage.attachments.size === 1) {
        attach = targetMessage.attachments.first();

        if (!attach) {
          // prettier-ignore
          await interaction.editReply({embeds: [EmbedCreator.Error('__No File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')]});
          return;
        }

        if (!acceptedTypes.some((x) => attach!.name.toLowerCase().includes(x))) {
          // prettier-ignore
          await interaction.editReply({embeds: [EmbedCreator.Error('__No Valid File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')]});
          return;
        }

        if (attach.size / 1000000 > 10) {
          await Reports.largeLog(interaction, attach, true);
          return;
        } else if (attach.size / 1000000 > 3) {
          await Reports.largeLog(interaction, attach);
          return;
        }
      } else if (targetMessage.attachments.size > 1) {
        await interaction.editReply({
          embeds: [EmbedCreator.Loading(`__Validating!__\r\n>>> The file is currently being processed. Please wait...`)],
        });

        const validAttachments = Array.from(targetMessage.attachments.values()).filter((attachment) =>
          acceptedTypes.some((type) => attachment.name.toLowerCase().includes(type))
        );

        await interaction.editReply({
          embeds: [EmbedCreator.Warning('__Multiple Valid Files!__\r\n>>> Please select the one you would like to be validated!')],
          components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(LogMultiSelect)
                .setPlaceholder('Select a file to analyze')
                .addOptions(
                  validAttachments.map((attachment) =>
                    new StringSelectMenuOptionBuilder().setLabel(attachment.name).setValue(`${targetMessage.id}%${attachment.id}`)
                  )
                )
            ),
          ],
        });

        await Cache.saveProcess(interaction.id, new ProcessCache(targetMessage, interaction));
        return;
      }

      if (attach!.name.toLowerCase().endsWith('.xml') || attach!.name.toLowerCase().endsWith('.meta')) {
        const xmlProc = new XMLProcessor(attach!.url);
        await xmlProc.SendReply(interaction);
        return;
      }

      if (attach!.name.toLowerCase().includes('ragepluginhook')) {
        let rphProc: RPHProcessor;
        const cache = Cache.getProcess(targetMessage.id);
        if (ProcessCache.IsCacheAvailable(cache)) rphProc = cache!.Processor as RPHProcessor;
        else {
          rphProc = new RPHProcessor(await RPHValidator.validate(attach!.url), targetMessage.id);
          await Cache.saveProcess(targetMessage.id, new ProcessCache(targetMessage, interaction, rphProc));
        }
        if (rphProc.log.logModified) return Reports.modifiedLog(interaction, attach!);
        await rphProc.SendReply(interaction).catch(async (e) => {
          await Logger.ErrLog(`Failed to process file!\r\n${e}`);
          await interaction.editReply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
        });
        return;
      }

      if (attach!.name.toLowerCase().includes('els')) {
        let elsProc: ELSProcessor;
        const cache = Cache.getProcess(targetMessage.id);
        if (ProcessCache.IsCacheAvailable(cache)) elsProc = cache!.Processor as ELSProcessor;
        else {
          elsProc = new ELSProcessor(await ELSValidator.validate(attach!.url), targetMessage.id);
          await Cache.saveProcess(targetMessage.id, new ProcessCache(targetMessage, interaction, elsProc));
        }
        await elsProc.SendReply(interaction).catch(async (e) => {
          await Logger.ErrLog(`Failed to process file!\r\n${e}`);
          await interaction.editReply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
        });
        return;
      }

      if (attach!.name.toLowerCase().includes('asiloader')) {
        let asiProc: ASIProcessor;
        const cache = Cache.getProcess(targetMessage.id);
        if (ProcessCache.IsCacheAvailable(cache)) asiProc = cache!.Processor as ASIProcessor;
        else {
          asiProc = new ASIProcessor(await ASIValidator.validate(attach!.url), targetMessage.id);
          await Cache.saveProcess(targetMessage.id, new ProcessCache(targetMessage, interaction, asiProc));
        }
        await asiProc.SendReply(interaction).catch(async (e) => {
          await Logger.ErrLog(`Failed to process file!\r\n${e}`);
          await interaction.editReply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
        });
        return;
      }
    } catch (error) {
      await Logger.ErrLog(`Failed to process file!\r\n${error}`);
      await interaction.editReply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
    }
  }
}
