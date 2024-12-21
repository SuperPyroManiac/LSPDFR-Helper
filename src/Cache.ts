import cluster from 'cluster';
import { InteractionCache } from './CustomTypes/CacheTypes/InteractionCache';
import { ProcessCache } from './CustomTypes/CacheTypes/ProcessCache';
import { Case } from './CustomTypes/MainTypes/Case';
import { Error } from './CustomTypes/MainTypes/Error';
import { Plugin } from './CustomTypes/MainTypes/Plugin';
import { Server } from './CustomTypes/MainTypes/Server';
import { User } from './CustomTypes/MainTypes/User';
import { DBManager } from './Functions/DBManager';
import { ASIProcessor } from './Functions/Processors/ASI/ASIProcessor';
import { ELSProcessor } from './Functions/Processors/ELS/ELSProcessor';
import { RPHProcessor } from './Functions/Processors/RPH/RPHProcessor';

export type ProcessorType = RPHProcessor | ELSProcessor | ASIProcessor;

export class Cache {
  private static processCache = cluster.isPrimary ? new Map<string, ProcessCache<ProcessorType>>() : null;
  private static interactionCache = cluster.isPrimary ? new Map<string, InteractionCache>() : null;
  private static pluginCache = cluster.isPrimary ? new Map<string, Plugin>() : null;
  private static errorCache = cluster.isPrimary ? new Map<number, Error>() : null;
  private static caseCache = cluster.isPrimary ? new Map<string, Case>() : null;
  private static userCache = cluster.isPrimary ? new Map<string, User>() : null;
  private static serverCache = cluster.isPrimary ? new Map<string, Server>() : null;

  private static async primaryAction<T>(action: () => T): Promise<T> {
    if (cluster.isPrimary) {
      return action();
    }

    return new Promise((resolve) => {
      const id = Math.random().toString(36);
      process.send?.({ type: 'CACHE_ACTION', id, action: action.toString() });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      process.once('message', (response: any) => {
        if (response.id === id) {
          resolve(response.result);
        }
      });
    });
  }

  public static async resetCache() {
    await this.primaryAction(() => {
      this.pluginCache?.clear();
      this.errorCache?.clear();
      this.caseCache?.clear();
      this.userCache?.clear();
      this.serverCache?.clear();
    });

    const [plugins, errors, cases, users, servers] = await Promise.all([
      DBManager.getPlugins(),
      DBManager.getErrors(),
      DBManager.getCases(),
      DBManager.getUsers(),
      DBManager.getServers(),
    ]);

    await Promise.all([
      this.updatePlugins(plugins ?? []),
      this.updateErrors(errors ?? []),
      this.updateCases(cases ?? []),
      this.updateUsers(users ?? []),
      this.updateServers(servers ?? []),
    ]);
  }

  public static async updatePlugins(plugins: Plugin[]) {
    return this.primaryAction(() => {
      this.pluginCache?.clear();
      plugins.forEach((plugin) => this.pluginCache?.set(plugin.name, plugin));
    });
  }

  public static async getPlugins(): Promise<Plugin[]> {
    return this.primaryAction(() => Array.from(this.pluginCache?.values() ?? []));
  }

  public static async getPlugin(name: string): Promise<Plugin | undefined> {
    return this.primaryAction(() => this.pluginCache?.get(name));
  }

  public static async updateErrors(errors: Error[]) {
    return this.primaryAction(() => {
      this.errorCache?.clear();
      errors.forEach((error) => this.errorCache?.set(error.id, error));
    });
  }

  public static async getErrors(): Promise<Error[]> {
    return this.primaryAction(() => Array.from(this.errorCache?.values() ?? []));
  }

  public static async getError(id: number): Promise<Error | undefined> {
    return this.primaryAction(() => this.errorCache?.get(id));
  }

  // Cases methods
  public static async updateCases(cases: Case[]) {
    return this.primaryAction(() => {
      this.caseCache?.clear();
      cases.forEach((case_) => this.caseCache?.set(case_.id, case_));
    });
  }

  public static async getCases(): Promise<Case[]> {
    return this.primaryAction(() => Array.from(this.caseCache?.values() ?? []));
  }

  public static async getCase(id: string): Promise<Case | undefined> {
    return this.primaryAction(() => this.caseCache?.get(id));
  }

  // Users methods
  public static async updateUsers(users: User[]) {
    return this.primaryAction(() => {
      this.userCache?.clear();
      users.forEach((user) => this.userCache?.set(user.id, user));
    });
  }

  public static async getUsers(): Promise<User[]> {
    return this.primaryAction(() => Array.from(this.userCache?.values() ?? []));
  }

  public static async getUser(id: string): Promise<User | undefined> {
    return this.primaryAction(() => this.userCache?.get(id));
  }

  // Servers methods
  public static async updateServers(servers: Server[]) {
    return this.primaryAction(() => {
      this.serverCache?.clear();
      servers.forEach((server) => this.serverCache?.set(server.id, server));
    });
  }

  public static async getServers(): Promise<Server[]> {
    return this.primaryAction(() => Array.from(this.serverCache?.values() ?? []));
  }

  public static async getServer(id: string): Promise<Server | undefined> {
    return this.primaryAction(() => this.serverCache?.get(id));
  }

  public static async saveProcess(messageId: string, process: ProcessCache<ProcessorType>): Promise<ProcessCache<ProcessorType>> {
    return this.primaryAction(async () => {
      if (this.processCache?.has(messageId)) {
        await this.processCache.get(messageId)?.Update(process);
      } else {
        this.processCache?.set(messageId, process);
      }
      return process;
    });
  }

  public static async getProcess(messageId: string): Promise<ProcessCache<ProcessorType> | undefined> {
    return this.primaryAction(() => this.processCache?.get(messageId));
  }

  private static getInteractionKey(userId: string, msgId: string): string {
    return `${userId}%${msgId}`;
  }

  public static async saveInteraction(userId: string, msgId: string, newCache: InteractionCache) {
    return this.primaryAction(() => {
      const key = this.getInteractionKey(userId, msgId);
      this.interactionCache?.set(key, newCache);
    });
  }

  public static async getInteraction(userId: string, msgId: string): Promise<InteractionCache | undefined> {
    return this.primaryAction(() => {
      const key = this.getInteractionKey(userId, msgId);
      return this.interactionCache?.get(key);
    });
  }

  public static async removeExpired() {
    return this.primaryAction(async () => {
      const now = new Date();

      for (const [key, cache] of this.processCache?.entries() ?? []) {
        if (cache.Expire <= now) {
          await cache.Cleanup();
          this.processCache?.delete(key);
        }
      }

      for (const [key, cache] of this.interactionCache?.entries() ?? []) {
        if (cache.Expire <= now) {
          await cache.Cleanup();
          this.interactionCache?.delete(key);
        }
      }
    });
  }
}
