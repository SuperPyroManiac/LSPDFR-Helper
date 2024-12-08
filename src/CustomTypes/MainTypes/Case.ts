import { addDays } from 'date-fns';

export class Case {
  id: string;
  ownerId?: string;
  channelId?: string;
  serverId?: string;
  open: boolean = true;
  createDate: Date = new Date();
  expireDate: Date = addDays(new Date(), 1);

  constructor(id: string = '') {
    this.id = id;
  }

  clone(): Case {
    return Object.assign(new Case(), JSON.parse(JSON.stringify(this)));
  }
}
