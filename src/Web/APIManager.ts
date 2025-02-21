import express from 'express';
import cors from 'cors';
import { VersionChecker } from './VersionChecker';
import { ErrorReport } from './ErrorReport';
import { UpdateServer } from './SiteConnect/UpdateServer';
import { AddPlugin } from './SiteConnect/Plugins/AddPlugin';
import { RemovePlugin } from './SiteConnect/Plugins/RemovePlugin';
import { EditPlugin } from './SiteConnect/Plugins/EditPlugin';

export class APIManager {
  private static app = express();
  private static port = 8055;

  public static init() {
    if (process.env['MAIN_SERVER'] !== '736140566311600138') return;
    this.app.use(cors());
    this.app.use(express.json());
    this.setupRoutes();
    this.startServer();

    VersionChecker.init();
    ErrorReport.init();
    UpdateServer.init();
    AddPlugin.init();
    EditPlugin.init();
    RemovePlugin.init();
  }

  private static setupRoutes() {
    this.app.get('/', (_req, res) => {
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
