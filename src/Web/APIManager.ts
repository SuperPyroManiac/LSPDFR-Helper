import express from 'express';

export class APIManager {
  private static app = express();
  private static port = 8055;

  public static init() {
    if (process.env.MAIN_SERVER !== '736140566311600138') return;
    this.setupRoutes();
    this.startServer();
    console.log('Web API Started!');
  }

  private static setupRoutes() {
    this.app.get('/', (req, res) => {
      res.send('API Is Running!');
    });
  }

  private static startServer() {
    this.app.listen(this.port, () => {});
  }

  public static getApp() {
    return this.app;
  }
}
