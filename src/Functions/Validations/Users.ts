import { container } from '@sapphire/framework';
import { Cache } from '../../Cache';
import { User } from '../../CustomTypes/MainTypes/User';
import { DBManager } from '../DBManager';
import { codeBlock, GuildMember } from 'discord.js';
import { Logger } from '../Messages/Logger';

export class UsersValidation {
  public static async Verify() {
    void this.AddMissing();
    void this.UpdateNames();
  }

  public static async AddMissing(): Promise<number> {
    const allUsers = new Set<GuildMember>();
    const newUsers = [];

    for (const servers of container.client.guilds.cache.values()) {
      try {
        const users = await servers.members.fetch({ time: 60000 });
        users.forEach((user) => allUsers.add(user));
      } catch (error) {
        await Logger.ErrLog(`Failed to fetch members for server ${servers.id}\n${codeBlock(String(error))}`);
        continue;
      }
    }

    for (const user of allUsers) {
      if (!Cache.getUser(user.id)) {
        const newUser = new User(user.id);
        newUser.name = user.user.username;
        newUsers.push(newUser);
      }
    }

    if (newUsers.length > 0) {
      await DBManager.createUsers(newUsers);
    }
    return newUsers.length;
  }

  public static async UpdateNames(): Promise<number> {
    let updateCount = 0;
    const allUsers = new Set<GuildMember>();

    for (const servers of container.client.guilds.cache.values()) {
      try {
        const users = await servers.members.fetch({ time: 60000 });
        users.forEach((user) => allUsers.add(user));
      } catch (error) {
        await Logger.ErrLog(`Failed to fetch members for server ${servers.id}\n${codeBlock(String(error))}`);
        continue;
      }
    }

    for (const member of allUsers) {
      const cachedUser = Cache.getUser(member.id);
      if (cachedUser && cachedUser.name !== member.user.username) {
        cachedUser.name = member.user.username;
        await DBManager.editUser(cachedUser);
        updateCount++;
      }
    }

    return updateCount;
  }
}
