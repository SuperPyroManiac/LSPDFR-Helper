import * as cron from 'node-cron';
import { Cache } from '../Cache';
import { PluginValidation } from './Validations/Plugins';
import { ServerValidation } from './Validations/Servers';
import { UsersValidation } from './Validations/Users';
import { Logger } from './Messages/Logger';
import { CaseValidation } from './Validations/Cases';

export abstract class Timer {
  static startTimer() {
    // Every 10 seconds
    cron.schedule(
      '*/10 * * * * *',
      () => {
        Cache.removeExpired().catch((e) => Logger.ErrLog(`Cache cleanup failed:\r\n${e}`));
        PluginValidation.CheckUpdates().catch((e) => Logger.ErrLog(`Plugin check failed:\r\n${e}`));
        ServerValidation.Verify().catch((e) => Logger.ErrLog(`Server validation failed:\r\n${e}`));
      },
      {
        runOnInit: false,
      }
    );

    // Every minute
    cron.schedule(
      '* * * * *',
      () => {
        UsersValidation.Verify().catch((e) => Logger.ErrLog(`User validation failed:\r\n${e}`));
        CaseValidation.VerifyOpenCases().catch((e) => Logger.ErrLog(`Case validation failed:\r\n${e}`));
        Cache.resetCache().catch((e) => Logger.ErrLog(`Cache reset failed:\r\n${e}`));
      },
      {
        runOnInit: false,
      }
    );
  }
}
