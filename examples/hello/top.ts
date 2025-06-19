import { setupClient } from '../../src';
import { matchType, type HelloBackMessage, type HelloMessage } from './common';

main();
async function main() {
  const iframe = document.getElementsByTagName('iframe')[0];

  const client = setupClient({
    outgoingOrigin: window.location.origin,
    outgoingRoot: iframe.contentWindow!,
  });

  const myName = 'top';
  console.log(`top: "Hello, my name is ${myName}"`);

  const helloBack = await client.postMessage<HelloMessage, HelloBackMessage>({
    message: { type: 'hello', payload: { name: myName } },
    waitFor: matchType('hello back'),
  });

  console.log(`top: "Now I know it is ${helloBack.payload.timeOfDay}"`);
}
