import { MessageContextMenuCommandInteraction, Attachment } from 'discord.js';
import { EmbedCreator } from './EmbedCreator';
import { Logger } from './Logger';

export abstract class Reports {
  static async modifiedLog(interaction: MessageContextMenuCommandInteraction, attach: Attachment) {
    await interaction.editReply({
      embeds: [
        EmbedCreator.Error(
          '__Modified Log__\r\n>>> ' +
            '-# This log is invalid!\r\n' +
            'The selected log has been modified and will not be processed.\r\n' +
            'For more information you can join the bots support server at https://dsc.PyrosFun.com'
        ),
      ],
    });
    await this.sendAbuseMsg('Modified log', interaction, attach);
    return;
  }

  static async largeLog(interaction: MessageContextMenuCommandInteraction, attach: Attachment, extra = false) {
    if (extra) {
      await interaction.reply({
        embeds: [
          EmbedCreator.Error(
            '__Oversized Log__\r\n>>> ' +
              '-# This log is not allowed!\r\n' +
              'This log is much bigger than 3MB and will not be processed.\r\n' +
              'Due to the size, you have been automatically banned.' +
              'For more information you can join the bots support server at https://dsc.PyrosFun.com'
          ),
        ],
      });
    } else {
      await interaction.reply({
        embeds: [
          EmbedCreator.Error(
            '__Oversized Log__\r\n>>> ' +
              '-# This log is not allowed!\r\n' +
              'This log is bigger than 3MB and will not be processed.\r\n' +
              'For more information you can join the bots support server at https://dsc.PyrosFun.com'
          ),
        ],
      });
    }
    await this.sendAbuseMsg('Oversized log', interaction, attach);
    return;
  }

  private static async sendAbuseMsg(reason: string, interaction: MessageContextMenuCommandInteraction, attach: Attachment) {
    let chName = 'User CMD';
    if (interaction.channel && !interaction.channel.isDMBased()) chName = interaction.channel.name;
    const emb = EmbedCreator.Alert(
      '__Possible Abuse__\r\n>>> ' +
        `**User:** ${interaction.user.username} (${interaction.user.id})\r\n` +
        `**Server:** ${interaction.guild?.name} (${interaction.guild?.id})\r\n` +
        `**Channel:** ${chName} (${interaction.channel?.id})\r\n` +
        `**Log Size:** ${(attach.size / 1000000).toFixed(2)}MB\r\n` +
        `**Reason:** ${reason}\r\n`
    );
    emb.setDescription(emb.data.description?.replaceAll('undefined', 'User CMD')!);
    await Logger.UserLog(emb, attach);
  }
}
