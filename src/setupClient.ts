import { ensureInit } from './functions/ensureInit';
import { fetchMessage as fetchMessageFn } from './functions/fetchMessage';
import { sendMessage as sendMessageFn } from './functions/sendMessage';
import type { GenericMessage } from './types';

export interface SetupClientOptions {
  origin: string;
  server: Window;
  skipServerCheck?: boolean;
  thisWindow?: Window;
}

export interface FetchMessageOptions<
  TMessageOut extends GenericMessage,
  TMessageIn extends GenericMessage
> {
  waitFor?: TMessageIn['action'];
  message: TMessageOut;
}

export function setupClient({
  origin,
  server,
  skipServerCheck,
  thisWindow = window,
}: SetupClientOptions) {
  let initialized = false;

  async function fetchMessage<
    TMessageOut extends GenericMessage,
    TMessageIn extends GenericMessage
  >({
    waitFor,
    message,
  }: {
    waitFor: TMessageIn['action'];
    message: TMessageOut;
  }): Promise<TMessageIn>;
  async function fetchMessage<
    TMessageOut extends GenericMessage,
    TMessageIn extends GenericMessage
  >({ message }: { message: TMessageOut }): Promise<void>;

  async function fetchMessage<
    TMessageOut extends GenericMessage,
    TMessageIn extends GenericMessage
  >({ waitFor, message }: FetchMessageOptions<TMessageOut, TMessageIn>) {
    if (!initialized && !skipServerCheck) {
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
