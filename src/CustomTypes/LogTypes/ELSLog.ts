import { Log } from './Log';

export class ELSLog extends Log {
  elsVersion?: string;
  ahvFound?: boolean;
  validElsVcfs: string[] = [];
  invalidElsVcfs: string[] = [];
  faultyElsVcf?: string;
}
