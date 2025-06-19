import { dispatchMessage } from './internals/dispatch-message';
import { createListenerManager } from './internals/listener-manager';
import type { MessageMatcher } from './match-message';
import { ackMatcher, synMessage } from './syn-ack';

export type MercyClient = {
  postMessage: <TOutgoing, TIncoming>(
    options: PostMessageOptions<TOutgoing, TIncoming>
  ) => Promise<TIncoming>;
};

export type SetupClientOptions = {
  outgoingOrigin: string;
  outgoingRoot: Window;
  waitForServer?: boolean;
  signal?: AbortSignal;
};

export type PostMessageOptions<TOutgoing, TIncoming> = {
  message: TOutgoing;
  waitFor?: MessageMatcher<TIncoming>;
  signal?: AbortSignal;
};

export function setupClient({
  outgoingOrigin,
  outgoingRoot,
  waitForServer = true,
  signal,
}: SetupClientOptions): MercyClient {
  const root = window;
  let canPostMessage = waitForServer ? false : true;
  const abortController = new AbortController();
  const listenerManager = createListenerManager({
    outgoingOrigin,
    outgoingRoot,
    incomingOrigins: [outgoingOrigin],
    signal: abortController.signal,
    root,
  });
  listenerManager.start();
  signal?.addEventListener('abort', (reason) => {
    abortController.abort(reason);
  });

  const client: MercyClient = {
    postMessage,
  };
  return client;

  // TO DO improve return type to Promise<void> if waitFor is undefined
  async function postMessage<TOutgoing, TIncoming>({
    message,
    waitFor,
    signal,
  }: PostMessageOptions<TOutgoing, TIncoming>): Promise<TIncoming> {
    return new Promise(async (resolve, reject) => {
      await handleServer();

      signal?.addEventListener('abort', (event) => {
        if (waitFor) listenerManager.off(waitFor);
        reject(event);
      });

      if (waitFor) {
        listenerManager.on(waitFor, (incomingMessage) => {
          resolve(incomingMessage);
        });
      }

      dispatchMessage({
        message,
        targetOrigin: outgoingOrigin,
        targetWindow: outgoingRoot,
      });
      if (waitFor == null) {
        // TO DO improve typing
        resolve(undefined as TIncoming);
        return;
      }
    });

    function handleServer() {
      if (canPostMessage) return;

      return new Promise<void>((resolve) => {
        let intervalId: number;
        listenerManager.on(ackMatcher, () => {
          canPostMessage = true;
          resolve();
        });

        const dispatchSyn = () => {
          dispatchMessage({
            message: synMessage,
            targetOrigin: outgoingOrigin,
            targetWindow: outgoingRoot,
          });
          root.clearInterval(intervalId);
        };
        root.requestIdleCallback(dispatchSyn);
        intervalId = root.setInterval(dispatchSyn, 100);
      });
    }
  }
}
