declare module 'express-session' {
  import { RequestHandler } from 'express';

  interface SessionOptions {
    secret: string | string[];
    name?: string;
    cookie?: {
      maxAge?: number;
      secure?: boolean;
      httpOnly?: boolean;
      domain?: string;
      path?: string;
      sameSite?: boolean | 'lax' | 'strict' | 'none';
    };
    resave?: boolean;
    saveUninitialized?: boolean;
    store?: any;
    genid?: (req: any) => string;
    rolling?: boolean;
    unset?: 'destroy' | 'keep';
    proxy?: boolean;
  }

  interface SessionData {
    [key: string]: any;
  }

  interface Session extends SessionData {
    id: string;
    cookie: any;
    regenerate(callback: (err?: any) => void): void;
    destroy(callback: (err?: any) => void): void;
    reload(callback: (err?: any) => void): void;
    save(callback?: (err?: any) => void): void;
    touch(): void;
  }

  function session(options?: SessionOptions): RequestHandler;

  export = session;
}

declare global {
  namespace Express {
    interface Request {
      session?: import('express-session').Session;
      sessionID?: string;
    }
  }
}
