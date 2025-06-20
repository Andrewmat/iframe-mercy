import { type FetchHeightMessage, type ResponseHeightMessage } from './common';
import { matchMessage, setupClient } from '../../src';

const iframe = document.getElementById('iframe') as HTMLIFrameElement;

const client = setupClient({
  outgoingOrigin: window.location.origin,
  outgoingRoot: iframe.contentWindow!,
});

const updateIframeHeight = async function main() {
  const response = await client.postMessage<
    FetchHeightMessage,
    ResponseHeightMessage
  >({
    message: { action: 'fetch:height' },
    waitFor: matchMessage({ action: 'response:height' }),
  });
  iframe.style.height = response.payload;
};

updateIframeHeight();

window.addEventListener('resize', () => {
  window.requestAnimationFrame(updateIframeHeight);
});
