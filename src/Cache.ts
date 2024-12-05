import { ProcessCache } from './CustomTypes/CacheTypes/ProcessCache';
import { Error } from './CustomTypes/MainTypes/Error';
import { Plugin } from './CustomTypes/MainTypes/Plugin';
import { DBManager } from './Functions/DBManager';
import { RPHProcessor } from './Functions/Processors/RPH/RPHProcessor';

export type ProcessorType = RPHProcessor;
export abstract class Cache {
  private static processCache = new Map<string, ProcessCache<ProcessorType>>();
  private static pluginCache = new Map<string, Plugin>();
  private static errorCache = new Map<number, Error>();

  static async resetCache() {
    this.updatePlugins((await DBManager.getPlugins()) ?? []);
    this.updateErrors((await DBManager.getErrors()) ?? []);
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
