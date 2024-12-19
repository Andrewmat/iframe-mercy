import { mercy } from '../../src';
import type {
  HelloBackMessage,
  HelloMessage,
} from './types';

const { respondMessage } = mercy<
  HelloMessage,
  HelloBackMessage
>();

respondMessage({
  fromOrigin: 'http://localhost:5173',
  toWindow: window.parent,
  waitFor: 'hello',
  responseFn: ({ name }) => {
    const hours = new Date().getHours();
    const timeOfDay =
      hours > 6 && hours < 18 ? 'morning' : 'night';
    console.log(
      `iframe: "Hello ${name}, it is ${timeOfDay}"`
    );
    return {
      type: 'hello back',
      payload: { timeOfDay },
    };
  },
});
