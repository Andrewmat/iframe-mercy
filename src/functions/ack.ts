import { ackMessage, initMessage } from '../messages';
import { respondMessage } from './respondMessage';

export function ack({
  origin,
  client: from,
  thisWindow = window,
}: {
  origin: string;
  client: Window;
  thisWindow?: Window;
}) {
  respondMessage<typeof initMessage, typeof ackMessage>({
    origin,
    client: from,
    thisWindow,
    waitFor: initMessage.type,
    responseFn: () => ackMessage,
  });
}
