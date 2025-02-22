import type { GenericMessage } from '../types';
import { sendMessage } from './sendMessage';
import { waitForMessage } from './waitForMessage';

export function fetchMessage<
  TMessageIn extends GenericMessage,
  TMessageOut extends GenericMessage,
>({
  message,
  waitFor,
  thisWindow,
  origin: origin,
  client,
}: {
  message: TMessageOut;
  waitFor: TMessageIn['action'];
  origin: string;
  client: Window;
  thisWindow?: Window;
}) {
  const promise = waitForMessage({
    thisWindow,
    messageType: waitFor,
  });
  sendMessage({
    message,
    origin,
    client,
  });
  return promise;
}
