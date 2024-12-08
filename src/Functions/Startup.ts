import { Cache } from '../Cache';
import { EmbedCreator } from './Messages/EmbedCreator';
import { Logger } from './Messages/Logger';
import { Timer } from './Timer';
import { ServerValidation } from './Validations/Servers';
import { UsersValidation } from './Validations/Users';

export abstract class Startup {
  static async Init() {
    Timer.startTimer();
    await Startup.PrepCache();
    await Startup.SendMessages();
    ServerValidation.Verify(); //TODO
    UsersValidation.Verify(); //TODO
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
