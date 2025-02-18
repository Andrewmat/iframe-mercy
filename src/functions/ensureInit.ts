import { ackMessage, initMessage } from '../messages';
import { addMessageListener } from './addMessageListener';
import { sendMessage } from './sendMessage';

export async function ensureInit({
  origin,
  server,
  thisWindow = window,
}: {
  origin: string;
  server: Window;
  thisWindow?: Window;
}) {
  return new Promise((resolve) => {
    let initialized = false;
    addMessageListener<typeof ackMessage>({
      messageType: ackMessage.type,
      onMessage: () => {
        initialized = true;
        resolve(true);
        if (intervalId) thisWindow.clearInterval(intervalId);
      },
    });
    const sendInitMessage = () =>
      sendMessage({
        message: initMessage,
        origin,
        client: server,
      });
    let intervalId: number;
    if (!initialized) {
      intervalId = thisWindow.setInterval(sendInitMessage, 300);
    }
  });
}
