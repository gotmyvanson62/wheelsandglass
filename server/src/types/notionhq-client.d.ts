declare module '@notionhq/client' {
  export interface ClientOptions {
    auth?: string;
    notionVersion?: string;
    baseUrl?: string;
    fetch?: any;
  }

  export class Client {
    constructor(options?: ClientOptions);

    pages: {
      create(params: any): Promise<any>;
      retrieve(params: any): Promise<any>;
      update(params: any): Promise<any>;
    };

    databases: {
      query(params: any): Promise<any>;
      retrieve(params: any): Promise<any>;
      create(params: any): Promise<any>;
      update(params: any): Promise<any>;
    };

    blocks: {
      children: {
        append(params: any): Promise<any>;
        list(params: any): Promise<any>;
      };
      retrieve(params: any): Promise<any>;
      update(params: any): Promise<any>;
      delete(params: any): Promise<any>;
    };

    users: {
      list(): Promise<any>;
      retrieve(params: any): Promise<any>;
    };

    search(params: any): Promise<any>;
  }
}
