import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, MessageContextMenuCommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { ASILog } from '../../../CustomTypes/LogTypes/ASILog';
import { ProcessCache } from '../../../CustomTypes/CacheTypes/ProcessCache';
import { Cache, ProcessorType } from '../../../Cache';
import { EmbedCreator } from '../../Messages/EmbedCreator';
import { LogSendToUser } from '../../../interaction-handlers/_CustomIds';
import { PluginType } from '../../../CustomTypes/Enums/PluginType';
import { Logger } from '../../Messages/Logger';

export class ASIProcessor {
  public log: ASILog;
  public msgId: string;
  private cache!: ProcessCache<ProcessorType>;
  private pluginInfoSent = false;

  public constructor(log: ASILog, msgId: string) {
    this.log = log;
    this.msgId = msgId;
  }

  private GetBaseInfo(): EmbedBuilder {
    const embed = EmbedCreator.Support('__ASI.log Info__').setFooter({
      text: `Loaded ASI Files: ${this.log.loadedAsiFiles.length} - Broken ASI Files: ${this.log.brokenAsiFiles.length} - Processing Time: ${this.log.elapsedTime}MS`,
    });

    embed.data.description +=
      `\n${process.env['INFO']} **__Log Processed!__**\n> -# Log was successfully processed.\n> \n` +
      `> **Valid ASIs:** ${this.log.loadedAsiFiles.length}\n` +
      `> **Broken ASIs:** ${this.log.brokenAsiFiles.length}\n` +
      `> **Faulty ASIs:** ${this.log.failedAsiFiles.length}\n`;

    if (this.log.failedAsiFiles.length) {
      embed.data.description += `\n${process.env['ALERT']} **__ASIs Issues Found!__**\n> -# Some ASIs failed to load! \n> \n> Remove or fix the shown files:\n> ${this.log.failedAsiFiles.map((x) => x.dname).join('**,** ')}\n`;
      if (this.log.failedAsiFiles.some((x) => x.name.toLowerCase() === 'els.asi'))
        embed.data.description += `\n${process.env['WARNING']} **__Possible ELS Issue!__**\n> Ensure that you have installed both [AdvancedHookV.dll](https://www.lcpdfr.com/downloads/gta5mods/scripts/13865-emergency-lighting-system/) & [ScriptHookV](http://dev-c.com/GTAV/scripthookv)!\n`;
      if (this.log.failedAsiFiles.some((x) => x.type === PluginType.SHV))
        embed.data.description += `\n${process.env['WARNING']} **__Possible SHV Issue!__**\n> Ensure you have installed [ScriptHookV](http://dev-c.com/GTAV/scripthookv)!\n`;
    }

    if (this.log.brokenAsiFiles.length)
      embed.data.description += `\n${process.env['ALERT']} **__Broken ASIs Found!__**\n> -# Some ASIs are known to cause issue! Remove the shown files. \n> \n> ${this.log.brokenAsiFiles.join('**,** ')}\n`;

    if (!this.log.brokenAsiFiles.length && !this.log.failedAsiFiles.length)
      embed.data.description += `\n${process.env['SUCCESS']} **__No Issues Detected!__**\n>>> -# All ASI scripts loaded successfully and no issues were detected. If you continue to have issues, you may have an issue with your mods folder or ScriptHookVDotNet!`;

    return embed;
  }

  //! Server Message
  public async SendReply(interaction: MessageContextMenuCommandInteraction | Message | StringSelectMenuInteraction) {
    this.cache = (await Cache.getProcess(this.msgId))!;
    const comps = new ActionRowBuilder<ButtonBuilder>();
    comps.addComponents([new ButtonBuilder().setCustomId(LogSendToUser).setLabel('Send To User').setStyle(ButtonStyle.Danger)]);
    let reply: Message;
    if (interaction instanceof Message) {
      await interaction.reply({ embeds: [this.GetBaseInfo()] });
      if (!this.pluginInfoSent) {
        await Logger.PluginInfo(this.log.missing, [], this.log.downloadLink!, await interaction.channel?.messages.fetch(this.msgId)!);
        this.pluginInfoSent = true;
      }
    } else {
      if (!interaction.guild) reply = await interaction.editReply({ embeds: [this.GetBaseInfo()] });
      else reply = await interaction.editReply({ embeds: [this.GetBaseInfo()], components: [comps] });
      if (!this.pluginInfoSent) {
        await Logger.PluginInfo(this.log.missing, [], this.log.downloadLink!, await interaction.channel?.messages.fetch(this.cache.OriginalMessage.id)!);
        this.pluginInfoSent = true;
      }
      this.msgId = reply.id;
      await Cache.saveProcess(reply.id, new ProcessCache(this.cache.OriginalMessage, interaction, this));
    }
  }

  //! Send To User
  public async SendToUser() {
    this.cache = (await Cache.getProcess(this.msgId))!;
    await this.cache.Interaction.deleteReply().catch(() => {});
    if (this.cache.OriginalMessage) await this.cache.OriginalMessage.reply({ embeds: [this.GetBaseInfo()] });
  }
}
