import type { GenericMessage } from '../types';

/**
 * Subscribes to all ocurrences of a specific message type
 * @returns the unsubscribe function
 * */
export function addMessageListener<TMessageIn extends GenericMessage>({
  messageType,
  onMessage,
  thisWindow = window,
}: {
  messageType: TMessageIn['type'];
  onMessage: (message: TMessageIn) => void;
  thisWindow?: Window;
}) {
  const listener = (e: MessageEvent) => {
    if (e.data.type !== messageType) return;
    onMessage(e.data);
  };

  thisWindow.addEventListener('message', listener);
  return function unsubscribe() {
    thisWindow.removeEventListener('message', listener);
  };
}
