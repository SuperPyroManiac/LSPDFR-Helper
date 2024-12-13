import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, MessageContextMenuCommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { Cache, ProcessorType } from '../../../Cache';
import { PluginType } from '../../../CustomTypes/Enums/PluginType';
import { State } from '../../../CustomTypes/Enums/State';
import { RPHLog } from '../../../CustomTypes/LogTypes/RPHLog';
import { EmbedCreator } from '../../Messages/EmbedCreator';
import { ProcessCache } from '../../../CustomTypes/CacheTypes/ProcessCache';
import { Level } from '../../../CustomTypes/Enums/Level';
import { LogSendToUser } from '../../../interaction-handlers/_CustomIds';
import { inlineCodeBlock } from '@sapphire/utilities';
import { Logger } from '../../Messages/Logger';

export class RPHProcessor {
  public log: RPHLog;
  public msgId: string;
  private cache!: ProcessCache<ProcessorType>;
  private currentPlugins?: string;
  private outdatedPlugins?: string;
  private removePlugins?: string;
  private rphPlugins?: string;
  private gtaVer = '❌';
  private lspdfrVer = '❌';
  private rphVer = '❌';
  private pluginInfoSent = false;

  public constructor(log: RPHLog, mesgId: string) {
    this.log = log;
    this.msgId = mesgId;
    //prettier-ignore
    {
    this.currentPlugins = log.current.map((x) => x.dname).join('**,** ');
    this.outdatedPlugins = log.outdated.map((x) => x.linkedName()).join('**,** ');
    this.rphPlugins = log.current.filter((x) => x.type === PluginType.RPH).map((x) => x.dname).join('**,** ');
    this.removePlugins = log.current.filter((x) => x.state === State.BROKEN || x.type === PluginType.LIBRARY).map((x) => x.dname).join('**,** ');
    this.gtaVer = Cache.getPlugin('GrandTheftAuto5')?.version === log.gtaVersion ? '✓' : '❌';
    this.lspdfrVer = Cache.getPlugin('LSPDFR')?.version === log.lspdfrVersion ? '✓' : '❌';
    this.rphVer = Cache.getPlugin('RagePluginHook')?.version === log.rphVersion ? '✓' : '❌';
    }
  }

  private GetBaseInfo(): EmbedBuilder {
    const emb = EmbedCreator.Support('__RPH.log Info__').setFooter({
      text: `GTA: ${this.gtaVer} - LSPDFR: ${this.lspdfrVer} - RPH: ${this.rphVer} - Processing Time: ${this.log.elapsedTime}MS`,
    });

    if (!this.log.lspdfrVersion) {
      emb.data.description += `\n${process.env['ALERT']} **__LSPDFR Did Not Load!__**\n>>> -# LSPDFR is not running in the provided log. It is very likely you have an issue with your mods folder! It could also be caused by an .ASI script, or ScriptHookVDotNet if you have that!`;
      return emb;
    }

    //prettier-ignore
    if (!this.outdatedPlugins?.length && !this.removePlugins?.length && !this.log.errors.some(error => error.level === Level.CRITICAL || error.level === Level.SEVERE)) {
      emb.data.description += `\n${process.env['SUCCESS']} **__No Issues Detected!__**\n>>> -# LSPDFR loaded successfully and no errors were detected. If you do have issues, it would most likely be related to the mods folder.`;
    return emb;
    }

    emb.data.description +=
      `\n${process.env['INFO']} **__Log Processed!__**\n>>> -# Log was successfully processed.\n\n` +
      `**LSPDFR Plugins:** ${this.log.current.filter((x) => x.type !== PluginType.RPH).length + this.log.outdated.filter((x) => x.type !== PluginType.RPH).length}\n` +
      `**RPH Plugins:** ${this.log.current.filter((x) => x.type === PluginType.RPH).length}\n` +
      `**Possible Issues:** ${this.log.errors.length}\n`;

    return emb;
  }

  private GetPluginInfo(): EmbedBuilder {
    const plugEmb = EmbedCreator.Support('__Plugin Information:__\n*Plugin Path: GTAV/Plugins/LSPDFR*\n');
    if (this.outdatedPlugins?.length)
      plugEmb.data.description += `\n${process.env['WARNING']} **__Update These Plugins:__**\n> -# These should be updated to ensure stability!\n> \n> ${this.outdatedPlugins}\n`;
    if (this.removePlugins?.length)
      plugEmb.data.description += `\n${process.env['ALERT']} **__Remove These Plugins:__**\n> -# These are either known to cause issue, or are installed incorrectly. Use /CheckPlugin for more info!\n> \n> ${this.removePlugins}\n`;
    if (this.currentPlugins?.length && !this.outdatedPlugins?.length && !this.removePlugins?.length && this.log.lspdfrVersion)
      plugEmb.data.description += `\n${process.env['SUCCESS']} **__All Plugins Up To Date!:__**\n> -# Good job! This helps ensure your game runs well.\n`;
    if (!this.currentPlugins?.length && !this.outdatedPlugins?.length && !this.removePlugins?.length && this.log.lspdfrVersion)
      plugEmb.data.description += `\n${process.env['INFO']} **__No Plugins Loaded!__**\n> -# You do not appear to have any LSPDFR plugins installed. No plugin info can be provided here.\n`;
    if (!this.log.lspdfrVersion)
      plugEmb.data.description += `\n${process.env['INFO']} **__LSPDFR Not Loaded!__**\n> -# LSPDFR is not loaded in this log! No plugin info can be provided here.\n`;
    if (!this.currentPlugins?.length) this.currentPlugins = '**None**';
    if (!this.rphPlugins?.length) this.rphPlugins = '**None**';
    return plugEmb;
  }

  private GetErrorInfo(): EmbedBuilder {
    const errEmb = EmbedCreator.Support('__Error Information:__\n*This shows common issues that were detected.*\n');
    const update = this.log.errors.some((x) => x.level === Level.CRITICAL);
    let cnt = 0;
    for (const err of this.log.errors.filter((x) => x.level !== Level.XTRA)) {
      if (cnt >= 10) {
        errEmb.addFields({
          name: `${process.env['ERROR']} Too Many Errors!`,
          value: '> You have more errors than we can display at once! Fix the shown ones, then send a new log.',
        });
        return errEmb;
      }
      if (update && err.level !== Level.CRITICAL) continue;
      errEmb.addFields({
        //prettier-ignore
        name: `${err.level === Level.XTRA ? process.env['INFO'] : err.level === Level.WARN ? process.env['WARNING'] : process.env['ALERT']} ___${inlineCodeBlock(`${err.level} ID: ${err.id}`)} Possible Fix:___`,
        value: `>>> ${err.solution}`,
      });
      errEmb.data.fields?.sort((a, b) => a.name.localeCompare(b.name));
      cnt++;
    }

    if (this.log.errors.filter((x) => x.level !== Level.XTRA).length === 0)
      errEmb.data.description += `\n${process.env['INFO']} **__No Error Found!__**\n>>> -# No errors were detected by the bot. If you continue to have issues it may be an issue with a script or the mods folder!`;
    return errEmb;
  }

  //! Server Message
  public async SendReply(interaction: MessageContextMenuCommandInteraction | Message | StringSelectMenuInteraction) {
    this.cache = Cache.getProcess(this.msgId)!;
    if (!this.pluginInfoSent) {
      await Logger.PluginInfo(
        this.log.missing,
        this.log.newVersion,
        this.log.downloadLink!,
        await interaction.channel?.messages.fetch(this.cache.OriginalMessage.id)!
      );
      this.pluginInfoSent = true;
    }
    const comps = new ActionRowBuilder<ButtonBuilder>();
    comps.addComponents([new ButtonBuilder().setCustomId(LogSendToUser).setLabel('Send To User').setStyle(ButtonStyle.Danger)]);
    let reply: Message;
    if (interaction instanceof Message) {
      await interaction.reply({ embeds: [this.GetBaseInfo(), this.GetPluginInfo(), this.GetErrorInfo()] });
    } else {
      if (!interaction.guild) reply = await interaction.editReply({ embeds: [this.GetBaseInfo(), this.GetPluginInfo(), this.GetErrorInfo()] });
      else reply = await interaction.editReply({ embeds: [this.GetBaseInfo(), this.GetPluginInfo(), this.GetErrorInfo()], components: [comps] });
      this.msgId = reply.id;
      await Cache.saveProcess(reply.id, new ProcessCache(this.cache.OriginalMessage, interaction, this));
    }
  }

  //! Send To User
  public async SendToUser() {
    this.cache = Cache.getProcess(this.msgId)!;
    await this.cache.Interaction.deleteReply().catch(() => {});
    if (this.cache.OriginalMessage) await this.cache.OriginalMessage.reply({ embeds: [this.GetBaseInfo(), this.GetPluginInfo(), this.GetErrorInfo()] });
  }
}
