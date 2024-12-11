import { Cache } from '../Cache';
import { APIManager } from '../Web/APIManager';
import { EmbedCreator } from './Messages/EmbedCreator';
import { Logger } from './Messages/Logger';
import { Timer } from './Timer';
import { AutoHelperValidation } from './Validations/AutoHelper';
import { CaseValidation } from './Validations/Cases';
import { ServerValidation } from './Validations/Servers';
import { UsersValidation } from './Validations/Users';

export abstract class Startup {
  private static newServers = 0;
  private static remServers = 0;
  private static newUsers = 0;
  private static updateUsers = 0;
  private static closedCases = 0;

  static async Init() {
    await Cache.resetCache();
    APIManager.init();
    AutoHelperValidation.ValidateMsgs();
    this.newServers = await ServerValidation.AddMissing();
    this.remServers = await ServerValidation.RemoveMissing();
    this.newUsers = await UsersValidation.AddMissing();
    this.updateUsers = await UsersValidation.UpdateNames();
    this.closedCases = await CaseValidation.VerifyOpenCases();
    Timer.startTimer();
    await Startup.SendMessages();
  }

  private static async SendMessages() {
    const emb = EmbedCreator.Success(`__LSPDFR Helper Initialized!__\r\n`);
    //TODO Git Info
    emb.data.description +=
      `> **Cached Servers:** ${Cache.getServers().length}\r\n` +
      `> **Cached Plugins:** ${Cache.getPlugins().length}\r\n` +
      `> **Cached Errors:** ${Cache.getErrors().length}\r\n` +
      `> **Cached Users:** ${Cache.getUsers().length}\r\n` +
      `> **Cached Cases:** ${Cache.getCases().length}\r\n\r\n`;
    if (this.newServers > 0) emb.data.description += `-# Found ${this.newServers} new servers to add to the DB!\r\n`;
    if (this.remServers > 0) emb.data.description += `-# Found ${this.remServers} servers to remove from the DB!\r\n`;
    if (this.newUsers > 0) emb.data.description += `-# Found ${this.newUsers} new users to add to the DB!\r\n`;
    if (this.updateUsers > 0) emb.data.description += `-# Found ${this.updateUsers} users to update in the DB!\r\n`;
    if (this.closedCases > 0) emb.data.description += `-# Closed ${this.closedCases} cases that failed verification!\r\n`;

    Logger.BotLog(emb);
  }
}
