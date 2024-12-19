import * as cron from 'node-cron';
import { Cache } from '../Cache';
import { PluginValidation } from './Validations/Plugins';
import { ServerValidation } from './Validations/Servers';
import { Logger } from './Messages/Logger';
import { CaseValidation } from './Validations/Cases';

export class Timer {
  public static startTimer() {
    // Every 10 seconds
    cron.schedule(
      '*/10 * * * * *',
      () => {
        Cache.removeExpired().catch(async (e) => Logger.ErrLog(`Cache cleanup failed:\r\n${e}`));
        PluginValidation.CheckUpdates().catch(async (e) => Logger.ErrLog(`Plugin check failed:\r\n${e}`));
        ServerValidation.Verify().catch(async (e) => Logger.ErrLog(`Server validation failed:\r\n${e}`));
      },
      {
        runOnInit: false,
      }
    );

    // Every minute
    cron.schedule(
      '* * * * *',
      () => {
        CaseValidation.VerifyOpenCases().catch(async (e) => Logger.ErrLog(`Case validation failed:\r\n${e}`));
        Cache.resetCache().catch(async (e) => Logger.ErrLog(`Cache reset failed:\r\n${e}`));
      },
      {
        runOnInit: false,
      }
    );

    // Every 60 minutes
    cron.schedule(
      '0 */1 * * *',
      () => {
        //UsersValidation.Verify().catch(async (e) => Logger.ErrLog(`User validation failed:\r\n${e}`));
      },
      {
        runOnInit: false,
      }
    );
  }
}
