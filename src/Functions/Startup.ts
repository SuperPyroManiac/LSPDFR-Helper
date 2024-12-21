import { execSync } from 'child_process';
import { Cache } from '../Cache';
import { EmbedCreator } from './Messages/EmbedCreator';
import { Logger } from './Messages/Logger';
import { AutoHelperValidation } from './Validations/AutoHelper';
import { CaseValidation } from './Validations/Cases';
import { ServerValidation } from './Validations/Servers';
import { container } from '@sapphire/framework';
import { APIManager } from '../Web/APIManager';
import { Timer } from './Timer';
import { Message } from 'discord.js';
import { ShardUtils } from './ShardUtils';

export class Startup {
  private static newServers = 0;
  private static remServers = 0;
  private static closedCases = 0;
  private static msg: boolean | Message<boolean> | undefined;

  public static async ManagerInit() {
    await Cache.resetCache();
    APIManager.init(ShardUtils.manager);
    void AutoHelperValidation.ValidateMsgs();
    const ch = await ShardUtils.getChannel(process.env['BOT_LOG_CHANNEL']!);
    this.msg =
      ch &&
      ch?.isSendable() &&
      (await ch.send({ embeds: [EmbedCreator.Loading(`__LSPDFR Helper Initializing!__\n> Loading ${container.client.shard?.count ?? 1} shards!`)] }));
  }

  public static async Init() {
    await this.SendShardMessage();
  }

  public static async ready() {
    console.log('All shards are ready! POOP');
    [this.newServers, this.remServers, this.closedCases] = await Promise.all([
      ServerValidation.AddMissing(),
      ServerValidation.RemoveMissing(),
      CaseValidation.VerifyOpenCases(),
    ]);
    Timer.startTimer();
    await Startup.SendManagerMessage(this.msg as Message);
  }

  private static async SendManagerMessage(msg: Message) {
    const totalShards = container.client.shard?.count ?? 1;
    const gitInfo = this.getGitInfo();
    const emb = EmbedCreator.Success('__LSPDFR Helper Initialized!__\n');
    if (gitInfo)
      emb.data.description += `> -# Build is based on commit [\`${gitInfo.shortHash}\`](https://github.com/SuperPyroManiac/LSPDFR-Helper/commit/${gitInfo.hash})\n`;

    emb.data.description +=
      `> **Shards:** ${totalShards}\n` +
      `> **Enabled Servers:** ${(await Cache.getServers()).filter((x) => x.enabled).length}\n` +
      `> **Cached Plugins:** ${(await Cache.getPlugins()).length}\n` +
      `> **Cached Errors:** ${(await Cache.getErrors()).length}\n` +
      `> **Cached Users:** ${(await Cache.getUsers()).length}\n` +
      `> **Cached Cases:** ${(await Cache.getCases()).length}\n\n`;
    if (this.newServers > 0) emb.data.description += `-# Found ${this.newServers} new servers to add to the DB!\n`;
    if (this.remServers > 0) emb.data.description += `-# Found ${this.remServers} servers to remove from the DB!\n`;
    if (this.closedCases > 0) emb.data.description += `-# Closed ${this.closedCases} cases that failed verification!\n`;

    await msg.edit({ embeds: [emb] }).catch(() => void 0);
  }

  private static async SendShardMessage() {
    const shardId = container.client.shard?.ids[0] ?? 0;
    const totalShards = container.client.shard?.count ?? 1;
    const emb = EmbedCreator.Info('__Shard Started!__\n');

    emb.data.description +=
      `> **Shard:** ${shardId + 1}/${totalShards}\n` +
      `> **Managed Servers:** ${container.client.guilds.cache.keys.length}/${(await Cache.getServers()).filter((x) => x.enabled).length}\n`;

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
