import { Cache } from '../Cache';

export abstract class Timer {
  private static timer: NodeJS.Timeout;

  static async startTimer() {
    this.timer = setInterval(async () => {
      await this.runEveryTenSeconds();
    }, 10000);
  }

  private static async runEveryTenSeconds() {
    await Cache.removeExpired();
  }
}
