import { PrismaClient, Prisma } from '@prisma/client';
import { Plugin } from '../CustomTypes/MainTypes/Plugin';
import { Error } from '../CustomTypes/MainTypes/Error';
import { Logger } from './Messages/Logger';
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
}
