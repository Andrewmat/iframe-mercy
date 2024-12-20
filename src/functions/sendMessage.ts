import type { GenericMessage } from '../types';

export function sendMessage<TMessageOut extends GenericMessage>({
  client: from,
  message,
  origin,
}: {
  client: Window;
  message: TMessageOut;
  origin: string;
}) {
  from.postMessage(message, origin);
}
