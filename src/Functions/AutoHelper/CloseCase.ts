import { Case } from '../../CustomTypes/MainTypes/Case';
import { DBManager } from '../DBManager';
import { EmbedCreator } from '../Messages/EmbedCreator';
import { CaseMonitor } from './CaseMonitor';

export class CloseCase {
  public static async Close(ac: Case, force: boolean = false): Promise<boolean> {
    if (!ac.open) return false;
    ac.open = false;
    ac.expireDate = new Date();
    await DBManager.editCase(ac);
    if (force) return true;

    const ch = ac.getAhChannel();
    if (!ch) return false;

    await ch.send({
      embeds: [EmbedCreator.Warning('___Thread has been archived!___\r\n>>> It is now closed to replies. If you need further help you may open a new case!')],
    });
    await ch.setLocked(true);
    await ch.setArchived(true);

    await CaseMonitor.Update(ac.serverId);
    return true;
  }
}
