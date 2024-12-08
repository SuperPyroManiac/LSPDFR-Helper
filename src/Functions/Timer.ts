import * as cron from 'node-cron';
import { Cache } from '../Cache';
import { PluginValidation } from './Validations/Plugins';

export abstract class Timer {
  static startTimer() {
    cron.schedule('*/10 * * * * *', async () => {
      await Cache.removeExpired();
      PluginValidation.CheckUpdates();
    });
  }
}
