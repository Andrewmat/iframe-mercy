import { createListenerManager } from './listener-manager';
import { ackMessage, synMatcher } from './syn-ack';
import { type MessageController, type MessageMatcher } from './utils';

export function setupServer({
  outgoingOrigin,
  outgoingWindow,
  incomingOrigins = [outgoingOrigin],
  signal: serverSignal,
  thisWindow = window,
}: {
  outgoingOrigin: string;
  outgoingWindow: Window;
  incomingOrigins?: string[];
  signal?: AbortSignal;
  thisWindow?: Window;
}) {
  const abortController = new AbortController();
  const listenerManager = createListenerManager({
    outgoingOrigin: outgoingOrigin,
    outgoingWindow: outgoingWindow,
    incomingOrigins,
    root: thisWindow,
    signal: abortController.signal,
  });

  listenerManager.on(synMatcher, () => {
    return ackMessage;
  });

  serverSignal?.addEventListener('abort', () => {
    abortController.abort();
  });

  function addListener<TIncoming, TOutgoing>(
    matcher: MessageMatcher<TIncoming>,
    controller: MessageController<TIncoming, TOutgoing>,
    options?: Partial<{ signal: AbortSignal }>
  ) {
    if (!options?.signal) {
      listenerManager.on(matcher, controller);
      return server;
    }

    if (options.signal.aborted) {
      return server;
    }
    listenerManager.on(matcher, controller);
    options.signal.addEventListener('abort', () => {
      listenerManager.off(matcher);
    });

    return server;
  }

  function listen() {
    listenerManager.start();
    return server;
  }

  const server = {
    addListener,
    listen,
  };
  return server;
}
