import { Log } from './Log';

export class ELSLog extends Log {
  public elsVersion?: string;
  public ahvFound?: boolean;
  public validElsVcfs: string[] = [];
  public invalidElsVcfs: string[] = [];
  public faultyElsVcf?: string;
}
