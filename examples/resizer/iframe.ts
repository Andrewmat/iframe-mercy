import {
  Height,
  type ResponseHeightMessage,
  type FetchHeightMessage,
} from './common';
import { messageHandler, setupServer } from '../../src';

const server = setupServer({
  origin: 'http://localhost:5173',
  client: window.parent,
  handlers: [
    messageHandler<FetchHeightMessage, ResponseHeightMessage>(
      'fetch:height',
      () => ({
        type: 'response:height',
        payload: Height.parse(`${document.body.clientHeight}px`),
      })
    ),
  ],
});

server.listen();
