import type { GenericMessage } from '../types';
import { addMessageListener } from './addMessageListener';

/**
 * Listens to one ocurrence of a specific message type
 * @returns a promise of the awaited message
 * */
export async function waitForMessage<TMessageIn extends GenericMessage>({
  messageType,
  thisWindow,
}: {
  messageType: TMessageIn['type'];
  thisWindow?: Window;
}) {
  return new Promise<TMessageIn>((resolve) => {
    const unsubscribe = addMessageListener({
      thisWindow,
      messageType,
      onMessage: (data) => {
        resolve(data);
        unsubscribe();
      },
    });
  });
}
