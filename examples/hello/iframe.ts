import { matchMessage, setupServer } from '../../src';
import type { HelloBackMessage, HelloMessage } from './types';

setupServer({
  outgoingOrigin: window.location.origin,
  outgoingWindow: window.parent,
})
  .addListener<HelloMessage, HelloBackMessage>(
    matchMessage({ action: 'hello' }),
    async (helloMessage) => {
      await new Promise((r) => window.setTimeout(r, 1000));
      const hours = new Date().getHours();
      const timeOfDay = hours > 6 && hours < 18 ? 'morning' : 'night';
      console.log(
        `iframe: "Hello ${helloMessage.payload.name}, it is ${timeOfDay}"`
      );
      return {
        action: 'hello back',
        payload: { timeOfDay },
      };
    }
  )
  .listen();
