import {
  Height,
  type ResponseHeightMessage,
  type FetchHeightMessage,
} from './common';
import { matchMessage, setupServer } from '../../src';

const server = setupServer({
  incomingOrigins: ['http://localhost:5173'],
}).addListener<FetchHeightMessage, ResponseHeightMessage>(
  matchMessage({ action: 'fetch:height' }),
  () => ({
    action: 'response:height',
    payload: Height.parse(`${document.body.clientHeight}px`),
  })
);

server.listen();
