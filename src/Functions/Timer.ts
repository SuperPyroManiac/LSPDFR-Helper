import * as cron from 'node-cron';
import { Cache } from '../Cache';
import { PluginValidation } from './Validations/Plugins';
import { ServerValidation } from './Validations/Servers';
import { UsersValidation } from './Validations/Users';

export abstract class Timer {
  static startTimer() {
    cron.schedule(
      '*/10 * * * * *',
      () => {
        Cache.removeExpired();
        PluginValidation.CheckUpdates();
        ServerValidation.Verify();
      },
      { runOnInit: false }
    );

    cron.schedule(
      '* * * * *',
      async () => {
        await UsersValidation.Verify();
        await Cache.resetCache();
      },
      {
        runOnInit: false,
      }
    );
  }
}
