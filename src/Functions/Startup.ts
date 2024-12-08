import { Cache } from '../Cache';
import { EmbedCreator } from './Messages/EmbedCreator';
import { Logger } from './Messages/Logger';
import { Timer } from './Timer';
import { PluginValidation } from './Validations/Plugins';

export abstract class Startup {
  static async Init() {
    await Startup.PrepCache();
    await Timer.startTimer();
    await Startup.SendMessages();
  }

  private static async PrepCache() {
    await Cache.resetCache();
  }

  private static async SendMessages() {
    Logger.BotLog(
      EmbedCreator.Success(`__LSPDFR Helper Loaded!__\r\n>>> Cached Plugins: ${Cache.getPlugins().length}\r\nCached Errors: ${Cache.getErrors().length}`)
    );
  }
}
