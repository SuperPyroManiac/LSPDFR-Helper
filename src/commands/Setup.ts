import { Command, Events } from '@sapphire/framework';
import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  ButtonBuilder,
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
    this.originalInteraction = interaction;
    const serv = Cache.getServer(interaction.guildId!);
    interaction.reply({
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

    this.container.client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isButton() && interaction.customId === SetupButton) {
        await this.originalInteraction?.deleteReply().catch(() => {});
        const mdl = new ModalBuilder()
          .setCustomId(SetupModal)
          .setTitle('Bot Settings')
          .addComponents([
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([
              new TextInputBuilder()
                .setCustomId(SetupAhCh)
                .setLabel('AutoHelper Channel ID')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('0 to disable')
                .setRequired(true),
            ]),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([
              new TextInputBuilder()
                .setCustomId(SetupAhMnCh)
                .setLabel('AutoHelper Monitor Channel ID')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('0 to disable')
                .setRequired(true),
            ]),
          ]);
        await interaction.showModal(mdl);
      }
    });

    this.container.client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isModalSubmit() && interaction.customId === SetupModal) {
        await interaction.reply({ embeds: [EmbedCreator.Loading(`__Processing!__\r\n>>> Changing settings in the DB. Please wait...`)], ephemeral: true });
        const ahChInput = interaction.fields.getTextInputValue(SetupAhCh);
        const ahChId = interaction.guild?.channels.cache.get(ahChInput) ? ahChInput : '0';
        const ahMonChInput = interaction.fields.getTextInputValue(SetupAhMnCh);
        const ahMonChId = interaction.guild?.channels.cache.get(ahMonChInput) ? ahMonChInput : '0';
        const servr = Cache.getServer(interaction.guildId!);

        if (!servr) return;
        servr.ahChId = ahChId;
        servr.ahMonChId = ahMonChId;
        await DBManager.editServer(servr);
        await AhChannel.UpdateCaseMsg(interaction.guildId!);
        await CaseMonitor.Update(interaction.guildId!);
        await interaction.editReply({
          embeds: [
            EmbedCreator.Question(
              '__LSPDFR Helper Setup__\n-# Updated your settings!\n\n' +
                `__**Your New Settings:**__\n**AutoHelper Channel ID:** ${servr?.ahChId}\n**Monitor Channel ID:** ${servr?.ahMonChId}`
            ),
          ],
        });
      }
    });
  }
}
