import { Events, Listener } from '@sapphire/framework';
import { Guild } from 'discord.js';
import { Cache } from '../Cache';
import { DBManager } from '../Functions/DBManager';
import { Logger } from '../Functions/Messages/Logger';
import { EmbedCreator } from '../Functions/Messages/EmbedCreator';

export class GuildLeaveListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.GuildDelete,
    });
  }

  public async run(guild: Guild) {
    const server = Cache.getServer(guild.id);
    if (!server) return;
    server.enabled = false;
    const owner = await guild.fetchOwner();
    await DBManager.editServer(server);
    Cache.updateServers((await DBManager.getServers()) ?? []);
    await Logger.ServerLog(
      EmbedCreator.Info(
        `__Server Removed!__\r\n>>> ` +
          `**Server Name:** ${guild.name}\r\n` +
          `**Server Id:** ${guild.id}\r\n` +
          `**Members:** ${guild.memberCount}\r\n` +
          `**Owner:** ${owner.user.username} (${owner.user.id})`
      ).setThumbnail(guild.iconURL())
    );
  }
}
