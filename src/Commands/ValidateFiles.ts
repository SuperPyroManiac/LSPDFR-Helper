import { Command } from '@sapphire/framework';
import { ApplicationCommandType, Attachment, ContextMenuCommandType, Message } from 'discord.js';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Logger } from '../Functions/Messages/Logger';

export class ValidateFilesCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Validate the selected files.',
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerContextMenuCommand((builder) =>
      builder //
        .setName('Validate Files')
        .setType(ApplicationCommandType.Message as ContextMenuCommandType)
    );
  }

  public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
    const targetMessage: Message = await interaction.channel!.messages.fetch(interaction.targetId);
    const acceptedTypes = ['RagePluginHook', 'ELS', 'asiloader', 'ScriptHookVDotNet', '.xml', '.meta'];
    let attach: Attachment;

    //! Attachment Processing
    if (targetMessage.attachments.size === 0) {
      // prettier-ignore
      await interaction.reply({embeds: [EmbedCreator.Error('__No File Found!__\r\n>>> The selected message must include a valid log type!\r\n- RagePluginHook.log\r\n- ELS.log\r\n- ScriptHookVDotNet.log\r\n- asiloader.log')]});
      return;
    } else if (targetMessage.attachments.size === 1) {
      attach = targetMessage.attachments.first()!;
      if (attach.size / 1000000 > 10) {
        // prettier-ignore
        await interaction.reply({embeds: [EmbedCreator.Error('__Blacklisted!__\r\n>>> You have sent a log bigger than 10MB! Your access to the bot has been revoked. You can appeal this at https://dsc.PyrosFun.com')]});
        // prettier-ignore
        Logger.UserLog(EmbedCreator.Warning(`__Possible Abuse__\r\n
          >>> **User:** ${interaction.user.tag} (${interaction.user.id})\r\n
           **File Size:** ${attach.size / 1000000}MB\r\n
           **Server:** ${interaction.guild?.name} (${interaction.guild?.id})\r\n
           **Channel:** ${() => {if (!interaction.channel!.isDMBased()){interaction.channel!.name;}}}\r\n
           User sent a log greater than 3MB!`), attach)
        //TODO: ADD BLACKLIST FUNCTION
        return;
      } else if (attach.size / 1000000 > 3) {
        // prettier-ignore
        await interaction.reply({embeds: [EmbedCreator.Warning('__Skipped!__\r\n>>> You have sent a log bigger than 3MB! We do not support logs greater than 3MB.')]});
        // prettier-ignore
        Logger.UserLog(EmbedCreator.Warning(`__Possible Abuse__\r\n>>> **User:** ${interaction.user.tag} (${interaction.user.id})\r\n**File Size:** ${attach.size / 1000000}MB\r\n**Server:** ${interaction.guild?.name} (${interaction.guild?.id})\r\n**Channel:** ${interaction.channel?.id}\r\nUser sent a log greater than 3MB!`), attach)
        return;
      }
    }
  }
}
