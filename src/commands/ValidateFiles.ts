import { Command } from '@sapphire/framework';
import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  Attachment,
  ButtonBuilder,
  ButtonStyle,
  ContextMenuCommandType,
  Message,
  MessageContextMenuCommandInteraction,
} from 'discord.js';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Logger } from '../Functions/Messages/Logger';
import { Cache } from '../Cache';
import { ProcessCache } from '../CustomTypes/CacheTypes/ProcessCache';
import { RPHProcessor } from '../Functions/Processors/RPH/RPHProcessor';
import { RPHValidator } from '../Functions/Processors/RPH/RPHValidator';
import { Reports } from '../Functions/Messages/Reports';
import { XMLProcessor } from '../Functions/Processors/XML/XMLProcessor';
import { UsersValidation } from '../Functions/Validations/Users';
import { ActionRowBuilder } from '@discordjs/builders';

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
    await interaction.reply({ embeds: [EmbedCreator.Loading(`__Validating!__\r\n>>> The file is currently being processed. Please wait...`)], ephemeral: true });

    const targetMessage: Message = interaction.targetMessage;
    const sender = Cache.getUser(interaction.user.id);
    const acceptedTypes = ['ragepluginhook', 'els.log', 'asiloader.log', 'scripthookvdotnet.log', '.xml', '.meta'];
    let attach: Attachment | undefined;

    if (!sender) await UsersValidation.AddMissing();
    if (sender!.banned) {
      await interaction.editReply({
        embeds: [
          EmbedCreator.Error(
            `__Banned!__\r\n-# You are banned from using this bot!\r\n>>> It has been determined that you abused the features of this bot and your access revoked! You may dispute this by vising our Discord.`
          ),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setURL('https://dsc.pyrosfun.com/').setLabel('Pyros Discord').setStyle(ButtonStyle.Link),
          ]),
        ],
      });
      return;
    }

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
      await rphProc.SendServerContextReply(interaction).catch(async (e) => {
        await Logger.ErrLog(`Failed to process file!\r\n${e}`);
        await interaction.editReply({ embeds: [EmbedCreator.Error(`__Failed to process file!__\r\n>>> The error has been sent to the bot developer!`)] });
      });
      return;
    }
  }
}
