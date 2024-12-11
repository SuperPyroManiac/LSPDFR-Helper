import { ELSLog } from '../../../CustomTypes/LogTypes/ELSLog';

export abstract class ELSValidator {
  public static async validate(attachmentUrl: string): Promise<ELSLog> {
    const wholeLog = await (await fetch(attachmentUrl)).text();
    const log = new ELSLog();
    log.downloadLink = attachmentUrl;

    const versionMatch = /VER\s+\[ ([0-9.]+) \]/.exec(wholeLog);
    log.elsVersion = versionMatch ? versionMatch[1] : undefined;

    log.ahvFound = /\s+\(OK\) AdvancedHookV\.dll file found and successfully initialized\./.test(wholeLog);

    const invalidMatches = wholeLog.matchAll(
      /<FILEV> Found file: \[ (.*) \]\.\r\n<FILEV> Verifying vehicle model name \[ .* \]\.\r\n\s+\(ER\) Model specified is not valid, discarding file\./g
    );
    for (const match of invalidMatches) {
      if (!log.invalidElsVcfs.includes(match[1])) {
        log.invalidElsVcfs.push(match[1]);
      }
    }

    const validMatches = wholeLog.matchAll(
      /<FILEV> Found file: \[ (.*) \]\.\r\n<FILEV> Verifying vehicle model name \[ .* \]\.\r\n\s+\(OK\) Is valid vehicle model, assigned VMID \[ .* \]\.\r\n\s+Parsing file. \*A crash before all clear indicates faulty VCF\.\*\r\n\s+VCF Description: .*\r\n\s+VCF Author: .*(\r\n\s+\(OK\) Collected data from: '\w+'\.)+\r\n\s+\(OK\) ALL CLEAR -- Configuration file processed\./g
    );
    for (const match of validMatches) {
      if (!log.validElsVcfs.includes(match[1]) && !log.invalidElsVcfs.includes(match[1])) {
        log.validElsVcfs.push(match[1]);
      }
    }

    if (/\s+\(OK\) Collected data from: '\w+'\.\r\n$/.test(wholeLog)) {
      const matches = Array.from(wholeLog.matchAll(/<FILEV> Found file: \[ (.+\.xml) \]/g));
      if (matches.length > 0) {
        log.faultyElsVcf = matches[matches.length - 1][1];
      }
    }

    log.validaterCompletedAt = new Date();
    log.elapsedTime = (new Date().getTime() - log.validaterStartedAt.getTime()).toString();

    return log;
  }
}
