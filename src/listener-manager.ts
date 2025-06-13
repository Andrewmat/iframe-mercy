import { dispatchMessage } from './dispatch-message';
import { createIsEventSafe, type MessageMatcher } from './utils';

export function createListenerManager({
  outgoingOrigin,
  outgoingWindow,
  incomingOrigins,
  signal,
  root = window,
}: {
  outgoingOrigin: string;
  outgoingWindow: Window;
  incomingOrigins: string[];
  signal?: AbortSignal;
  root?: Window;
}) {
  let status: 'idle' | 'running' | 'stopped' = 'idle';

  const isEventSafe = createIsEventSafe(incomingOrigins);
  const entries: Map<
    MessageMatcher<unknown>,
    EntryListener<any, any>
  > = new Map();

  function centralListener(event: MessageEvent) {
    if (!isEventSafe(event)) return;
    entries.forEach(async (entry) => {
      const hasMatched = entry.matcher(event.data);
      if (hasMatched) {
        let result = entry.controller(event.data);
        if (result != null && 'then' in result) {
          result = await result;
        }
        dispatchMessage({
          message: result,
          targetOrigin: outgoingOrigin,
          targetWindow: outgoingWindow,
        });
      }
    });
  }

  function start() {
    if (signal?.aborted) return;

    root.addEventListener('message', centralListener, { signal });
    status = 'running';
  }

  signal?.addEventListener('abort', () => {
    status = 'stopped';
  });

  function on<TIncoming, TOutgoing>(
    matcher: MessageMatcher<TIncoming>,
    controller: (data: TIncoming) => TOutgoing | PromiseLike<TOutgoing>
  ) {
    entries.set(matcher, {
      matcher,
      controller,
    });
  }

  function off<TIncoming>(matcher: MessageMatcher<TIncoming>) {
    entries.delete(matcher);
  }

  const manager = {
    start,
    on,
    off,
    status,
    __listeners: entries,
  };
  return manager;
}

type EntryListener<TIncoming, TOutgoing> = {
  matcher: MessageMatcher<TIncoming>;
  controller: (data: TIncoming) => TOutgoing | PromiseLike<TOutgoing>;
};
