import { EmbedBuilder, MessagePayload } from 'discord.js';
import { Cache, ProcessorType } from '../../../Cache';
import { PluginType } from '../../../CustomTypes/Enums/PluginType';
import { State } from '../../../CustomTypes/Enums/State';
import { RPHLog } from '../../../CustomTypes/LogTypes/RPHLog';
import { EmbedCreator } from '../../Messages/EmbedCreator';
import { BaseProcessor } from './BaseProcessor';
import { ProcessCache } from '../../../CustomTypes/CacheTypes/ProcessCache';
import { Level } from '../../../CustomTypes/Enums/Level';

export class RPHProcessor extends BaseProcessor {
  log: RPHLog;
  msgId: string;
  private cache?: ProcessCache<ProcessorType>;
  private currentPlugins?: string;
  private outdatedPlugins?: string;
  private removePlugins?: string;
  private missingPlugins?: string;
  private updatedPlugins?: string;
  private rphPlugins?: string;
  private gtaVer = '❌';
  private lspdfrVer = '❌';
  private rphVer = '❌';

  constructor(log: RPHLog, msgId: string) {
    super();
    this.log = log;
    this.msgId = msgId;

    this.currentPlugins = log.current.map((x) => x.dname).join('**,** ');
    this.outdatedPlugins = log.outdated.map((x) => x.linkedName()).join('**,** ');
    this.rphPlugins = log.current
      .filter((x) => x.type === PluginType.RPH)
      .map((x) => x.dname)
      .join('**,** ');
    this.removePlugins = log.current
      .filter((x) => x.state === State.BROKEN || x.type === PluginType.LIBRARY)
      .map((x) => x.dname)
      .join('**,** ');
    this.missingPlugins = log.missing.map((x) => `${x.name} (${x.version})`).join('**,** ');
    this.updatedPlugins = log.newVersion.map((x) => `${x.name} (${x.version})`).join('**,** ');
    //Check code: \u2713
    this.gtaVer = Cache.getPlugin('GrandTheftAuto5')?.version === log.gtaVersion ? '✓' : '❌';
    this.lspdfrVer = Cache.getPlugin('LSPDFR')?.version === log.lspdfrVersion ? '✓' : '❌';
    this.rphVer = Cache.getPlugin('RagePluginHook')?.version === log.rphVersion ? '✓' : '❌';
  }

  private GetBaseMessage(): EmbedBuilder {
    let emb = EmbedCreator.Support('__RPH.log Info__').setFooter({
      text: `GTA: ${this.gtaVer} - LSPDFR: ${this.lspdfrVer} - RPH: ${this.rphVer}`,
    });
    this.AddExtraInfo(emb, this.cache!);
    emb.addFields(
      { name: 'Installed Plugins:', value: `${this.log.current.length + this.log.missing.length + this.log.outdated.length}`, inline: true },
      {
        name: 'Issues:',
        value: `${this.log.errors.filter((x) => x.level === Level.CRITICAL || x.level === Level.SEVERE || x.level === Level.WARN).length || 'None Detected!'}`,
        inline: true,
      },
      { name: 'Valid Log:', value: this.log.logModified ? 'INVALID' : 'Yes', inline: true }
    );

    if (this.log.logModified) {
      emb.addFields({ name: 'Log Modified:', value: 'This log has been modified and will not be processed!', inline: false });
      return emb;
    }

    if (this.log.errors.length === 0 && this.removePlugins?.length === 0) {
      emb.addFields({ name: 'No Problems Detected!', value: 'If you continue to have issues, this likely may be a mods folder issue!' });
    }

    return emb;
  }

  //! Context Menu Messages
  async SendContextReply() {
    this.cache = Cache.getProcess(this.msgId)!;
    let embeds = [this.GetBaseMessage()];

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
    embeds.push(plugEmb);

    const errEmb = EmbedCreator.Support('__Error Information:__\r\n*Think of words that go here.*\r\n');
    const update = this.log.errors.some((x) => x.level === Level.CRITICAL);
    for (const err of this.log.errors) {
      if (update && err.level !== Level.CRITICAL) continue;
      errEmb.addFields({
        //prettier-ignore
        name: `${[Level.PMSG, Level.PIMG, Level.XTRA].includes(err.level) ? process.env.INFO : err.level === Level.WARN ? process.env.WARNING : process.env.ALERT}___ *${err.level} ID: ${err.id}* Possible Solutions:___`,
        value: `>>> ${err.solution}`,
      });
    }
    embeds.push(errEmb);

    if (!this.cache.Interaction.isAutocomplete()) await this.cache.Interaction.editReply({ embeds: embeds });
  }

  //! AutoHelper Messages
  async SendAutoReply() {
    this.cache = Cache.getProcess(this.msgId)!;
    let embeds = [this.GetBaseMessage()];

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
    embeds.push(plugEmb);

    const errEmb = EmbedCreator.Support('__Error Information:__\r\n*Think of words that go here.*\r\n');
    const update = this.log.errors.some((x) => x.level === Level.CRITICAL);
    for (const err of this.log.errors) {
      if (update && err.level !== Level.CRITICAL) continue;
      errEmb.addFields({
        //prettier-ignore
        name: `${[Level.PMSG, Level.PIMG, Level.XTRA].includes(err.level) ? process.env.INFO : err.level === Level.WARN ? process.env.WARNING : process.env.ALERT}___ *${err.level} ID: ${err.id}* Possible Solutions:___`,
        value: `>>> ${err.solution}`,
      });
    }
    embeds.push(errEmb);

    if (!this.cache.Interaction.isAutocomplete()) await this.cache.Interaction.editReply({ embeds: embeds });
  }
}
