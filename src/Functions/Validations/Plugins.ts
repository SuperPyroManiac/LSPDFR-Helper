import axios from 'axios';
import * as cheerio from 'cheerio';
import { Cache } from '../../Cache';
import { State } from '../../CustomTypes/Enums/State';
import { EmbedCreator } from '../Messages/EmbedCreator';
import { Logger } from '../Messages/Logger';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { DBManager } from '../DBManager';

interface LSPDFRPlugin {
  file_id: number;
  file_name: string;
  file_version: string;
}

export class PluginValidation {
  public static async CheckUpdates() {
    const webPlugs = await this.getPlugins().catch();
    const plugs = Cache.getPlugins();

    if (!webPlugs || !webPlugs.length) return;

    for (const webPlug of webPlugs!) {
      const matchingLocalPlugs = plugs.filter((plug) => plug.id == webPlug.file_id);

      if (!matchingLocalPlugs.length) continue;

      webPlug.file_version = webPlug.file_version.split(' ')[0]!.trim();
      webPlug.file_version = webPlug.file_version.replace(/[^0-9.]/g, '');
      const onlineVersionSplit = webPlug.file_version.split('.');
      if (onlineVersionSplit.length == 2) webPlug.file_version += '.0.0';
      if (onlineVersionSplit.length == 3) webPlug.file_version += '.0';
      if (!webPlug.file_version) webPlug.file_version = '0';

      for (const localPlug of matchingLocalPlugs) {
        if (localPlug.id === 0 || localPlug.state === State.IGNORE || localPlug.state === State.EXTERNAL) continue;
        if (!localPlug.version) localPlug.version = '0';
        if (localPlug.version === webPlug.file_version) continue;

        const emb = EmbedCreator.Info('__Plugin Update__\r\n');
        emb.setThumbnail('https://i.imgur.com/jxODw4N.png');

        const mainImage = await this.getPluginMainImage(localPlug.link!);
        if (mainImage) emb.data.image = { url: mainImage };

        emb.data.description +=
          `## __[${localPlug.name}](${localPlug.link})__\r\n` +
          `> **Previous Version:** \`${localPlug.version}\`\r\n` +
          `> **New Version:** \`${webPlug.file_version}\`\r\n` +
          `> **Type:** \`${localPlug.type}\` | **State:** \`${localPlug.state}\`\r\n` +
          `> **EA Version?:** \`${Boolean(localPlug.eaVersion && localPlug.eaVersion !== '0')}\`\r\n`;

        if (this.compareVer(localPlug.version, webPlug.file_version) === 1) continue;
        localPlug.version = webPlug.file_version;
        await DBManager.editPlugin(localPlug);
        await Logger.BotLog(emb);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private static async getPlugins(): Promise<LSPDFRPlugin[]> {
    let allPlugins: LSPDFRPlugin[] = [];
    const categories = [45];

    for (const categoryId of categories) {
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        try {
          const response = await fetch(
            `https://www.lcpdfr.com/applications/downloadsng/interface/api.php?do=getAllVersions&categoryId=${categoryId}&page=${currentPage}`
          );

          if (!response.ok) return [];

          const contentType = response.headers.get('content-type');
          if (!contentType?.includes('application/json')) return [];

          const data = await response.json();

          if (data.results && data.results.length > 0) {
            allPlugins = [...allPlugins, ...data.results];
            currentPage++;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            hasMorePages = false;
          }
        } catch {
          return [];
        }
      }
    }
    return allPlugins;
  }

  private static async getPluginMainImage(pluginUrl: string): Promise<string | null> {
    const jar = new CookieJar();
    const client = wrapper(
      axios.create({
        jar,
        maxRedirects: 5,
        withCredentials: true,
      })
    );

    try {
      const response = await client.get(pluginUrl);
      const $ = cheerio.load(response.data);

      // Target the og:image meta tag specifically
      const ogImage = $('meta[property="og:image"]').attr('content');

      if (ogImage) {
        return ogImage;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  public static compareVer(version1: string, version2: string): number {
    const parts1 = version1.split('.').map(Number);
    const parts2 = version2.split('.').map(Number);
    const length = Math.max(parts1.length, parts2.length);
    for (let i = 0; i < length; i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;
      if (num1 < num2) return -1;
      if (num1 > num2) return 1;
    }
    return 0;
  }
}
