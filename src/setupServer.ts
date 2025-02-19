import { addMessageListener } from './functions/addMessageListener';
import { ack } from './functions/ack';
import { sendMessage } from './functions/sendMessage';
import type { GenericMessage } from './types';

export function setupServer<
  TMessageIn extends GenericMessage,
  TMessageOut extends GenericMessage
>({
  origin,
  client,
  thisWindow,
  handlers,
}: {
  origin: string;
  client: Window;
  thisWindow?: Window;
  handlers: MessageHandler<TMessageIn, TMessageOut>[];
}) {
  const unsubscribes: (() => void)[] = [];
  for (const handle of handlers) {
    unsubscribes.push(
      addMessageListener({
        thisWindow,
        messageType: handle.messageType,
        onMessage: (message) => {
          const handlerResult = handle.fn(message);
          if (!handlerResult) return;

          if (isPromiseLike(handlerResult)) {
            handlerResult.then((outgoingMessage) => {
              sendMessage({
                message: outgoingMessage,
                origin,
                client,
              });
            });
            return;
          }

          sendMessage({
            message: handlerResult,
            origin,
            client,
          });
          return;
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
  fn: (message: TMessageIn) => TMessageOut | PromiseLike<TMessageOut>
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
  fn: (message: TMessageIn) => TMessageOut | PromiseLike<TMessageOut>;
};

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  value != null &&
  typeof value === 'object' &&
  'then' in value &&
  typeof value.then === 'function';
