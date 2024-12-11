import { Command, Events } from '@sapphire/framework';
import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Cache } from '../Cache';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';
import { SetupAhCh, SetupAhMnCh, SetupButton, SetupModal } from '../interaction-handlers/_CustomIds';
import { DBManager } from '../Functions/DBManager';
import { AhChannel } from '../Functions/AutoHelper/AhChannel';
import { CaseMonitor } from '../Functions/AutoHelper/CaseMonitor';
import { ProcessCache } from '../CustomTypes/CacheTypes/ProcessCache';

export class SetupCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { ...options });
  }
  private originalInteraction: Command.ChatInputCommandInteraction | null = null;

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setName('setup')
        .setDescription('Change bot settings.')
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const serv = Cache.getServer(interaction.guildId!);
    const imsg = await interaction.reply({
      embeds: [
        EmbedCreator.Question(
          '__LSPDFR Helper Setup__\n-# Here is some info on your settings!\n\n' +
            '>>> **AutoHelper Channel:** This is the channel ID that the AutoHelper message will be posted in! To disable set it to 0\n\n' +
            '**Monitor Channel:** This is the channel ID that the AutoHelper monitor will be posted in. Set to 0 to disable! (The monitor shows all open cases!)\n\n' +
            `__**Your Current Settings:**__\n**AutoHelper Channel ID:** ${serv?.ahChId}\n**Monitor Channel ID:** ${serv?.ahMonChId}\n\n-# Click the button below to change these!`
        ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder().setCustomId(SetupButton).setLabel('Change Settings').setStyle(ButtonStyle.Success),
        ]),
      ],
      ephemeral: true,
    });
    const msg = await imsg.fetch();
    Cache.saveProcess(msg.id, new ProcessCache<undefined>(msg, interaction, undefined));
  }
}
