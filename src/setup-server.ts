import { createListenerManager } from './internals/listener-manager';
import type { MessageMatcher } from './match-message';
import { ackMessage, synMatcher } from './syn-ack';

export type MercyServer = {
  addListener: <TIncoming, TOutgoing>(
    matcher: MessageMatcher<TIncoming>,
    controller: MessageController<TIncoming, TOutgoing>
  ) => MercyServer;
  listen: () => void;
};

export type SetupServerOptions = {
  outgoingOrigin: string;
  outgoingRoot: Window;
  incomingOrigins?: string[];
  signal?: AbortSignal;
};

export type MessageController<TIncoming, TOutgoing> = (
  data: TIncoming
) => TOutgoing | Promise<TOutgoing>;

export function setupServer({
  outgoingOrigin,
  outgoingRoot,
  incomingOrigins = [outgoingOrigin],
  signal,
}: SetupServerOptions): MercyServer {
  const root = window;
  const listenerManager = createListenerManager({
    outgoingOrigin,
    outgoingRoot,
    incomingOrigins,
    root,
    signal,
  });

  listenerManager.on(synMatcher, () => ackMessage);

  function addListener<TIncoming, TOutgoing>(
    matcher: MessageMatcher<TIncoming>,
    controller: MessageController<TIncoming, TOutgoing>
  ): MercyServer {
    listenerManager.on(matcher, (...args) => {
      listenerManager.off(matcher);
      return controller(...args);
    });
    return server;
  }

  function listen() {
    listenerManager.start();
    return server;
  }

  const server: MercyServer = {
    addListener,
    listen,
  };
  return server;
}
