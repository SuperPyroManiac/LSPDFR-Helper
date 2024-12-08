import { Cache } from '../../Cache';
import { container } from '@sapphire/framework';
import { Server } from '../../CustomTypes/MainTypes/Server';
import { DBManager } from '../DBManager';
import { EmbedCreator } from '../Messages/EmbedCreator';
import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle } from 'discord.js';
import { Logger } from '../Messages/Logger';

export abstract class ServerValidation {
  private static runningAdd = false;
  private static runningRem = false;

  static async Verify() {
    await this.AddMissing();
    await this.RemoveMissing();
  }

  static async AddMissing(): Promise<number> {
    if (this.runningAdd) return 0;
    this.runningAdd = true;
    let cnt = 0;
    for (const server of Array.from(container.client.guilds.cache.values())) {
      const ch = server.systemChannel;
      const owner = await server.fetchOwner();
      let cachedServ = Cache.getServer(server.id);

      const emb = EmbedCreator.Success(
        `__LSPDFR Helper Added!__\r\n` +
          `-# This bot is able to read a multitude of different log types and even provide support autonomously!\r\n\r\n` +
          `Created by SuperPyroManiac with the help of Hammer using data collected from ULSS, RPH, and DG.\r\n` +
          `To contribute or for more information, you may visit the PF Discord or GitHub.\r\n\r\n` +
          `To get started, simply use the /Setup command. This will allow you to configure the bots channels and autohelper.\r\n` +
          `A web interface is currently in development to replace this, but for now you may run the command at any time to adjust its settings.\r\n\r\n` +
          `*You may delete this message or click the buttons below for more info!*`
      );
      emb.setThumbnail('https://i.imgur.com/jxODw4N.png');
      const comps = new ActionRowBuilder<ButtonBuilder>();
      comps.addComponents([new ButtonBuilder().setURL('https://dsc.pyrosfun.com/').setLabel('Pyros Discord').setStyle(ButtonStyle.Link)]);
      comps.addComponents([new ButtonBuilder().setURL('https://www.pyrosfun.com/').setLabel('Pyros Website').setStyle(ButtonStyle.Link)]);
      comps.addComponents([new ButtonBuilder().setURL('https://github.com/SuperPyroManiac/LSPDFR-Helper').setLabel('GitHub').setStyle(ButtonStyle.Link)]);

      if (!cachedServ) {
        cachedServ = new Server(server.id);
        cachedServ.name = server.name;
        cachedServ.ownerId = server.ownerId;
        await DBManager.createServer(cachedServ);
        await ch?.send({ embeds: [emb], components: [comps] });
        await Logger.ServerLog(
          EmbedCreator.Success(
            `__Server Added!__\r\n>>> ` +
              `**Server Name:** ${server.name}\r\n` +
              `**Server Id:** ${server.id}\r\n` +
              `**Members:** ${server.memberCount}\r\n` +
              `**Owner:** ${owner.user.username} (${owner.user.id})`
          ).setThumbnail(server.iconURL())
        );
        cnt++;
        continue;
      }

      if (cachedServ.banned) {
        await ch?.send({
          embeds: [
            EmbedCreator.Error('__Server Is Banned!__\r\n>>> This server has been banned from using this bot. You may appeal this by contacting us on our Discord.'),
          ],
          components: [comps],
        });
        await server.leave();
        await Logger.ServerLog(
          EmbedCreator.Error(
            `__Server Banned!__\r\n>>> ` +
              `**Server Name:** ${server.name}\r\n` +
              `**Server Id:** ${server.id}\r\n` +
              `**Members:** ${server.memberCount}\r\n` +
              `**Owner:** ${owner.user.username} (${owner.user.id})`
          ).setThumbnail(server.iconURL())
        );
        cachedServ.enabled = false;
        await DBManager.editServer(cachedServ);
        continue;
      }

      if (!cachedServ.enabled) {
        cachedServ.enabled = true;
        DBManager.editServer(cachedServ);
        await ch?.send({ embeds: [emb], components: [comps] });
        await Logger.ServerLog(
          EmbedCreator.Success(
            `__Server Added!__\r\n>>> ` +
              `**Server Name:** ${server.name}\r\n` +
              `**Server Id:** ${server.id}\r\n` +
              `**Members:** ${server.memberCount}\r\n` +
              `**Owner:** ${owner.user.username} (${owner.user.id})`
          ).setThumbnail(server.iconURL())
        );
        cnt++;
        continue;
      }
    }
    if (cnt > 0) Cache.updateServers((await DBManager.getServers()) ?? []);
    this.runningAdd = false;
    return cnt;
  }

  static async RemoveMissing(): Promise<number> {
    if (this.runningRem) return 0;
    this.runningRem = true;
    let cnt = 0;

    for (const server of Cache.getServers().filter((x) => x.enabled === true)) {
      if (!container.client.guilds.cache.has(server.id)) {
        const serv = await DBManager.getServer(server.id);
        if (serv?.enabled === false) continue;
        server.enabled = false;
        await DBManager.editServer(server);
        await Logger.ServerLog(
          EmbedCreator.Info(
            `__Server Removed!__\r\n>>> ` + `**Server Name:** ${server.name}\r\n` + `**Server Id:** ${server.id}\r\n` + `**Owner Id:** ${server.ownerId}`
          )
        );
        cnt++;
      }
    }
    if (cnt > 0) Cache.updateServers((await DBManager.getServers()) ?? []);
    this.runningRem = false;
    return cnt;
  }
}
