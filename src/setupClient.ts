import { ensureInit } from './functions/ensureInit';
import { fetchMessage as fetchMessageFn } from './functions/fetchMessage';
import type { GenericMessage } from './types';

export function setupClient({
  origin,
  client,
  thisWindow = window,
}: {
  origin: string;
  client: Window;
  thisWindow?: Window;
}) {
  async function fetchMessage<
    TGenericMessageIn extends GenericMessage,
    TGenericMessageOut extends GenericMessage
  >({
    waitFor,
    message,
  }: {
    waitFor: TGenericMessageIn['type'];
    message: TGenericMessageOut;
  }) {
    await ensureInit({
      origin,
      client,
      thisWindow,
    });
    return fetchMessageFn<TGenericMessageIn, TGenericMessageOut>({
      message,
      waitFor,
      thisWindow,
      origin,
      client,
    });
  }

  return fetchMessage;
}
