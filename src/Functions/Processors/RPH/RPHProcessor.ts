import { RPHLog } from '../../../CustomTypes/LogTypes/RPHLog';

export class RPHProcessor {
  public log: RPHLog;
  public msgId: string;

  constructor(log: RPHLog, msgId: string) {
    this.log = log;
    this.msgId = msgId;
  }
}
