import { PrismaClient, Prisma } from '@prisma/client';
import { Plugin } from '../CustomTypes/MainTypes/Plugin';
import { Error } from '../CustomTypes/MainTypes/Error';
import { Logger } from './Messages/Logger';
import { Case } from '../CustomTypes/MainTypes/Case';
import { User } from '../CustomTypes/MainTypes/User';
import { Server } from '../CustomTypes/MainTypes/Server';
const prisma = new PrismaClient();

export abstract class DBManager {
  private static async handleDbOperation<T>(operation: () => Promise<T>): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        Logger.ErrLog(`Database error: ${error.code} - ${error.message}`);
      } else {
        Logger.ErrLog(`Unexpected database error: ${error}`);
      }
      return null;
    }
  }

  static async getPlugins(): Promise<Plugin[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.plugins.findMany();
      return results.map((result) => Object.assign(new Plugin(), result));
    });
  }

  static async getPlugin(name: string): Promise<Plugin | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.plugins.findUnique({ where: { name } });
      return result ? Object.assign(new Plugin(), result) : null;
    });
  }

  static async createPlugin(plugin: Plugin): Promise<void> {
    this.handleDbOperation(async () => {
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
  }

  static async editPlugin(plugin: Plugin): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.plugins.update({
        where: { name: plugin.name },
        data: plugin,
      });
    });
  }

  static async deletePlugin(name: string): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.plugins.delete({ where: { name } });
    });
  }

  static async getErrors(): Promise<Error[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.errors.findMany();
      return results.map((result) => Object.assign(new Error(), result));
    });
  }

  static async getError(id: number): Promise<Error | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.errors.findUnique({ where: { id } });
      return result ? Object.assign(new Error(), result) : null;
    });
  }

  static async createError(error: Error): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.errors.create({
        data: {
          pattern: error.pattern ?? null,
          solution: error.solution ?? null,
          description: error.description ?? null,
          stringMatch: error.stringMatch,
          level: error.level as any,
        },
      });
    });
  }

  static async editError(error: Error): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.errors.update({
        where: { id: error.id },
        data: error,
      });
    });
  }

  static async deleteError(id: number): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.errors.delete({ where: { id } });
    });
  }

  static async getCases(): Promise<Case[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.cases.findMany();
      return results.map((result) => Object.assign(new Case(), result));
    });
  }

  static async getCase(id: string): Promise<Case | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.cases.findUnique({ where: { id } });
      return result ? Object.assign(new Case(), result) : null;
    });
  }

  static async createCase(caseItem: Case): Promise<void> {
    this.handleDbOperation(async () => {
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
  }

  static async editCase(caseItem: Case): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.cases.update({
        where: { id: caseItem.id },
        data: caseItem,
      });
    });
  }

  static async deleteCase(id: string): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.cases.delete({ where: { id } });
    });
  }

  static async getUsers(): Promise<User[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.users.findMany();
      return results.map((result) => Object.assign(new User(), result));
    });
  }

  static async getUser(id: string): Promise<User | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.users.findUnique({ where: { id } });
      return result ? Object.assign(new User(), result) : null;
    });
  }

  static async createUsers(users: User[]): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.users.createMany({
        data: users.map((user) => ({
          id: user.id,
          name: user.name,
          banned: user.banned,
          botEditor: user.botEditor,
          botAdmin: user.botAdmin,
        })),
        skipDuplicates: true,
      });
    });
  }

  static async createUser(user: User): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.users.create({
        data: {
          id: user.id,
          name: user.name,
          banned: user.banned,
          botEditor: user.botEditor,
          botAdmin: user.botAdmin,
        },
      });
    });
  }

  static async editUser(user: User): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.users.update({
        where: { id: user.id },
        data: user,
      });
    });
  }

  static async deleteUser(id: string): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.users.delete({ where: { id } });
    });
  }

  static async getServers(): Promise<Server[] | null> {
    return this.handleDbOperation(async () => {
      const results = await prisma.servers.findMany();
      return results.map((result) => Object.assign(new Server(), result));
    });
  }

  static async getServer(id: string): Promise<Server | null> {
    return this.handleDbOperation(async () => {
      const result = await prisma.servers.findUnique({ where: { id } });
      return result ? Object.assign(new Server(), result) : null;
    });
  }

  static async createServer(server: Server): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.servers.create({
        data: {
          id: server.id,
          name: server.name!,
          ownerId: server.ownerId!,
          enabled: server.enabled,
          banned: server.banned,
          autoSupport: server.autoSupport,
          ahCases: server.ahCases,
          ahChId: server.ahChId,
          ahMonChId: server.ahMonChId,
          announceChId: server.announceChId,
          updateChId: server.updateChId,
        },
      });
    });
  }

  static async editServer(server: Server): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.servers.update({
        where: { id: server.id },
        data: server,
      });
    });
  }

  static async deleteServer(id: string): Promise<void> {
    this.handleDbOperation(async () => {
      await prisma.servers.delete({ where: { id } });
    });
  }
}
