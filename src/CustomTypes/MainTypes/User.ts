export class User {
  public id: string;
  public name: string = '';
  public banned: boolean = false;
  public botEditor: boolean = false;
  public botAdmin: boolean = false;

  public constructor(id: string = '') {
    this.id = id;
  }

  public clone(): User {
    return Object.assign(new User(), JSON.parse(JSON.stringify(this)));
  }
}
