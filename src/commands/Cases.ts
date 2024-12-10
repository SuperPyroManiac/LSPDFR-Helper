import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Cache } from '../Cache';
import { Logger } from '../Functions/Messages/Logger';
import { AutocompleteInteraction } from 'discord.js';

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
          preconditions: ['ServerManager'],
        },
      ],
    });
  }

  registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('cases')
        .setDescription('Case commands')
        .addSubcommand((command) =>
          command
            .setName('join')
            .setDescription('Joins an existing case.')
            .addStringOption((x) => x.setName('caseid').setDescription('ID of the case to join').setRequired(true).setAutocomplete(true))
        )
        .addSubcommand((command) =>
          command
            .setName('find')
            .setDescription('Finds all cases from a user.')
            .addUserOption((x) => x.setName('user').setDescription('User to find cases for').setRequired(true))
        )
        .addSubcommand((command) =>
          command
            .setName('close')
            .setDescription('Closes a case.')
            .addStringOption((x) => x.setName('caseid').setDescription('ID of the case to join').setRequired(true).setAutocomplete(true))
        )
    );
  }

  public async autocompleteRun(interaction: AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'join' || subcommand === 'close') {
      // Return list of open cases
      const openCases = Cache.getCases().filter((x) => x.open && x.serverId === interaction.guildId);
      return interaction.respond(openCases.map((c) => ({ name: c.id, value: c.id })).slice(0, 25));
    }
  }

  public async caseJoin(interaction: Subcommand.ChatInputCommandInteraction) {
    console.log('Case Join ' + interaction.options.getString('caseid'));
  }

  public async caseFind(interaction: Subcommand.ChatInputCommandInteraction) {
    console.log('Case Find ' + interaction.options.getUser('user')?.displayName);
  }

  public async caseClose(interaction: Subcommand.ChatInputCommandInteraction) {
    console.log('Case Close ' + interaction.options.getString('caseid'));
  }
}
