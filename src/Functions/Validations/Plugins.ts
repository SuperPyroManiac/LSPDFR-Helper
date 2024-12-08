import * as cheerio from 'cheerio';
import { Cache } from '../../Cache';
import { State } from '../../CustomTypes/Enums/State';
import { EmbedCreator } from '../Messages/EmbedCreator';
import { Logger } from '../Messages/Logger';
import { DBManager } from '../DBManager';

interface LSPDFRPlugin {
  file_id: number;
  file_name: string;
  file_version: string;
}

export abstract class PluginValidation {
  public static async CheckUpdates() {
    const webPlugs = await this.getPlugins();
    const plugs = Cache.getPlugins();
    const emb = EmbedCreator.Info(`__Plugin Updates__\r\n-# A new version of the plugins listed have been found!\r\n`);
    let cnt = 0;

    for (const webPlug of webPlugs) {
      const plug = plugs.filter((plug) => plug.id == webPlug.file_id)[0];
      if (!plug || plug.id == 0 || plug.state === State.IGNORE || plug.state === State.EXTERNAL) continue;
      webPlug.file_version = webPlug.file_version.split(' ')[0].trim();
      webPlug.file_version = webPlug.file_version.replace(/[^0-9.]/g, '');
      const onlineVersionSplit = webPlug.file_version.split('.');
      if (onlineVersionSplit.length == 2) webPlug.file_version += '.0.0';
      if (onlineVersionSplit.length == 3) webPlug.file_version += '.0';
      if (!plug.version) plug.version = '0';
      if (!webPlug.file_version) webPlug.file_version = '0';
      if (plug.version == webPlug.file_version) continue;

      emb.data.description +=
        `## __[${plug.name}](${plug.link})__\r\n` +
        `> **Previous Version:** \`${plug.version}\`\r\n` +
        `> **New Version:** \`${webPlug.file_version}\`\r\n` +
        `> **Type:** \`${plug.type}\` | **State:** \`${plug.state}\`\r\n` +
        `> **EA Version?:** \`${plug.eaVersion && plug.eaVersion !== '0'}\`\r\n`;

      //   if (plug.link) {
      //     const thumbs = await this.getImagesFromUrl(plug.link);
      //     if (thumbs.length > 0) emb.setImage(thumbs[0]);
      //   }
      //TODO Get images

      plug.version = webPlug.file_version;
      await DBManager.editPlugin(plug);
      cnt++;
    }
    if (cnt > 0) {
      await Logger.BotLog(emb);
    }
  }

  private static async getPlugins(): Promise<LSPDFRPlugin[]> {
    let allPlugins: LSPDFRPlugin[] = [];
    const categories = [45];

    for (const categoryId of categories) {
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await fetch(
          `https://www.lcpdfr.com/applications/downloadsng/interface/api.php?do=getAllVersions&categoryId=${categoryId}&page=${currentPage}`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          allPlugins = [...allPlugins, ...data.results];
          currentPage++;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          hasMorePages = false;
        }
      }
    }
    return allPlugins;
  }

  private static async getImagesFromUrl(url: string): Promise<string[]> {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const imageUrls: string[] = [];

    // Get all images with src attribute
    $('img').each((_, element) => {
      const src = $(element).attr('src');
      if (src) imageUrls.push(src);
    });

    // Get background images from data-background-src
    $('[data-background-src]').each((_, element) => {
      const bgSrc = $(element).attr('data-background-src');
      if (bgSrc) imageUrls.push(bgSrc);
    });

    return imageUrls;
  }
}
