import { setupClient } from '../../src';
import type { HelloBackMessage, HelloMessage } from './types';

main();
async function main() {
  const iframe = document.getElementsByTagName('iframe')[0];

  const fetchMessage = await setupClient({
    origin: window.location.origin,
    server: iframe.contentWindow!,
  });

  const myName = 'top';
  console.log(`top: "Hello, my name is ${myName}"`);

  const helloBack = await fetchMessage<HelloMessage, HelloBackMessage>({
    message: { action: 'hello', payload: { name: myName } },
    waitFor: 'hello back',
  });

  console.log(`top: "Now I know it is ${helloBack.payload.timeOfDay}"`);
}
