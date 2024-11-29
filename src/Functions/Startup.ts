import { Cache } from '../Cache';
import { EmbedCreator } from './Messages/EmbedCreator';
import { Logger } from './Messages/Logger';

export abstract class Startup {
  static async Init() {
    await Startup.PrepCache();
    await Startup.SendMessages();
  }

  private static async PrepCache() {
    Cache.resetCache();
  }

  private static async SendMessages() {
    Logger.BotLog(
      EmbedCreator.Success(
        `__LSPDFR Helper Loaded!__\r\n>>> Cached Plugins: ${Cache.getPlugins.length}\r\nCached Errors: ${Cache.getErrors.length}`
      )
    );
  }
}
