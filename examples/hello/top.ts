import { mercy } from '../../src';
import type {
  HelloBackMessage,
  HelloMessage,
} from './types';

window.addEventListener('load', async () => {
  const iframe = document.getElementsByTagName('iframe')[0];

  const { fetchMessage } = mercy<
    HelloBackMessage,
    HelloMessage
  >();

  const myName = 'top';
  console.log(`top: "Hello, my name is ${myName}"`);

  const helloBack = await fetchMessage({
    toWindow: iframe.contentWindow!,
    message: { type: 'hello', payload: { name: myName } },
    waitFor: 'hello back',
  });

  console.log(
    `top: "Now I know it is ${helloBack.timeOfDay}"`
  );
});
