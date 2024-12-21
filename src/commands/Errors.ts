import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { Cache } from '../Cache';
import { Logger } from '../Functions/Messages/Logger';

export class ErrorsCommand extends Subcommand {
  public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: 'errors',
      subcommands: [
        {
          name: 'add',
          chatInputRun: 'errorsAdd',
        },
        {
          name: 'edit',
          chatInputRun: 'errorsEdit',
        },
        {
          name: 'remove',
          chatInputRun: 'errorsRemove',
        },
        {
          name: 'export',
          chatInputRun: 'errorsExport',
        },
      ],
    });
  }

  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName('errors')
          .setDescription('Error commands')
          .addSubcommand((command) => command.setName('add').setDescription('Adds an error to the database!'))
          .addSubcommand((command) => command.setName('edit').setDescription('Edits an error in the database!'))
          .addSubcommand((command) => command.setName('remove').setDescription('Removes an error from the database!'))
          .addSubcommand((command) => command.setName('export').setDescription('Exports all errors to a json file!')),
      { guildIds: [process.env['MAIN_SERVER'] as string] }
    );
  }

  public async errorsAdd(_interaction: Subcommand.ChatInputCommandInteraction) {}
  public async errorsEdit(_interaction: Subcommand.ChatInputCommandInteraction) {}
  public async errorsRemove(_interaction: Subcommand.ChatInputCommandInteraction) {}

  public async errorsExport(interaction: Subcommand.ChatInputCommandInteraction) {
    await Logger.BotLog(
      EmbedCreator.Warning(`__Exported ${(await Cache.getErrors()).length} Errors!__\r\n> Requested by ${interaction.user.tag} in <#${interaction.channelId}>`)
    );
    return interaction.reply({
      embeds: [EmbedCreator.Success(`__Exported ${(await Cache.getErrors()).length} Errors!__\r\n-# Ensure these do not get leaked!`)],
      files: [
        {
          attachment: Buffer.from(JSON.stringify(Cache.getErrors(), null, 2), 'utf-8'),
          name: 'errors.json',
        },
      ],
      ephemeral: true,
    });
  }
}
