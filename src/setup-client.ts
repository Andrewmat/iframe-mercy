import { dispatchMessage } from './dispatch-message';
import { createListenerManager } from './listener-manager';
import { ackMatcher, synMessage } from './syn-ack';
import { type MessageMatcher } from './utils';

export function setupClient({
  outgoingOrigin,
  outgoingWindow,
  incomingOrigins = [outgoingOrigin],
  waitForServer = true,
  signal,
  thisWindow = window,
}: {
  outgoingOrigin: string;
  outgoingWindow: Window;
  incomingOrigins?: string[];
  waitForServer?: boolean;
  signal?: AbortSignal;
  thisWindow?: Window;
}) {
  let canPostMessage = waitForServer ? false : true;
  const abortController = new AbortController();
  const listenerManager = createListenerManager({
    outgoingOrigin: outgoingOrigin,
    outgoingWindow: outgoingWindow,
    incomingOrigins,
    signal: abortController.signal,
    root: thisWindow,
  });
  listenerManager.start();
  signal?.addEventListener('abort', (reason) => {
    abortController.abort(reason);
  });

  const client = {
    postMessage,
  };
  return client;

  // TO DO improve return type to Promise<void> if waitFor is undefined
  async function postMessage<TOutgoing, TIncoming>({
    message,
    waitFor,
    signal,
  }: {
    message: TOutgoing;
    waitFor?: MessageMatcher<TIncoming>;
    signal?: AbortSignal;
  }): Promise<TIncoming> {
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
        targetWindow: outgoingWindow,
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
            targetWindow: outgoingWindow,
          });
          thisWindow.clearInterval(intervalId);
        };
        thisWindow.requestIdleCallback(dispatchSyn);
        intervalId = thisWindow.setInterval(dispatchSyn, 100);
      });
    }
  }
}
