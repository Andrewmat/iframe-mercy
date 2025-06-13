import { matchMessage } from './match-message';
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
  signal?.addEventListener('abort', (reason) => {
    abortController.abort(reason);
  });

  const client = { postMessage };
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
        listenerManager.on(ackMatcher, () => {
          canPostMessage = true;
          resolve();
        });
        dispatchMessage({
          message: synMessage,
          targetOrigin: outgoingOrigin,
          targetWindow: outgoingWindow,
        });
      });
    }
  }
}

async function example() {
  const abortController = new AbortController();
  const client = setupClient({
    outgoingOrigin: '*',
    outgoingWindow: document.querySelector('iframe')!.contentWindow!,
    incomingOrigins: ['https://www.nomadglobal.com'],
    signal: abortController.signal,
    waitForServer: true,
  });

  const result = await client.postMessage({
    message: { type: 'HELLO', payload: 'world' },
    waitFor: matchMessage({ type: 'hello' }),
    signal: abortController.signal,
  });
  result.type === 'hello';

  // TO DO improve return type when waitFor is not defined
  const result2 = client.postMessage({
    message: { type: 'HELLO', payload: 'world' },
    signal: abortController.signal,
  });
}
