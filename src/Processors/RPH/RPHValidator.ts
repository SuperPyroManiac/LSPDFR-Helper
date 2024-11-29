import { Cache } from '../../Cache';
import { RPHLog } from '../../CustomTypes/LogTypes/RPHLog';
import { Plugin } from '../../CustomTypes/MainTypes/Plugin';
import { Error } from '../../CustomTypes/MainTypes/Error';
import { Level } from '../../CustomTypes/Enums/Level';
import { PluginType } from '../../CustomTypes/Enums/PluginType';
import { State } from '../../CustomTypes/Enums/State';

export class RPHValidator {
  async validate(attachmenturl: string): Promise<RPHLog> {
    const log = new RPHLog();
    const rawLog = await (await fetch(attachmenturl)).text();
    const unSorted: Plugin[] = [];

    /*prettier-ignore */
    {
    log.downloadLink = attachmenturl;
    log.logPath = rawLog.match(/Log path: (.+)RagePluginHook\.log/)?.[1];
    log.rphVersion = rawLog.match(/.+ Version: RAGE Plugin Hook v(\d+\.\d+\.\d+\.\d+) for Grand Theft Auto V/)?.[1];
    log.lspdfrVersion = rawLog.match(/.+ Running LSPD First Response 0\.4\.9 \((\d+\.\d+\.\d+\.\d+)\)/)?.[1];
    log.gtaVersion = rawLog.match(/.+ Product version: (\d+\.\d+\.\d+\.\d+)/)?.[1];
    
    }

    if (!rawLog.includes('Started new log on') || !rawLog.includes('Cleaning temp folder')) {
      log.logModified = true;
      log.errors.push(
        Object.assign(new Error(), {
          id: 666,
          level: Level.CRITICAL,
          solution: '**This log has been modified! It is invalid and will not be checked!**',
        })
      );
      return log;
    }

    const allMatch = rawLog.matchAll(
      /(?:(?<!CalloutManager\.cs:line 738)\n.+LSPD First Response: (?!無法載入檔案或組件|\[|Creating| |Error)\W?(.{1,40}), Version=(.+), Culture=\w{1,10}, PublicKeyToken=\w{1,10})|(?:Loading plugin .+\wlugins(?:\\|\/)(.+).dll.*)/gm
    );
    for (const match of allMatch) {
      if (match[1]?.length > 0) {
        const plug = Cache.getPlugin(match[1]);
        if (plug) {
          let newPlug = plug.clone();
          newPlug.version = match[2];
          if (!unSorted.some((x) => x.name === newPlug.name)) unSorted.push(newPlug);
          continue;
        }
        if (!log.missing.some((x) => x.name === match[1]))
          log.missing.push(Object.assign(new Plugin(), { name: match[1], version: match[2] }));
        continue;
      }
      //RPH Plugins
      let rphPlug = Cache.getPlugin(match[3]);
      if (rphPlug && !unSorted.some((x) => x.name === rphPlug.name)) unSorted.push(rphPlug);
      if (!rphPlug && !log.missing.some((x) => x.name === match[3]))
        log.missing.push(
          Object.assign(new Plugin(), { name: match[3], version: 'RPH', type: PluginType.RPH })
        );
    }

    for (const plug of unSorted) {
      var plugin = Cache.getPlugin(plug.name)!;
      switch (plugin.state) {
        case State.NORMAL:
        case State.EXTERNAL:
          if (
            plugin.eaVersion === plug.eaVersion &&
            !log.current.some((x) => x.name === plug.name)
          ) {
            log.current.push(plug);
            break;
          }
          const result = this.compareVersions(plugin.version!, plug.version!);
          switch (true) {
            case result < 0:
              if (!log.outdated.some((x) => x.name === plug.name)) log.outdated.push(plug);
              break;
            case result > 0:
              plug.eaVersion = plugin.version;
              if (!log.newVersion.some((x) => x.name === plug.name)) log.newVersion.push(plug);
              break;
            default:
              if (!log.current.some((x) => x.name === plug.name)) log.current.push(plug);
              break;
          }
          break;
      }
    }

    for (const error of Cache.getErrors()) {
      if (
        error.id === 1 ||
        error.id === 97 ||
        error.id === 98 ||
        error.id === 99 ||
        error.id === 41 ||
        error.id === 176
      )
        continue;
      if (error.level === Level.PIMG || error.level === Level.PMSG) continue;
      if (error.stringMatch) {
        if (rawLog.includes(error.pattern!)) log.errors.push(error);
      }

      const errMatch = Array.from(rawLog.matchAll(new RegExp(error.pattern!, 'g')));

      for (const match of errMatch) {
        const newError = error.clone();

        for (let i = 0; i <= 3; i++) {
          newError.solution = newError.solution!.replace(`{${i}}`, match[i]);
        }

        if (!log.errors.some((x) => x.solution === newError.solution)) {
          log.errors.push(newError);
        }
      }
    }

    log.validaterCompletedAt = new Date();
    log.elapsedTime = (new Date().getTime() - log.validaterStartedAt.getTime()).toString();
    return log;
  }

  private compareVersions(version1: string, version2: string): number {
    const parts1 = version1.split('.');
    const parts2 = version2.split('.');
    const minLength = Math.min(parts1.length, parts2.length);

    for (let i = 0; i < minLength; i++) {
      const part1 = parseInt(parts1[i], 10);
      const part2 = parseInt(parts2[i], 10);
      if (part1 < part2) return -1; // version1 is smaller
      if (part1 > part2) return 1; // version1 is larger
    }
    // If all common parts are equal, check the remaining parts
    if (parts1.length < parts2.length) return -1; // version1 is smaller
    if (parts1.length > parts2.length) return 1; // version1 is larger
    return 0; // versions are equal
  }
}
