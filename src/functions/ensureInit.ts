import { ackMessage, initMessage } from '../messages';
import { addMessageListener } from './addMessageListener';
import { sendMessage } from './sendMessage';

export async function ensureInit({
  origin,
  client,
  thisWindow = window,
}: {
  origin: string;
  client: Window;
  thisWindow?: Window;
}) {
  return new Promise((resolve) => {
    addMessageListener<typeof ackMessage>({
      messageType: ackMessage.type,
      onMessage: () => {
        resolve(true);
        thisWindow.clearInterval(intervalId);
      },
    });
    const intervalId = thisWindow.setInterval(() => {
      sendMessage({
        message: initMessage,
        origin,
        client,
      });
    }, 300);
  });
}
