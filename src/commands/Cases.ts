import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Cache } from '../Cache';
import { Logger } from '../Functions/Messages/Logger';

export class CasesCommand extends Subcommand {
  public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: 'cases',
      subcommands: [
        {
          name: 'join',
          chatInputRun: 'caseJoin',
        },
        {
          name: 'find',
          chatInputRun: 'caseFind',
        },
        {
          name: 'close',
          chatInputRun: 'caseClose',
        },
      ],
    });
  }

  registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('cases')
        .setDescription('Case commands')
        .addSubcommand((command) => command.setName('join').setDescription('Joins an existing case.'))
        .addSubcommand((command) => command.setName('find').setDescription('Finds all cases from a user.'))
        .addSubcommand((command) => command.setName('close').setDescription('Closes a case.'))
    );
  }

  public async caseJoin(interaction: Subcommand.ChatInputCommandInteraction) {}

  public async caseFind(interaction: Subcommand.ChatInputCommandInteraction) {}

  public async caseClose(interaction: Subcommand.ChatInputCommandInteraction) {}
}
