import { mercyServer, handleMessage } from './createMessageServer';
import { createMessage } from './message';

const server = mercyServer({
  handlers: [
    handleMessage('init', () => {
      console.log('initted');
    }),

    handleMessage('save:event', (body: { action: string }) => {
      console.log('loggin action', body.action);
    }),

    handleMessage('save:consent', (body: { consent: string }) => {
      console.log('consent', body.consent);
      return createMessage('save:consent:response', { success: true });
    }),
    handleMessage('get:consent', async () => {
      await new Promise((r) => setTimeout(r, 2000));
      return createMessage('get:consent:response');
    }),
  ],
});

const iframes = document.querySelectorAll('iframe');

server.listen(iframes);

iframes.forEach((iframe) => {
  iframe.addEventListener('error', () => {
    server.unlisten(iframe);
  });
});

window.addEventListener('unload', () => {
  server.disconnect();
});
