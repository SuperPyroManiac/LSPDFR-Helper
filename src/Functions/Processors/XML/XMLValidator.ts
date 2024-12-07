import { parseString } from 'xml2js';

export abstract class XMLValidator {
  public static async validate(path: string): Promise<string> {
    try {
      const xmlFile = await (await fetch(path)).text();

      return new Promise((resolve) => {
        parseString(xmlFile, (error) => {
          if (error) {
            resolve(error.message);
          } else {
            resolve('valid');
          }
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return 'An unknown error occurred';
    }
  }
}
