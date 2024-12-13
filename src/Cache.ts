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
  private static processCache = new Map<string, ProcessCache<ProcessorType>>();
  private static interactionCache = new Map<string, InteractionCache>();
  private static pluginCache = new Map<string, Plugin>();
  private static errorCache = new Map<number, Error>();
  private static caseCache = new Map<string, Case>();
  private static userCache = new Map<string, User>();
  private static serverCache = new Map<string, Server>();

  public static async resetCache() {
    this.updatePlugins((await DBManager.getPlugins()) ?? []);
    this.updateErrors((await DBManager.getErrors()) ?? []);
    this.updateCases((await DBManager.getCases()) ?? []);
    this.updateUsers((await DBManager.getUsers()) ?? []);
    this.updateServers((await DBManager.getServers()) ?? []);
  }

  public static updatePlugins(plugins: Plugin[]) {
    this.pluginCache.clear();
    plugins.forEach((plugin) => this.pluginCache.set(plugin.name, plugin));
  }

  public static getPlugins(): Plugin[] {
    return Array.from(this.pluginCache.values());
  }

  public static getPlugin(name: string): Plugin | undefined {
    return this.pluginCache.get(name);
  }

  public static updateErrors(errors: Error[]) {
    this.errorCache.clear();
    errors.forEach((error) => this.errorCache.set(error.id, error));
  }

  public static getErrors(): Error[] {
    return Array.from(this.errorCache.values());
  }

  public static getError(id: number): Error | undefined {
    return this.errorCache.get(id);
  }

  public static updateCases(cases: Case[]) {
    this.caseCache.clear();
    cases.forEach((case_) => this.caseCache.set(case_.id, case_));
  }

  public static getCases(): Case[] {
    return Array.from(this.caseCache.values());
  }

  public static getCase(id: string): Case | undefined {
    return this.caseCache.get(id);
  }

  public static updateUsers(users: User[]) {
    this.userCache.clear();
    users.forEach((user) => this.userCache.set(user.id, user));
  }

  public static getUsers(): User[] {
    return Array.from(this.userCache.values());
  }

  public static getUser(id: string): User | undefined {
    return this.userCache.get(id);
  }

  public static updateServers(servers: Server[]) {
    this.serverCache.clear();
    servers.forEach((server) => this.serverCache.set(server.id, server));
  }

  public static getServers(): Server[] {
    return Array.from(this.serverCache.values());
  }

  public static getServer(id: string): Server | undefined {
    return this.serverCache.get(id);
  }

  //! Special Caches
  public static async removeExpired() {
    const processPromises = Array.from(this.processCache.entries()).map(async ([key, cache]) => {
      if (cache.Expire <= new Date()) {
        await cache.Cleanup();
        this.processCache.delete(key);
      }
    });

    const interactionPromises = Array.from(this.interactionCache.entries()).map(async ([key, cache]) => {
      if (cache.Expire <= new Date()) {
        await cache.Cleanup();
        this.processCache.delete(key);
      }
    });

    await Promise.all([...processPromises, ...interactionPromises]);
  }

  public static saveProcess(messageId: string, process: ProcessCache<ProcessorType>): ProcessCache<ProcessorType> {
    if (this.processCache.has(messageId)) this.processCache.get(messageId)?.Update(process);
    else this.processCache.set(messageId, process);
    return process;
  }

  public static getProcess(messageId: string): ProcessCache<ProcessorType> | undefined {
    return this.processCache.get(messageId);
  }

  private static getInteractionKey = (userId: string, msgId: string): string => `${userId}%${msgId}`;

  public static saveInteraction(userId: string, msgId: string, newCache: InteractionCache) {
    const key = this.getInteractionKey(userId, msgId);
    this.interactionCache.set(key, newCache);
  }

  public static getInteraction(userId: string, msgId: string): InteractionCache | undefined {
    return this.interactionCache.get(this.getInteractionKey(userId, msgId));
  }
}
