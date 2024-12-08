import { ProcessCache } from './CustomTypes/CacheTypes/ProcessCache';
import { Case } from './CustomTypes/MainTypes/Case';
import { Error } from './CustomTypes/MainTypes/Error';
import { Plugin } from './CustomTypes/MainTypes/Plugin';
import { Server } from './CustomTypes/MainTypes/Server';
import { User } from './CustomTypes/MainTypes/User';
import { DBManager } from './Functions/DBManager';
import { RPHProcessor } from './Functions/Processors/RPH/RPHProcessor';

export type ProcessorType = RPHProcessor;
export abstract class Cache {
  private static processCache = new Map<string, ProcessCache<ProcessorType>>();
  private static pluginCache = new Map<string, Plugin>();
  private static errorCache = new Map<number, Error>();
  private static caseCache = new Map<string, Case>();
  private static userCache = new Map<string, User>();
  private static serverCache = new Map<string, Server>();

  static async resetCache() {
    this.updatePlugins((await DBManager.getPlugins()) ?? []);
    this.updateErrors((await DBManager.getErrors()) ?? []);
    this.updateCases((await DBManager.getCases()) ?? []);
    this.updateUsers((await DBManager.getUsers()) ?? []);
    this.updateServers((await DBManager.getServers()) ?? []);
  }

  static updatePlugins(plugins: Plugin[]) {
    this.pluginCache.clear();
    plugins.forEach((plugin) => this.pluginCache.set(plugin.name, plugin));
  }

  static getPlugins(): Plugin[] {
    return Array.from(this.pluginCache.values());
  }

  static getPlugin(name: string): Plugin | undefined {
    return this.pluginCache.get(name);
  }

  static updateErrors(errors: Error[]) {
    this.errorCache.clear();
    errors.forEach((error) => this.errorCache.set(error.id, error));
  }

  static getErrors(): Error[] {
    return Array.from(this.errorCache.values());
  }

  static getError(id: number): Error | undefined {
    return this.errorCache.get(id);
  }

  static updateCases(cases: Case[]) {
    this.caseCache.clear();
    cases.forEach((case_) => this.caseCache.set(case_.id, case_));
  }

  static getCases(): Case[] {
    return Array.from(this.caseCache.values());
  }

  static getCase(id: string): Case | undefined {
    return this.caseCache.get(id);
  }

  static updateUsers(users: User[]) {
    this.userCache.clear();
    users.forEach((user) => this.userCache.set(user.id, user));
  }

  static getUsers(): User[] {
    return Array.from(this.userCache.values());
  }

  static getUser(id: string): User | undefined {
    return this.userCache.get(id);
  }

  static updateServers(servers: Server[]) {
    this.serverCache.clear();
    servers.forEach((server) => this.serverCache.set(server.id, server));
  }

  static getServers(): Server[] {
    return Array.from(this.serverCache.values());
  }

  static getServer(id: string): Server | undefined {
    return this.serverCache.get(id);
  }

  //! Special Caches
  static async removeExpired() {
    this.processCache.forEach(async (cache, key) => {
      if (cache.Expire <= new Date()) {
        await cache.Cleanup();
        this.processCache.delete(key);
      }
    });
  }

  static saveProcess(messageId: string, process: ProcessCache<ProcessorType>): ProcessCache<ProcessorType> {
    if (this.processCache.has(messageId)) this.processCache.get(messageId)?.Update(process);
    else this.processCache.set(messageId, process);
    return process;
  }

  static getProcess(messageId: string): ProcessCache<ProcessorType> | undefined {
    return this.processCache.get(messageId);
  }
}
