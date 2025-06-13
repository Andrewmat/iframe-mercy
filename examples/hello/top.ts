import { matchMessage, setupClient } from '../../src';
import type { HelloBackMessage, HelloMessage } from './types';

main();
async function main() {
  const iframe = document.getElementsByTagName('iframe')[0];

  const client = await setupClient({
    outgoingOrigin: window.location.origin,
    outgoingWindow: iframe.contentWindow!,
  });

  const myName = 'top';
  console.log(`top: "Hello, my name is ${myName}"`);

  const helloBack = await client.postMessage<HelloMessage, HelloBackMessage>({
    message: { action: 'hello', payload: { name: myName } },
    waitFor: matchMessage({ action: 'hello back' }),
  });

  console.log(`top: "Now I know it is ${helloBack.payload.timeOfDay}"`);
}
