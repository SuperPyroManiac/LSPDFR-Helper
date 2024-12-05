import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContextMenuCommandInteraction, EmbedBuilder, Interaction, time, TimestampStyles } from 'discord.js';
import { Cache, ProcessorType } from '../../../Cache';
import { PluginType } from '../../../CustomTypes/Enums/PluginType';
import { State } from '../../../CustomTypes/Enums/State';
import { RPHLog } from '../../../CustomTypes/LogTypes/RPHLog';
import { EmbedCreator } from '../../Messages/EmbedCreator';
import { ProcessCache } from '../../../CustomTypes/CacheTypes/ProcessCache';
import { Level } from '../../../CustomTypes/Enums/Level';
import { RphSendToUser } from '../../../interaction-handlers/_CustomIds';

export class RPHProcessor {
  log: RPHLog;
  msgId: string;
  private cache!: ProcessCache<ProcessorType>;
  private currentPlugins?: string;
  private outdatedPlugins?: string;
  private removePlugins?: string;
  private missingPlugins?: string; //TODO
  private updatedPlugins?: string;
  private rphPlugins?: string;
  private gtaVer = '❌';
  private lspdfrVer = '❌';
  private rphVer = '❌';

  constructor(log: RPHLog, mesgId: string) {
    this.log = log;
    this.msgId = mesgId;
    //prettier-ignore
    {
    this.currentPlugins = log.current.map((x) => x.dname).join('**,** ');
    this.outdatedPlugins = log.outdated.map((x) => x.linkedName()).join('**,** ');
    this.rphPlugins = log.current.filter((x) => x.type === PluginType.RPH).map((x) => x.dname).join('**,** ');
    this.removePlugins = log.current.filter((x) => x.state === State.BROKEN || x.type === PluginType.LIBRARY).map((x) => x.dname).join('**,** ');
    this.missingPlugins = log.missing.map((x) => `${x.name} (${x.version})`).join('**,** ');
    this.updatedPlugins = log.newVersion.map((x) => `${x.name} (${x.version})`).join('**,** ');
    this.gtaVer = Cache.getPlugin('GrandTheftAuto5')?.version === log.gtaVersion ? '✓' : '❌';
    this.lspdfrVer = Cache.getPlugin('LSPDFR')?.version === log.lspdfrVersion ? '✓' : '❌';
    this.rphVer = Cache.getPlugin('RagePluginHook')?.version === log.rphVersion ? '✓' : '❌';
    }
  }

  private GetBaseInfo(): EmbedBuilder {
    let emb = EmbedCreator.Support('__RPH.log Info__').setFooter({
      text: `GTA: ${this.gtaVer} - LSPDFR: ${this.lspdfrVer} - RPH: ${this.rphVer} - Processing Time: ${this.log.elapsedTime}MS`,
    });

    if (this.log.logModified) {
      //TODO: Add mod log shit
      return emb;
    }

    if (this.log.errors.length === 0 && this.removePlugins?.length === 0) {
      emb.addFields({ name: 'No Problems Detected!', value: 'If you continue to have issues, this likely may be a mods folder issue!' });
    }

    return emb;
  }

  private GetPluginInfo(): EmbedBuilder {
    const plugEmb = EmbedCreator.Support('__Plugin Information:__\r\n*Plugin Path: GTAV/Plugins/LSPDFR*\r\n');
    if (this.outdatedPlugins?.length)
      plugEmb.data.description += `\r\n${process.env.WARNING} **__Update These Plugins:__**\r\n> -# These should be updated to ensure stability!\r\n> \r\n> ${this.outdatedPlugins}\r\n`;
    if (this.removePlugins?.length)
      plugEmb.data.description += `\r\n${process.env.ALERT} **__Remove These Plugins:__**\r\n> -# These are either known to cause issue, or are installed incorrectly. Use /CheckPlugin for more info!\r\n> \r\n> ${this.removePlugins}\r\n`;
    if (this.currentPlugins?.length && !this.outdatedPlugins?.length && !this.removePlugins?.length && this.log.lspdfrVersion)
      plugEmb.data.description += `\r\n${process.env.SUCCESS} **__All Plugins Up To Date!:__**\r\n> -# Good job! This helps ensure your game runs well.\r\n`;
    if (!this.currentPlugins?.length && !this.outdatedPlugins?.length && !this.removePlugins?.length && this.log.lspdfrVersion)
      plugEmb.data.description += `\r\n${process.env.INFO} **__No Plugins Loaded!__**\r\n> -# You do not appear to have any LSPDFR plugins installed. No info can be provided here.\r\n`;
    if (!this.log.lspdfrVersion)
      plugEmb.data.description += `\r\n${process.env.ALERT} **__LSPDFR Not Loaded!__**\r\n> -# This is likely due to a mod conflict or a missing mod. Check the mod list for more info!\r\n`;
    if (!this.currentPlugins?.length) this.currentPlugins = '**None**';
    if (!this.rphPlugins?.length) this.rphPlugins = '**None**';
    return plugEmb;
  }

  private GetErrorInfo(): EmbedBuilder {
    const errEmb = EmbedCreator.Support('__Error Information:__\r\n*This shows common issues that were detected.*\r\n\r\n');
    const update = this.log.errors.some((x) => x.level === Level.CRITICAL);
    for (const err of this.log.errors) {
      //if (update && err.level !== Level.CRITICAL) continue;
      errEmb.addFields({
        //prettier-ignore
        name: `${err.level === Level.XTRA ? process.env.INFO : err.level === Level.WARN ? process.env.WARNING : process.env.ALERT}___ *${err.level} ID: ${err.id}* Possible Solutions:___`,
        value: `>>> ${err.solution}`,
      });
      errEmb.data.fields?.sort((a, b) => a.name.localeCompare(b.name));
    }
    return errEmb;
  }

  //! Server Context Menu Messages
  async SendServerContextReply(interaction: ContextMenuCommandInteraction) {
    this.cache = Cache.getProcess(this.msgId)!;
    const comps = new ActionRowBuilder<ButtonBuilder>();
    comps.addComponents([new ButtonBuilder().setCustomId(RphSendToUser).setLabel('Send To User').setStyle(ButtonStyle.Danger)]);

    const tst = this.GetBaseInfo();
    tst.data.description += `\r\nTest - Cache Expires in: ${time(this.cache.Expire, TimestampStyles.RelativeTime)}`;
    const reply = await interaction.editReply({ embeds: [tst, this.GetPluginInfo(), this.GetErrorInfo()], components: [comps] });
    this.msgId = reply.id;
    Cache.saveProcess(reply.id, new ProcessCache(this.cache.OriginalMessage, interaction, this));
  }

  //! User Context Menu Messages
  async SendUserContextReply() {}

  //! AutoHelper Messages
  async SendAutoReply() {}

  //! Send To User
  async SendToUser() {
    this.cache = Cache.getProcess(this.msgId)!;
    await this.cache.Interaction.deleteReply().catch(() => {});
    if (this.cache.OriginalMessage) await this.cache.OriginalMessage.reply({ embeds: [this.GetBaseInfo(), this.GetPluginInfo(), this.GetErrorInfo()] });
  }
}
