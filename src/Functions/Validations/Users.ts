import { container } from '@sapphire/framework';
import { Cache } from '../../Cache';
import { User } from '../../CustomTypes/MainTypes/User';
import { DBManager } from '../DBManager';
import { GuildMember } from 'discord.js';

export abstract class UsersValidation {
  static async Verify() {
    this.AddMissing();
    this.UpdateNames();
  }

  static async AddMissing(): Promise<number> {
    let allUsers = new Set<GuildMember>();
    const newUsers = [];

    for (const servers of container.client.guilds.cache.values()) {
      const users = await servers.members.fetch();
      for (const user of Array.from(users.values())) {
        allUsers.add(user);
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
      Cache.updateUsers((await DBManager.getUsers()) ?? []);
    }
    return newUsers.length;
  }

  static async UpdateNames(): Promise<number> {
    let updateCount = 0;
    let allUsers = new Set<GuildMember>();

    // Collect all current users from guilds
    for (const servers of container.client.guilds.cache.values()) {
      const users = await servers.members.fetch();
      for (const user of Array.from(users.values())) {
        allUsers.add(user);
      }
    }

    // Check for name changes
    for (const member of allUsers) {
      const cachedUser = Cache.getUser(member.id);
      if (cachedUser && cachedUser.name !== member.user.username) {
        cachedUser.name = member.user.username;
        await DBManager.editUser(cachedUser);
        updateCount++;
      }
    }

    if (updateCount > 0) {
      Cache.updateUsers((await DBManager.getUsers()) ?? []);
    }

    return updateCount;
  }
}
