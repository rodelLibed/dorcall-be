declare module 'asterisk-ami-client' {
  interface AmiOptions {
    host?: string;
    port?: number;
  }

  class AmiClient {
    constructor();
    connect(
      username: string,
      secret: string,
      options?: AmiOptions
    ): Promise<void>;
    action(params: any): Promise<any>;
    on(event: string, callback: (message: any) => void): void;
    disconnect(): void;
  }

  export default AmiClient;
}
