import { Guild, ShardingManager, TextChannel } from 'discord.js';
import cluster from 'cluster';

export class ShardUtils {
  private static _manager: ShardingManager | null = cluster.isPrimary ? null : null;

  private static async primaryAction<T>(action: () => T): Promise<T> {
    if (cluster.isPrimary) {
      return action();
    }

    return new Promise((resolve) => {
      const id = Math.random().toString(36);
      process.send?.({ type: 'SHARD_ACTION', id, action: action.toString() });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      process.once('message', (response: any) => {
        if (response.id === id) {
          resolve(response.result);
        }
      });
    });
  }

  public static setManager(manager: ShardingManager) {
    this._manager = manager;
    if (cluster.isPrimary) {
      manager.on('shardCreate', (shard) => {
        console.log(`[ShardUtils] Shard ${shard.id} created`);
        // Send manager to the worker
        void shard.send({ type: 'MANAGER_INIT', manager });
      });
    }
  }

  public static get manager(): ShardingManager {
    if (!this._manager && cluster.isPrimary) {
      throw new Error('ShardingManager not initialized');
    }
    return this._manager!;
  }

  public static async getAllGuilds(): Promise<Guild[]> {
    return this.primaryAction(async () => {
      const guildDataArrays = (await this._manager!.broadcastEval((client) => Array.from(client.guilds.cache.values()), { context: undefined })) as Guild[][];
      return guildDataArrays.flat();
    });
  }

  public static async getTotalGuildCount(): Promise<number> {
    return this.primaryAction(async () => {
      const counts = await this._manager!.broadcastEval((client) => client.guilds.cache.size);
      return counts.reduce((sum, count) => sum + count, 0);
    });
  }

  public static async getChannel(channelId: string): Promise<TextChannel | undefined> {
    return this.primaryAction(async () => {
      const channels = await this._manager!.broadcastEval(
        (c, { channelId }) => {
          const channel = c.channels.cache.get(channelId);
          if (channel?.isTextBased()) {
            const serializedChannel = {
              ...channel,
              client: undefined,
            };
            return serializedChannel;
          }
          return undefined;
        },
        { context: { channelId } }
      );
      return channels.find((ch) => ch !== undefined) as TextChannel | undefined;
    });
  }
}
