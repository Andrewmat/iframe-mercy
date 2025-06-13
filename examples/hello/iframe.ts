import { setupServer } from '../../src';
import { matchType, type HelloBackMessage, type HelloMessage } from './common';

setupServer({
  outgoingOrigin: window.location.origin,
  outgoingWindow: window.parent,
})
  .addListener<HelloMessage, HelloBackMessage>(
    matchType('hello'),
    async (helloMessage) => {
      await new Promise((r) => window.setTimeout(r, 1000));
      const hours = new Date().getHours();
      const timeOfDay = hours > 6 && hours < 18 ? 'morning' : 'night';
      console.log(
        `iframe: "Hello ${helloMessage.payload.name}, it is ${timeOfDay}"`
      );
      return {
        type: 'hello back',
        payload: { timeOfDay },
      };
    }
  )
  .listen();
