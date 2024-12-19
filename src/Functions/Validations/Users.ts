import { APIUser, User } from 'discord.js';
import { User as bUser } from '../../CustomTypes/MainTypes/User';
import { Cache } from '../../Cache';
import { DBManager } from '../DBManager';

export class UsersValidation {
  public static async Verify(user: User | APIUser) {
    if (Cache.getUser(user.id)) return;
    const usr = new bUser(user.id);
    usr.name = user.username;
    await DBManager.createUser(usr);
  }
}
