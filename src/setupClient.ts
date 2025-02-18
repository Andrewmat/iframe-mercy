import { ensureInit } from './functions/ensureInit';
import { fetchMessage as fetchMessageFn } from './functions/fetchMessage';
import { sendMessage as sendMessageFn } from './functions/sendMessage';
import type { GenericMessage } from './types';

export function setupClient({
  origin,
  server,
  thisWindow = window,
}: {
  origin: string;
  server: Window;
  thisWindow?: Window;
}) {
  let initialized = false;
  async function fetchMessage<
    TMessageOut extends GenericMessage,
    TMessageIn extends GenericMessage
  >({
    waitFor,
    message,
  }: {
    waitFor: TMessageIn['type'];
    message: TMessageOut;
  }): Promise<TMessageIn>;
  async function fetchMessage<
    TMessageOut extends GenericMessage,
    TMessageIn extends GenericMessage
  >({ message }: { message: TMessageOut }): Promise<void>;

  async function fetchMessage<
    TMessageOut extends GenericMessage,
    TMessageIn extends GenericMessage
  >({
    waitFor,
    message,
  }: {
    waitFor?: TMessageIn['type'];
    message: TMessageOut;
  }) {
    if (!initialized) {
      await ensureInit({
        origin,
        server: server,
        thisWindow,
      });
      initialized = true;
    }
    if (waitFor) {
      return fetchMessageFn<TMessageIn, TMessageOut>({
        message,
        waitFor,
        thisWindow,
        origin,
        client: server,
      });
    } else {
      return sendMessageFn<TMessageOut>({
        message,
        origin,
        client: server,
      });
    }
  }

  return fetchMessage;
}
