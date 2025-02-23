/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, Prisma } from '@prisma/client';
import { Plugin } from '../CustomTypes/MainTypes/Plugin';
import { Error } from '../CustomTypes/MainTypes/Error';
import { Logger } from './Messages/Logger';
import { Case } from '../CustomTypes/MainTypes/Case';
import { User } from '../CustomTypes/MainTypes/User';
import { Server } from '../CustomTypes/MainTypes/Server';
import { Cache } from '../Cache';
import { UpdateWebhook } from '../CustomTypes/MainTypes/UpdateWebhook';
const prisma = new PrismaClient();

export class DBManager {
  private static async handleDbOperation<T>(operation: () => Promise<T>): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        await Logger.ErrLog(`Database error: ${error.code} - ${error.message}`);
      } else {
        await Logger.ErrLog(`Unexpected database error: ${error}`);
      }
      return null;
    }
  }

  public static async getPlugins(): Promise<Plugin[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.plugins.findMany();
      return results.map((result) => Object.assign(new Plugin(), result));
    });
  }

  public static async getPlugin(name: string): Promise<Plugin | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.plugins.findUnique({ where: { name } });
      return result ? Object.assign(new Plugin(), result) : null;
    });
  }

  public static async createPlugin(plugin: Plugin): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.plugins.create({
        data: {
          name: plugin.name,
          dname: plugin.dname,
          description: plugin.description ?? null,
          version: plugin.version ?? null,
          eaVersion: plugin.eaVersion ?? null,
          id: plugin.id ?? null,
          link: plugin.link ?? null,
          type: plugin.type as any,
          state: plugin.state as any,
        },
      });
    });
    Cache.updatePlugins((await this.getPlugins()) ?? []);
  }

  public static async editPlugin(plugin: Plugin): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.plugins.update({
        where: { name: plugin.name },
        data: plugin,
      });
    });
    Cache.updatePlugins((await this.getPlugins()) ?? []);
  }

  public static async deletePlugin(name: string): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.plugins.delete({ where: { name } });
    });
    Cache.updatePlugins((await this.getPlugins()) ?? []);
  }

  public static async getErrors(): Promise<Error[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.errors.findMany();
      return results.map((result) => Object.assign(new Error(), result));
    });
  }

  public static async getError(id: number): Promise<Error | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.errors.findUnique({ where: { id } });
      return result ? Object.assign(new Error(), result) : null;
    });
  }

  public static async createError(error: Error): Promise<number> {
    const result = await this.handleDbOperation(async () => {
      const created = await prisma.errors.create({
        data: {
          pattern: error.pattern ?? null,
          solution: error.solution ?? null,
          description: error.description ?? null,
          stringMatch: error.stringMatch,
          level: error.level as any,
        },
      });
      Cache.updateErrors((await this.getErrors()) ?? []);
      return created.id;
    });
    return result ?? 0;
  }

  public static async editError(error: Error): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.errors.update({
        where: { id: error.id },
        data: {
          pattern: error.pattern,
          solution: error.solution,
          description: error.description,
          stringMatch: error.stringMatch,
          level: error.level,
        },
      });
    });
    Cache.updateErrors((await this.getErrors()) ?? []);
  }

  public static async deleteError(id: number): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.errors.delete({ where: { id } });
    });
    Cache.updateErrors((await this.getErrors()) ?? []);
  }

  public static async getCases(): Promise<Case[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.cases.findMany();
      return results.map((result) => Object.assign(new Case(), result));
    });
  }

  public static async getCase(id: string): Promise<Case | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.cases.findUnique({ where: { id } });
      return result ? Object.assign(new Case(), result) : null;
    });
  }

  public static async createCase(caseItem: Case): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.cases.create({
        data: {
          id: caseItem.id,
          ownerId: caseItem.ownerId!,
          channelId: caseItem.channelId!,
          serverId: caseItem.serverId!,
          open: caseItem.open,
          createDate: caseItem.createDate,
          expireDate: caseItem.expireDate,
        },
      });
    });
    Cache.updateCases((await this.getCases()) ?? []);
  }

  public static async editCase(caseItem: Case): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.cases.update({
        where: { id: caseItem.id },
        data: caseItem,
      });
    });
    Cache.updateCases((await this.getCases()) ?? []);
  }

  public static async deleteCase(id: string): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.cases.delete({ where: { id } });
    });
    Cache.updateCases((await this.getCases()) ?? []);
  }

  public static async getUsers(): Promise<User[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.users.findMany();
      return results.map((result) => Object.assign(new User(), result));
    });
  }

  public static async getUser(id: string): Promise<User | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.users.findUnique({ where: { id } });
      return result ? Object.assign(new User(), result) : null;
    });
  }

  public static async createUser(users: User | User[]): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.users.createMany({
        data: Array.isArray(users)
          ? users.map((user) => ({
              id: user.id,
              name: user.name,
              banned: user.banned,
              botEditor: user.botEditor,
              botAdmin: user.botAdmin,
            }))
          : [
              {
                id: users.id,
                name: users.name,
                banned: users.banned,
                botEditor: users.botEditor,
                botAdmin: users.botAdmin,
              },
            ],
        skipDuplicates: true,
      });
    });
    Cache.updateUsers((await this.getUsers()) ?? []);
  }

  public static async editUser(user: User): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.users.update({
        where: { id: user.id },
        data: user,
      });
    });
    Cache.updateUsers((await this.getUsers()) ?? []);
  }

  public static async deleteUser(id: string): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.users.delete({ where: { id } });
    });
    Cache.updateUsers((await this.getUsers()) ?? []);
  }

  public static async getServers(): Promise<Server[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.servers.findMany();
      return results.map((result) => Object.assign(new Server(), result));
    });
  }

  public static async getServer(id: string): Promise<Server | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.servers.findUnique({ where: { id } });
      return result ? Object.assign(new Server(), result) : null;
    });
  }

  public static async createServer(server: Server): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.servers.create({
        data: {
          id: server.id,
          name: server.name!,
          ownerId: server.ownerId!,
          enabled: server.enabled,
          banned: server.banned,
          redirect: server.redirect,
          request: server.request,
          ahType: server.ahType,
          ahChId: server.ahChId,
          ahMonChId: server.ahMonChId,
          announceChId: server.announceChId,
        },
      });
    });
    Cache.updateServers((await this.getServers()) ?? []);
  }

  public static async editServer(server: Server): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.servers.update({
        where: { id: server.id },
        data: server,
      });
    });
    Cache.updateServers((await this.getServers()) ?? []);
  }

  public static async deleteServer(id: string): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.servers.delete({ where: { id } });
    });
    Cache.updateServers((await this.getServers()) ?? []);
  }

  public static async createWebhook(webhook: UpdateWebhook): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.updatewebhooks.create({
        data: {
          serverId: webhook.serverId,
          channelId: webhook.channelId,
          webhookUrl: webhook.webhookUrl,
        },
      });
    });
  }

  public static async getWebhook(serverId: string): Promise<UpdateWebhook | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.updatewebhooks.findUnique({ where: { serverId } });
      return result ? new UpdateWebhook(result.serverId, result.channelId, result.webhookUrl) : null;
    });
  }

  public static async getWebhooks(): Promise<UpdateWebhook[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.updatewebhooks.findMany();
      return results.map((result) => new UpdateWebhook(result.serverId, result.channelId, result.webhookUrl));
    });
  }

  public static async deleteWebhook(serverId: string): Promise<void> {
    await this.handleDbOperation(async () => {
      await prisma.updatewebhooks.delete({ where: { serverId } });
    });
  }
}
