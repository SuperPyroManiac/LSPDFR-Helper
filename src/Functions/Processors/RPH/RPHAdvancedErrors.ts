import { Cache } from '../../../Cache';
import { Level } from '../../../CustomTypes/Enums/Level';
import { PluginType } from '../../../CustomTypes/Enums/PluginType';
import { RPHLog } from '../../../CustomTypes/LogTypes/RPHLog';
import { Error } from '../../../CustomTypes/MainTypes/Error';
import { Plugin } from '../../../CustomTypes/MainTypes/Plugin';

export class RPHAdvancedErrors {
  public static processAdvancedErrors(log: RPHLog, rawLog: string): RPHLog {
    //! Multi Session Check
    if ((rawLog.match(/Started loading LSPDFR/g) || []).length > 1) {
      const err = new Error();
      err.id = 15;
      err.level = Level.WARN;
      err.solution =
        '**Multiple Sessions**\r\nYour log contains multiple sessions. This means you reloaded LSPDFR without restarting the game. The log reader may provide incorrect results!';
      log.errors.push(err);
    }

    //! Combined Errors
    //* Missing Depends
    const err1 = Cache.getError(1)!.clone();
    for (const match of rawLog.matchAll(new RegExp(err1.pattern!, 'gm'))) {
      if (err1.pluginList.some((x) => x.name === match[2])) continue;
      if (log.current.some((x) => x.name === match[2])) continue;
      if (log.outdated.some((x) => x.name === match[2])) continue;
      err1.pluginList.push(Cache.getPlugin(match[2]!) ?? new Plugin(match[2]));
    }
    if (err1.pluginList.length > 0) {
      err1.solution += `\r\n${err1.pluginList.map((x) => `- ${x.linkedName()}`).join('\r\n')}`;
      if (err1.solution!.length >= 1023) err1.solution = 'Too many to show!';
      log.errors.push(err1);
    }
    //* Lib Installed as LSPDFR
    const err2 = Cache.getError(97)!.clone();
    for (const match of rawLog.matchAll(new RegExp(err2.pattern!, 'gm'))) {
      if (err2.pluginList.some((x) => x.name === match[1])) continue;
      err2.pluginList.push(Cache.getPlugin(match[1]!) ?? new Plugin(match[1]));
    }
    if (err2.pluginList.length > 0) {
      err2.solution += `\r\n${err2.pluginList.map((x) => `- ${x.linkedName()}`).join('\r\n')}`;
      if (err2.solution!.length >= 1023) err2.solution = 'Too many to show!';
      log.errors.push(err2);
    }
    //* Script Installed as LSPDFR
    const err3 = Cache.getError(98)!.clone();
    for (const match of rawLog.matchAll(new RegExp(err3.pattern!, 'gm'))) {
      if (err3.pluginList.some((x) => x.name === match[1])) continue;
      err3.pluginList.push(Cache.getPlugin(match[1]!) ?? new Plugin(match[1]));
    }
    if (err3.pluginList.length > 0) {
      err3.solution += `\r\n${err3.pluginList.map((x) => `- ${x.linkedName()}`).join('\r\n')}`;
      if (err3.solution!.length >= 1023) err3.solution = 'Too many to show!';
      log.errors.push(err3);
    }
    //* RPH Installed as LSPDFR
    const err4 = Cache.getError(99)!.clone();
    for (const match of rawLog.matchAll(new RegExp(err4.pattern!, 'gm'))) {
      if (err4.pluginList.some((x) => x.name === match[1])) continue;
      err4.pluginList.push(Cache.getPlugin(match[1]!) ?? new Plugin(match[1]));
    }
    if (err4.pluginList.length > 0) {
      err4.solution += `\r\n${err4.pluginList.map((x) => `- ${x.linkedName()}`).join('\r\n')}`;
      if (err4.solution!.length >= 1023) err4.solution = 'Too many to show!';
      log.errors.push(err4);
    }
    //* Incorrect RPH Plugin
    const err5 = Cache.getError(41)!.clone();
    for (const match of rawLog.matchAll(new RegExp(err5.pattern!, 'gm'))) {
      if (err5.pluginList.some((x) => x.name === match[2])) continue;
      err5.pluginList.push(Cache.getPlugin(match[2]!) ?? new Plugin(match[2]));
    }
    if (err5.pluginList.length > 0) {
      err5.solution += `\r\n${err5.pluginList.map((x) => `- ${x.linkedName()}`).join('\r\n')}`;
      if (err5.solution!.length >= 1023) err5.solution = 'Too many to show!';
      log.errors.push(err5);
    }

    //TODO Better implimentation - Outdated RPH Plugin
    if (rawLog.match(new RegExp('DamageTrackingFramework: \\[VERSION OUTDATED\\]', 'gm'))) log.outdated.push(Cache.getPlugin('DamageTrackingFramework')!);

    //! Exception Detection
    const err6 = new Error();
    for (const match of rawLog.matchAll(/(?:.+ at (\w*)\..+\(\))/g)) {
      const plug = Cache.getPlugin(match[1]!);
      if (!plug || err6.pluginList.some((x) => x.name === plug.name)) continue;
      if (plug.type === PluginType.LSPDFR || plug.type === PluginType.RPH) err6.pluginList.push(plug);
    }
    if (err6.pluginList.length > 0) {
      err6.solution =
        '**These plugins threw an error:**' +
        `\r\n${err6.pluginList.map((x) => `- ${x.linkedName()}`).join('\r\n')}` +
        '\r\nEnsure you follow all other steps listed to fix these!' +
        '\r\n*If the issue persists, you may want to report it to the author or remove the plugin.*';
      err6.level = Level.SEVERE;
      err6.id = 20;
      if (err6.solution!.length >= 1023) err6.solution = 'Too many exceptions to list in this error! Either you send a modified log, or your game is cooked.';
      log.errors.push(err6);
    }
    return log;
  }
}
