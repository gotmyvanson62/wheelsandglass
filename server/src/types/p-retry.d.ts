declare module 'p-retry' {
  interface Options {
    retries?: number;
    factor?: number;
    minTimeout?: number;
    maxTimeout?: number;
    randomize?: boolean;
    onFailedAttempt?: (error: any) => void | Promise<void>;
  }

  function pRetry<T>(
    fn: () => Promise<T>,
    options?: Options
  ): Promise<T>;

  export = pRetry;
}
