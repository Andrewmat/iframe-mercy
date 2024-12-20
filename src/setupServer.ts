import { addMessageListener } from './functions/addMessageListener';
import { ack } from './functions/ack';
import { sendMessage } from './functions/sendMessage';
import type { GenericMessage } from './types';

export function setupServer({
  origin,
  client,
  thisWindow,
  handlers,
}: {
  origin: string;
  client: Window;
  thisWindow?: Window;
  handlers: MessageHandler<any, any>[];
}) {
  const unsubscribes: (() => void)[] = [];
  for (const handle of handlers) {
    unsubscribes.push(
      addMessageListener({
        thisWindow,
        messageType: handle.messageType,
        onMessage: (message) => {
          const outgoingMessage = handle.fn(message);
          if (outgoingMessage) {
            sendMessage({
              message: outgoingMessage,
              origin,
              client,
            });
          }
        },
      })
    );
  }

  function listen() {
    ack({
      origin,
      client,
      thisWindow,
    });
  }
  function unlisten() {
    unsubscribes.forEach((u) => u());
  }

  return {
    listen,
    unlisten,
  };
}

export function messageHandler<
  TMessageIn extends GenericMessage,
  TMessageOut extends GenericMessage | void
>(
  messageType: TMessageIn['type'],
  fn: (message: TMessageIn) => TMessageOut
): MessageHandler<TMessageIn, TMessageOut> {
  return {
    messageType,
    fn,
  };
}
export type MessageHandler<
  TMessageIn extends GenericMessage,
  TMessageOut extends GenericMessage | void
> = {
  messageType: TMessageIn['type'];
  fn: (message: TMessageIn) => TMessageOut;
};
