import { container } from '@sapphire/framework';
import { Cache } from '../../Cache';
import { User } from '../../CustomTypes/MainTypes/User';
import { DBManager } from '../DBManager';
import { codeBlock, GuildMember } from 'discord.js';
import { Logger } from '../Messages/Logger';

export abstract class UsersValidation {
  static async Verify() {
    this.AddMissing();
    this.UpdateNames();
  }

  static async AddMissing(): Promise<number> {
    let allUsers = new Set<GuildMember>();
    const newUsers = [];

    for (const servers of container.client.guilds.cache.values()) {
      try {
        const users = await servers.members.fetch({ time: 60000 });
        users.forEach((user) => allUsers.add(user));
      } catch (error) {
        Logger.ErrLog(`Failed to fetch members for server ${servers.id}\n${codeBlock(String(error))}`);
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

  static async UpdateNames(): Promise<number> {
    let updateCount = 0;
    let allUsers = new Set<GuildMember>();

    for (const servers of container.client.guilds.cache.values()) {
      try {
        const users = await servers.members.fetch({ time: 60000 });
        users.forEach((user) => allUsers.add(user));
      } catch (error) {
        Logger.ErrLog(`Failed to fetch members for server ${servers.id}\n${codeBlock(String(error))}`);
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
