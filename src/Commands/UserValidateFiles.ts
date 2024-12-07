import { Command } from '@sapphire/framework';
import { ApplicationCommandType, ApplicationIntegrationType, Attachment, ContextMenuCommandType, Message, MessageContextMenuCommandInteraction } from 'discord.js';
import { ProcessCache } from '../CustomTypes/CacheTypes/ProcessCache';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Reports } from '../Functions/Messages/Reports';
import { RPHProcessor } from '../Functions/Processors/RPH/RPHProcessor';
import { RPHValidator } from '../Functions/Processors/RPH/RPHValidator';
import { Cache } from '../Cache';
import { Logger } from '../Functions/Messages/Logger';
import { XMLProcessor } from '../Functions/Processors/XML/XMLProcessor';

export class UserValidateFilesCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options, description: 'Validate the selected files.' });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerContextMenuCommand((builder) =>
      builder
        .setName('USER Validate Files')
        .setType(ApplicationCommandType.Message as ContextMenuCommandType)
        .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
    );
  }

  public override async contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
    await interaction.reply({ embeds: [EmbedCreator.Loading(`__Validating!__\r\n>>> The file is currently being processed. Please wait...`)], ephemeral: true });

    const targetMessage: Message = interaction.targetMessage;
    const acceptedTypes = ['ragepluginhook', 'els.log', 'asiloader.log', 'scripthookvdotnet.log', '.xml', '.meta'];
    let attach: Attachment | undefined;

    if (targetMessage.attachments.size === 0) {
      // prettier-ignore
      await interaction.editReply({embeds: [EmbedCreator.Error('__No File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- ScriptHookVDotNet.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')]});
      return;
    } else if (targetMessage.attachments.size === 1) {
      attach = targetMessage.attachments.first();

      if (!attach) {
        // prettier-ignore
        await interaction.editReply({embeds: [EmbedCreator.Error('__No File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- ScriptHookVDotNet.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')]});
        return;
      }

      if (!acceptedTypes.some((x) => attach!.name.toLowerCase().includes(x))) {
        // prettier-ignore
        await interaction.editReply({embeds: [EmbedCreator.Error('__No Valid File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- ScriptHookVDotNet.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')]});
        return;
      }

      if (attach.size / 1000000 > 10) {
        Reports.largeLog(interaction, attach, true);
        //TODO: ADD BLACKLIST FUNCTION
        return;
      } else if (attach.size / 1000000 > 3) {
        Reports.largeLog(interaction, attach);
        return;
      }
    } else if (targetMessage.attachments.size > 1) {
      // prettier-ignore
      await interaction.editReply({embeds: [EmbedCreator.Error('__Multiple Files Found!__\r\n>>> The selected message must include only a single valid log type! The multi selector is implimented yet.')]});
      return;
    }

    if (attach!.name.toLowerCase().endsWith('.xml') || attach!.name.toLowerCase().endsWith('.meta')) {
      const xmlProc = new XMLProcessor(attach!.url);
      await xmlProc.SendReply(interaction);
      return;
    }

    if (attach!.name.toLowerCase().includes('ragepluginhook')) {
      await interaction.reply({ embeds: [EmbedCreator.Loading(`__Validating!__\r\n>>> The file is currently being processed. Please wait...`)], ephemeral: true });
      let rphProc: RPHProcessor;
      const cache = Cache.getProcess(targetMessage.id);
      if (ProcessCache.IsCacheAvailable(cache)) rphProc = cache!.Processor;
      else {
        rphProc = new RPHProcessor(await RPHValidator.validate(attach!.url), targetMessage.id);
        Cache.saveProcess(targetMessage.id, new ProcessCache(targetMessage, interaction, rphProc));
      }
      if (rphProc.log.logModified) {
        Reports.modifiedLog(interaction, attach!);
        return;
      }
      await rphProc.SendServerContextReply(interaction, true).catch(async (e) => {
        await Logger.ErrLog(`Failed to process file!\r\n${e}`);
        await interaction.editReply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
      });
      return;
    }
  }
}
