import { RPHLog } from '../../CustomTypes/LogTypes/RPHLog';
import { Plugin } from '../../CustomTypes/MainTypes/Plugin';
import { Error } from '../../CustomTypes/MainTypes/Error';
import { Level } from '../../CustomTypes/Enums/Level';

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
    return log;
  }
}
