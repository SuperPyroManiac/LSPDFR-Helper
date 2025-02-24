import { MessageContextMenuCommandInteraction, Attachment, Message, StringSelectMenuInteraction } from 'discord.js';
import { EmbedCreator } from './EmbedCreator';
import { Logger } from './Logger';
import { Cache } from '../../Cache';
import { DBManager } from '../DBManager';

type ReportInteraction = MessageContextMenuCommandInteraction | Message | StringSelectMenuInteraction;

const SUPPORT_SERVER_URL = 'https://dsc.PyrosFun.com';
const ERROR_MESSAGES = {
  MODIFIED: `__Modified Log__\n>>> -# This log is invalid!\nThe selected log has been modified or is invalid It will not be processed.\nFor more information you can join the bots support server at ${SUPPORT_SERVER_URL}`,
  OVERSIZED: `__Oversized Log__\n>>> -# This log is not allowed!\nThis log is bigger than 5MB and will not be processed.\nFor more information you can join the bots support server at ${SUPPORT_SERVER_URL}`,
  OVERSIZED_BAN: `__Oversized Log__\n>>> -# This log is not allowed!\nThis log is much bigger than 5MB and will not be processed.\nDue to the size, you have been automatically banned. For more information you can join the bots support server at ${SUPPORT_SERVER_URL}`,
};

export class Reports {
  public static async modifiedLog(interaction: ReportInteraction, attach: Attachment): Promise<void> {
    if (interaction instanceof Message) {
      await interaction.reply({
        embeds: [EmbedCreator.Error(ERROR_MESSAGES.MODIFIED)],
      });
    } else {
      await interaction.editReply({
        embeds: [EmbedCreator.Error(ERROR_MESSAGES.MODIFIED)],
      });
    }
    await this.sendAbuseMsg('Modified log', interaction, attach);
  }

  public static async largeLog(interaction: ReportInteraction, attach: Attachment, extra = false): Promise<void> {
    const response = {
      embeds: [EmbedCreator.Error(extra ? ERROR_MESSAGES.OVERSIZED_BAN : ERROR_MESSAGES.OVERSIZED)],
    };

    if (interaction instanceof Message) {
      await interaction.reply(response);
    } else {
      await interaction.editReply(response);
    }

    if (extra) {
      const userId = interaction.member?.user.id;
      const user = userId ? Cache.getUser(userId) : null;

      if (user) {
        user.banned = true;
        await DBManager.editUser(user);
      }
    }

    await this.sendAbuseMsg('Oversized log', interaction, attach);
  }

  public static async sendAbuseMsg(reason: string, interaction: ReportInteraction, attach: Attachment): Promise<void> {
    let chName = 'User CMD';
    if (interaction.channel && !interaction.channel.isDMBased()) chName = interaction.channel.name;
    const fileSize = (attach.size / 1000000).toFixed(2);

    const embedDescription =
      '__Possible Abuse__\n>>> ' +
      `**User:** ${interaction.member?.user.username ?? 'Unknown'} (${interaction.member?.user.id ?? 'Unknown'})\n` +
      `**Server:** ${interaction.guild?.name ?? 'DM'} (${interaction.guild?.id ?? 'N/A'})\n` +
      `**Channel:** ${chName} (${interaction.channel?.id ?? 'N/A'})\n` +
      `**Log Size:** ${fileSize}MB\n` +
      `**Reason:** ${reason}\n`;

    const emb = EmbedCreator.Alert(embedDescription);
    await Logger.UserLog(emb, attach);
  }
}
