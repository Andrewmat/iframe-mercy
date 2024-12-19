import {
  Height,
  type ResponseHeightMessage,
  type FetchHeightMessage,
  isFetchHeightMessage,
} from './common';
import { mercy } from '../../src';

const { respondMessage } = mercy<
  FetchHeightMessage,
  ResponseHeightMessage
>({
  isValidMessage: isFetchHeightMessage,
});

main();
async function main() {
  respondMessage({
    fromOrigin: 'http://localhost:5173',
    toWindow: window.parent,
    waitFor: 'fetch:height',
    responseFn: () => ({
      type: 'response:height',
      payload: Height.parse(
        `${document.body.clientHeight}px`
      ),
    }),
  });
}
