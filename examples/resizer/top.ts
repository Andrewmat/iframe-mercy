import debounce from 'lodash.debounce';
import { type FetchHeightMessage, type ResponseHeightMessage } from './common';
import { setupClient } from '../../src';

const iframe = document.getElementById('iframe') as HTMLIFrameElement;

const fetchIframe = setupClient({
  origin: window.location.origin,
  server: iframe.contentWindow!,
});

const updateIframeHeight = debounce(async function main() {
  const response = await fetchIframe<FetchHeightMessage, ResponseHeightMessage>(
    {
      message: { action: 'fetch:height' },
      waitFor: 'response:height',
    }
  );
  iframe.style.height = response.payload;
}, 300);

updateIframeHeight();

window.addEventListener('resize', () => {
  updateIframeHeight();
});
