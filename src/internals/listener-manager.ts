import { replyMessage } from './dispatch-message';
import type { MessageMatcher } from '../match-message';

type CreateListenerMananagerOptions = {
  incomingOrigins: string[];
  signal?: AbortSignal;
  root: Window;
};

type ListenerManager = {
  start: () => void;
  on: <TIncoming, TOutgoing>(
    matcher: MessageMatcher<TIncoming>,
    controller: (data: TIncoming) => TOutgoing | PromiseLike<TOutgoing>
  ) => void;
  off: <TIncoming>(matcher: MessageMatcher<TIncoming>) => void;
  status: ListenerManagerStatus;
};

type ListenerManagerStatus = 'idle' | 'running' | 'stopped';

export function createListenerManager({
  incomingOrigins,
  signal,
  root,
}: CreateListenerMananagerOptions): ListenerManager {
  let status: ListenerManagerStatus = 'idle';

  const isEventSafe = createIsEventSafe(incomingOrigins);
  const entries: Map<
    MessageMatcher<unknown>,
    EntryListener<any, any>
  > = new Map();

  function centralListener(event: MessageEvent) {
    if (!isEventSafe(event)) return;
    entries.forEach(async (entry) => {
      const hasMatched = entry.matcher(event.data);
      if (!hasMatched) return;

      let result = entry.controller(event.data);
      if (result != null && 'then' in result) {
        result = await result;
      }

      replyMessage({
        message: result,
        event,
      });
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

  const manager: ListenerManager = {
    start,
    on,
    off,
    status,
  };
  return manager;
}

export const createIsEventSafe =
  (safeOrigins: string[] | undefined) => (event: MessageEvent<unknown>) =>
    safeOrigins == null ? true : safeOrigins.includes(event.origin);

type EntryListener<TIncoming, TOutgoing> = {
  matcher: MessageMatcher<TIncoming>;
  controller: (data: TIncoming) => TOutgoing | PromiseLike<TOutgoing>;
};
