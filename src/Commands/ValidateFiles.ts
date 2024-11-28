import { Command } from '@sapphire/framework';
import { ApplicationCommandType, ContextMenuCommandType, MessagePayload } from 'discord.js';

export class SlashCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      description: 'Delete message and ban author.',
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerContextMenuCommand((builder) =>
      builder //
        .setName('Validate Files')
        .setType(ApplicationCommandType.Message as ContextMenuCommandType)
    );
  }

  public override contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
    return interaction.reply({
      content: `Interaction works, ran by ${interaction.user.tag}`,
      ephemeral: true,
    });
  }
}
