import debounce from 'lodash.debounce';
import {
  isResponseHeightMessage,
  type FetchHeightMessage,
  type ResponseHeightMessage,
} from './common';
import { mercy } from '../../src';

const iframe = document.getElementById(
  'iframe'
) as HTMLIFrameElement;

const { fetchMessage } = mercy<
  ResponseHeightMessage,
  FetchHeightMessage
>({ isValidMessage: isResponseHeightMessage });

const service = debounce(async function main() {
  const newIframeHeight = await fetchMessage({
    toWindow: iframe.contentWindow!,
    message: { type: 'fetch:height' },
    waitFor: 'response:height',
  });
  iframe.style.height = newIframeHeight;
}, 300);

window.addEventListener('load', () => {
  service();
});

window.addEventListener('resize', () => {
  service();
});
