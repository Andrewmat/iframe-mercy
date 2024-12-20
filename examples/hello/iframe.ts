import { messageHandler, setupServer } from '../../src';
import type { HelloBackMessage, HelloMessage } from './types';

const server = setupServer({
  origin: window.location.origin,
  client: window.parent,
  handlers: [
    messageHandler<HelloMessage, HelloBackMessage>('hello', (helloMessage) => {
      const hours = new Date().getHours();
      const timeOfDay = hours > 6 && hours < 18 ? 'morning' : 'night';
      console.log(
        `iframe: "Hello ${helloMessage.payload.name}, it is ${timeOfDay}"`
      );
      return {
        type: 'hello back',
        payload: { timeOfDay },
      };
    }),
  ],
});

server.listen();
