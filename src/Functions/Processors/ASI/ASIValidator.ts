import { Cache } from '../../../Cache';
import { PluginType } from '../../../CustomTypes/Enums/PluginType';
import { State } from '../../../CustomTypes/Enums/State';
import { ASILog } from '../../../CustomTypes/LogTypes/ASILog';
import { Plugin } from '../../../CustomTypes/MainTypes/Plugin';

export class ASIValidator {
  public static async validate(attachmentUrl: string): Promise<ASILog> {
    const wholeLog = await (await fetch(attachmentUrl)).text();
    const log = new ASILog();
    log.downloadLink = attachmentUrl;

    const invalidMatches = wholeLog.matchAll(/^\s+.(.+.asi). failed to load.*/gm);
    for (const match of invalidMatches) {
      let plug = await Cache.getPlugin(match[1]!);
      if (!plug) {
        plug = new Plugin(match[1]);
        plug.version = 'ASI';
        plug.type = PluginType.ASI;
        log.missing.push(plug);
      }
      if (plug.state === State.BROKEN) log.brokenAsiFiles.push(plug.name);
      log.failedAsiFiles.push(plug);
    }

    const validMatches = wholeLog.matchAll(/^\s+.(.+.asi). (?!failed to load).*/gm);
    for (const match of validMatches) {
      let plug = await Cache.getPlugin(match[1]!);
      if (!plug) {
        plug = new Plugin(match[1]);
        plug.version = 'ASI';
        plug.type = PluginType.ASI;
        log.missing.push(plug);
      }
      if (plug.state === State.BROKEN) log.brokenAsiFiles.push(plug.name);
      log.loadedAsiFiles.push(plug);
    }

    log.validaterCompletedAt = new Date();
    log.elapsedTime = (new Date().getTime() - log.validaterStartedAt.getTime()).toString();

    return log;
  }
}
