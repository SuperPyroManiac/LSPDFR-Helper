import { Command } from '@sapphire/framework';
import { ApplicationCommandType, ContextMenuCommandType } from 'discord.js';

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

  public override contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
    return interaction.reply({
      content: `Interaction works, ran by ${interaction.user.tag}`,
      ephemeral: true,
    });
  }
}
