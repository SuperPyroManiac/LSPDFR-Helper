export class User {
  id: string;
  name: string = '';
  banned: boolean = false;
  botEditor: boolean = false;
  botAdmin: boolean = false;

  constructor(id: string = '') {
    this.id = id;
  }

  clone(): User {
    return Object.assign(new User(), JSON.parse(JSON.stringify(this)));
  }
}
