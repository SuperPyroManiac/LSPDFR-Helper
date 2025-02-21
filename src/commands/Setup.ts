import { Command } from '@sapphire/framework';
import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';

export class SetupCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options, preconditions: ['ServerManager'] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setName('setup')
        .setDescription('Change bot settings.')
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.reply({
      embeds: [
        EmbedCreator.Question(
          '__LSPDFR Helper Setup__\n-# This command has been replaced!\n\n' +
            '>>> There is now a website to manage bot settings.\n\n' +
            '**Click the button below to visit the dashboard!**'
        ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder().setURL('https://www.pyrosfun.com/helper/dash').setLabel('Bot Dashboard').setStyle(ButtonStyle.Link),
        ]),
      ],
      ephemeral: true,
    });
  }
}
