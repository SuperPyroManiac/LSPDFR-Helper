import * as cron from 'node-cron';
import { Cache } from '../Cache';
import { PluginValidation } from './Validations/Plugins';
import { ServerValidation } from './Validations/Servers';

export abstract class Timer {
  static startTimer() {
    cron.schedule('*/10 * * * * *', async () => {
      Cache.removeExpired();
      PluginValidation.CheckUpdates();
      ServerValidation.Verify();
    });
  }
}
