import { Command } from '@sapphire/framework';
import { ApplicationCommandType, Attachment, ContextMenuCommandType, inlineCode, Message } from 'discord.js';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Logger } from '../Functions/Messages/Logger';
import { RPHValidator } from '../Functions/RPH/RPHValidator';
import { Cache } from '../Cache';
import { ProcessCache } from '../CustomTypes/CacheTypes/ProcessCache';
import { RPHProcessor } from '../Functions/Processors/RPH/RPHProcessor';
import { RPHLog } from '../CustomTypes/LogTypes/RPHLog';

export class ValidateFilesCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options, description: 'Validate the selected files.' });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerContextMenuCommand((builder) => builder.setName('Validate Files').setType(ApplicationCommandType.Message as ContextMenuCommandType));
  }

  public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
    const targetMessage: Message = await interaction.channel!.messages.fetch(interaction.targetId);
    const acceptedTypes = ['ragepluginhook', 'els', 'asiloader', 'scripthookvdotnet', '.xml', '.meta'];
    let attach: Attachment | undefined;

    if (targetMessage.attachments.size === 0) {
      // prettier-ignore
      await interaction.reply({embeds: [EmbedCreator.Error('__No File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- ScriptHookVDotNet.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')], ephemeral: true});
      return;
    } else if (targetMessage.attachments.size === 1) {
      attach = targetMessage.attachments.first()!;
      if (attach.size / 1000000 > 10) {
        // prettier-ignore
        await interaction.reply({embeds: [EmbedCreator.Error('__Blacklisted!__\r\n>>> You have sent a log bigger than 10MB! Your access to the bot has been revoked. You can appeal this at https://dsc.PyrosFun.com')]});
        // prettier-ignore
        Logger.UserLog(EmbedCreator.Warning(`__Possible Abuse__\r\n>>> **User:** ${interaction.user.tag} (${interaction.user.id})\r\n**File Size:** ${attach.size / 1000000}MB\r\n**Server:** ${interaction.guild?.name} (${interaction.guild?.id})\r\n**Channel:** ${() => {if (!interaction.channel!.isDMBased()){interaction.channel!.name;}}}\r\nUser sent a log greater than 3MB!`), attach)
        //TODO: ADD BLACKLIST FUNCTION
        return;
      } else if (attach.size / 1000000 > 3) {
        // prettier-ignore
        await interaction.reply({embeds: [EmbedCreator.Warning('__Skipped!__\r\n>>> You have sent a log bigger than 3MB! We do not support logs greater than 3MB.')]});
        // prettier-ignore
        Logger.UserLog(EmbedCreator.Warning(`__Possible Abuse__\r\n>>> **User:** ${interaction.user.tag} (${interaction.user.id})\r\n**File Size:** ${attach.size / 1000000}MB\r\n**Server:** ${interaction.guild?.name} (${interaction.guild?.id})\r\n**Channel:** ${interaction.channel?.id}\r\nUser sent a log greater than 3MB!`), attach)
        return;
      }
    } else if (targetMessage.attachments.size > 1) {
      // prettier-ignore
      await interaction.reply({embeds: [EmbedCreator.Error('__Multiple Files Found!__\r\n>>> The selected message must include only a single valid log type! The multi selector is implimented yet.')]});
      return;
    }

    if (!attach) {
      // prettier-ignore
      await interaction.reply({embeds: [EmbedCreator.Error('__No File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- ScriptHookVDotNet.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')], ephemeral: true});
      return;
    }
    if (!acceptedTypes.filter((x) => x.toLocaleLowerCase().includes(attach.name.toLowerCase()))) {
      this.container.logger.warn(`${attach.name.toLowerCase()} Types: ${acceptedTypes.join(', ')}`);
      // prettier-ignore
      await interaction.reply({embeds: [EmbedCreator.Error('__No Valid File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- ScriptHookVDotNet.log\r\n- asiloader.log\r\n- .xml\r\n- .meta')], ephemeral: true});
      return;
    }

    if (attach.name.toLowerCase().includes('ragepluginhook')) {
      await interaction.reply({ embeds: [EmbedCreator.Loading(`__Validating!__\r\n>>> The file is currently being processed. Please wait...`)] });
      let proc: RPHProcessor;
      if (!ProcessCache.IsCacheAvailable(Cache.getProcess(targetMessage.id))) {
        const proc = new RPHProcessor(await new RPHValidator().validate(attach.url), targetMessage.id);
        Cache.saveProcess(targetMessage.id, new ProcessCache(targetMessage, proc));
      }

      //TODO: DEBUG - Replace with propper message handler
      const log = proc!.log;
      // prettier-ignore
      await interaction.editReply({embeds: [EmbedCreator.Success(`__Validated!__\r\n>>> Time Taken: ${log.elapsedTime}MS\r\nPlugins: ${log.current.length + log.outdated.length}\r\nErrors:  ${log.errors.length}`), EmbedCreator.Info(`__Current Plugins__\r\n${log.current.map((x) => `**${x.name}** - ${x.version}`).join('\r\n')}`), EmbedCreator.Warning(`__Outdated Plugins__\r\n${log.outdated.map((x) => `**${x.name}** - ${x.version}`).join('\r\n')}`), EmbedCreator.Warning(`__Errors__\r\n>>> ${log.errors.map((x) => `**${inlineCode(`${x.level} ID: ${x.id}`)}**\r\n${x.solution}`).join('\r\n\r\n')}`)]});
    }
  }
}
