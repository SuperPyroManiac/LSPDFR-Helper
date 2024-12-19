import { execSync } from 'child_process';
import { Cache } from '../Cache';
import { APIManager } from '../Web/APIManager';
import { EmbedCreator } from './Messages/EmbedCreator';
import { Logger } from './Messages/Logger';
import { Timer } from './Timer';
import { AutoHelperValidation } from './Validations/AutoHelper';
import { CaseValidation } from './Validations/Cases';
import { ServerValidation } from './Validations/Servers';

export class Startup {
  private static newServers = 0;
  private static remServers = 0;
  private static closedCases = 0;

  public static async Init() {
    await Cache.resetCache();
    APIManager.init();

    [this.newServers, this.remServers, this.closedCases] = await Promise.all([
      ServerValidation.AddMissing(),
      ServerValidation.RemoveMissing(),
      CaseValidation.VerifyOpenCases(),
    ]);

    Timer.startTimer();
    void AutoHelperValidation.ValidateMsgs();
    void Startup.SendMessages();
  }

  private static async SendMessages() {
    const gitInfo = this.getGitInfo();
    const emb = EmbedCreator.Success('__LSPDFR Helper Initialized!__\n');
    if (gitInfo)
      emb.data.description += `> -# Build is based on commit [\`${gitInfo.shortHash}\`](https://github.com/SuperPyroManiac/LSPDFR-Helper/commit/${gitInfo.hash})\n`;

    emb.data.description +=
      `> **Cached Servers:** ${Cache.getServers().length}\n` +
      `> **Cached Plugins:** ${Cache.getPlugins().length}\n` +
      `> **Cached Errors:** ${Cache.getErrors().length}\n` +
      `> **Cached Users:** ${Cache.getUsers().length}\n` +
      `> **Cached Cases:** ${Cache.getCases().length}\n\n`;
    if (this.newServers > 0) emb.data.description += `-# Found ${this.newServers} new servers to add to the DB!\n`;
    if (this.remServers > 0) emb.data.description += `-# Found ${this.remServers} servers to remove from the DB!\n`;
    if (this.closedCases > 0) emb.data.description += `-# Closed ${this.closedCases} cases that failed verification!\n`;

    await Logger.BotLog(emb);
  }

  private static getGitInfo(): { hash: string; shortHash: string } | null {
    try {
      const hash = execSync('git rev-parse HEAD').toString().trim();
      const shortHash = hash.substring(0, 7);
      return { hash, shortHash };
    } catch {
      return null;
    }
  }
}
