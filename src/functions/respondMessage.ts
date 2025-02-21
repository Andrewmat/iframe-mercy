import type { GenericMessage } from '../types';
import { addMessageListener } from './addMessageListener';
import { sendMessage } from './sendMessage';

/**
 * Receives a message and sends another message as response
 */
export function respondMessage<
  TMessageIn extends GenericMessage,
  TMessageOut extends GenericMessage
>({
  waitFor,
  responseFn,
  thisWindow,
  origin,
  client,
}: {
  waitFor: TMessageIn['action'];
  responseFn: (message: TMessageIn) => TMessageOut;
  origin: string;
  client: Window;
  thisWindow?: Window;
}) {
  addMessageListener({
    thisWindow,
    messageType: waitFor,
    onMessage: (message) => {
      sendMessage({
        message: responseFn(message),
        origin: origin,
        client: client,
      });
    },
  });
}
