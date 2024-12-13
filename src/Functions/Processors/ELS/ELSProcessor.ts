import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  inlineCode,
  Message,
  MessageContextMenuCommandInteraction,
  StringSelectMenuInteraction,
} from 'discord.js';
import { ELSLog } from '../../../CustomTypes/LogTypes/ELSLog';
import { ProcessCache } from '../../../CustomTypes/CacheTypes/ProcessCache';
import { Cache, ProcessorType } from '../../../Cache';
import { EmbedCreator } from '../../Messages/EmbedCreator';
import { LogSendToUser } from '../../../interaction-handlers/_CustomIds';

export class ELSProcessor {
  public log: ELSLog;
  public msgId: string;
  private cache!: ProcessCache<ProcessorType>;

  public constructor(log: ELSLog, msgId: string) {
    this.log = log;
    this.msgId = msgId;
  }

  private GetBaseInfo(): EmbedBuilder {
    const embed = EmbedCreator.Support('__ELS.log Info__').setFooter({
      text: `ELS Version: ${this.log.elsVersion} - AdvancedHookV installed: ${this.log.ahvFound ? '✓' : '❌'} - Processing Time: ${this.log.elapsedTime}MS`,
    });

    if (this.log.faultyElsVcf) {
      embed.data.description += `\n${process.env['ALERT']} **__Faulty VCF Found!__**\n>>> -# There is an issue with this file, and ELS cannot load!\n\n${inlineCode(`ELS/pack_default/${this.log.faultyElsVcf}`)}\nRemove or fix the shown file.\nDue to how ELS loads, we can only show one file at a time!`;
      return embed;
    }

    if (!this.log.invalidElsVcfs.length && !this.log.faultyElsVcf) {
      embed.data.description += `\n${process.env['SUCCESS']} **__No Issues Detected!__**\n>>> -# ELS loaded successfully and no issues were detected. If you continue to have issues, you may send your ASILoader.log to verify your ASI scripts.`;
      return embed;
    }

    embed.data.description +=
      `\n${process.env['INFO']} **__Log Processed!__**\n>>> -# Log was successfully processed.\n\n` +
      `**Valid VCFs:** ${this.log.validElsVcfs.length}\n` +
      `**Invalid VCFs:** ${this.log.invalidElsVcfs.length}\n` +
      `**Faulty VCFs:** ${this.log.faultyElsVcf ? 'Yes' : 'No'}\n`;

    return embed;
  }

  private GetVCFInfo(): EmbedBuilder {
    const vcfEmb = EmbedCreator.Support('__VCF Information:__\n*File Path: GTAV/ELS/pack_default*\n');

    if (this.log.validElsVcfs.length) {
      const displayVcfs = this.log.validElsVcfs.slice(0, 30);
      const remaining = this.log.validElsVcfs.length - 30;
      const remainingText = remaining > 0 ? `\n> *...and ${remaining} more files*` : '';

      vcfEmb.data.description += `\n${process.env['SUCCESS']} **__Valid VCFs:__**\n> -# These VCFs are working correctly.\n> \n> ${displayVcfs.join('**,** ')}${remainingText}\n`;
    }

    if (this.log.invalidElsVcfs.length)
      vcfEmb.data.description += `\n${process.env['WARNING']} **__Unused VCFs:__**\n> -# These VCFs are not being used and can be safely removed.\n> \n> ${this.log.invalidElsVcfs.join('**,** ')}\n`;

    if (vcfEmb.data.description!.length > 4000) {
      const overflowMessage = `\n\n**${process.env['ERROR']} __Too Much To Display!__**\n-# You have too many files for us to display at once! Fix what is shown and send a new log.\n`;
      const maxLength = 3600 - overflowMessage.length;
      vcfEmb.data.description = vcfEmb.data.description!.substring(0, maxLength) + overflowMessage;
    }
    return vcfEmb;
  }

  //! Server Message
  public async SendReply(interaction: MessageContextMenuCommandInteraction | Message | StringSelectMenuInteraction) {
    const embs = [this.GetBaseInfo(), this.GetVCFInfo()];
    if (!this.log.invalidElsVcfs.length && !this.log.validElsVcfs.length) embs.splice(1, 1);
    if (this.log.faultyElsVcf) embs.splice(1, 1);

    this.cache = Cache.getProcess(this.msgId)!;
    const comps = new ActionRowBuilder<ButtonBuilder>();
    comps.addComponents([new ButtonBuilder().setCustomId(LogSendToUser).setLabel('Send To User').setStyle(ButtonStyle.Danger)]);
    let reply: Message;
    if (interaction instanceof Message) {
      await interaction.reply({ embeds: embs });
    } else {
      if (!interaction.guild) reply = await interaction.editReply({ embeds: embs });
      else reply = await interaction.editReply({ embeds: embs, components: [comps] });
      this.msgId = reply.id;
      await Cache.saveProcess(reply.id, new ProcessCache(this.cache.OriginalMessage, interaction, this));
    }
  }

  //! Send To User
  public async SendToUser() {
    const embs = [this.GetBaseInfo(), this.GetVCFInfo()];
    if (!this.log.invalidElsVcfs.length && !this.log.validElsVcfs.length) embs.splice(1, 1);
    if (this.log.faultyElsVcf) embs.splice(1, 1);

    this.cache = Cache.getProcess(this.msgId)!;
    await this.cache.Interaction.deleteReply().catch(() => {});
    if (this.cache.OriginalMessage) await this.cache.OriginalMessage.reply({ embeds: embs });
  }
}
