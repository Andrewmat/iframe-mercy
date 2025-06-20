import { createListenerManager } from './internals/listener-manager';
import type { MessageMatcher } from './match-message';
import { ackMessage, synMatcher } from './syn-ack';

export type MercyServer = {
  addListener: <TIncoming, TOutgoing>(
    matcher: MessageMatcher<TIncoming>,
    controller: MessageListener<TIncoming, TOutgoing>
  ) => MercyServer;
  listen: () => void;
};

export type SetupServerOptions = {
  incomingOrigins: string[];
  signal?: AbortSignal;
};

export type MessageListener<TIncoming, TOutgoing> = (
  data: TIncoming
) => TOutgoing | Promise<TOutgoing>;

export function setupServer({
  incomingOrigins,
  signal,
}: SetupServerOptions): MercyServer {
  const root = window;
  const listenerManager = createListenerManager({
    incomingOrigins,
    root,
    signal,
  });

  listenerManager.on(synMatcher, () => ackMessage);

  function addListener<TIncoming, TOutgoing>(
    matcher: MessageMatcher<TIncoming>,
    listener: MessageListener<TIncoming, TOutgoing>
  ): MercyServer {
    listenerManager.on(matcher, listener);
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
