import { Cache } from '../../Cache';
import { AhChannel } from '../AutoHelper/AhChannel';
import { CaseMonitor } from '../AutoHelper/CaseMonitor';

export class AutoHelperValidation {
  public static async ValidateMsgs() {
    for (const cs of Cache.getServers().filter((x) => x.enabled && x.autoSupport)) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await AhChannel.UpdateCaseMsg(cs.id);
      await CaseMonitor.Update(cs.id);
    }
  }
}
