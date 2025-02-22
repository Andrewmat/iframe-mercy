import type { MercyMessage } from './message';

interface MessageServerOptions {
  handlers: MessageServerHandler<any, any>[];
}

type MessageServerHandler<
  MsgOut extends MercyMessage<string, unknown>,
  MsgInBody,
> = {
  msgId: string;
  callback: (body: MsgInBody) => void | MsgOut | Promise<MsgOut>;
};

interface MessageServer {
  listen: (iframe: HTMLIFrameElement | Iterable<HTMLIFrameElement>) => void;
  unlisten: (iframe: HTMLIFrameElement | Iterable<HTMLIFrameElement>) => void;
  disconnect: () => void;
}

export declare function mercyServer(
  options: MessageServerOptions
): MessageServer;

export declare function handleMessage<
  MsgInBody,
  MsgOutBody extends MercyMessage<string, unknown>,
>(
  msgId: string,
  callback: MessageServerHandler<MsgOutBody, MsgInBody>['callback']
): MessageServerHandler<MsgOutBody, MsgInBody>;
