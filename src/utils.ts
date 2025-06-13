export const createIsEventSafe =
  (safeOrigins: string[] | undefined) => (event: MessageEvent<unknown>) =>
    safeOrigins == null ? true : safeOrigins.includes(event.origin);

export type MessageMatcher<TData> = (
  messageData: unknown
) => messageData is TData;

export type MessageController<TIncoming, TOutgoing> = (
  data: TIncoming
) => TOutgoing | Promise<TOutgoing>;
