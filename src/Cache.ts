import { Error } from './CustomTypes/MainTypes/Error';
import { Plugin } from './CustomTypes/MainTypes/Plugin';
import { DBManager } from './Functions/DBManager';

export abstract class Cache {
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
}
