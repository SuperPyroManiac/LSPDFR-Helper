import { Cache } from '../Cache';
import { APIManager } from './APIManager';

export class VersionChecker {
  public static init() {
    const app = APIManager.getApp();

    app.get('/ver/:pluginName', async (req, res) => {
      const version = this.getPluginVersion(req.params.pluginName);
      res.contentType('text/plain');
      res.send(version);
    });
  }

  private static async getPluginVersion(pluginName: string): Promise<string> {
    const plugin = await Cache.getPlugin(pluginName);
    return plugin?.version || 'Plugin not found';
  }
}
