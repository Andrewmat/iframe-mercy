import { mercyClient } from './createMessageClient';
import { createStandaloneMessageClient } from './createStandaloneMessageClient';

// - createMessageClient ----------------------------------------------------

const messageClient = mercyClient({
  allowedOrigins: ['www.example.com'],
});

// simple event
messageClient.sendMessage('init');

type SaveConsentResponse = { success: boolean };

// async fetch with body
const response = await messageClient.sendMessage<SaveConsentResponse>(
  'save:consent',
  {
    body: { consent: 'granted' },
    waitFor: 'save:consent:response',
  }
);

// event with body
messageClient.sendMessage('save:event', {
  body: { action: 'click' },
});

// async fetch
const response2 = await messageClient.sendMessage('get:consent', {
  waitFor: 'get:consent:response',
});

// - createStandaloneMessageClient ---------------------------------------

const standaloneMessageClient = createStandaloneMessageClient({
  allowedOrigins: ['www.example.com'],
  idProperty: 'id',
});

// simple event
standaloneMessageClient.sendMessage({ id: 'init' });

// event with body
standaloneMessageClient.sendMessage({
  id: 'save:event',
  payload: { action: 'click' },
});

// async fetch with string matcher
const response3 = await standaloneMessageClient.sendMessage<{
  id: 'get:consent:response';
  value: string;
}>({ id: 'get:consent' }, { waitFor: 'get:consent:response' });

// async fetch with function matcher
const response4 = await standaloneMessageClient.sendMessage<{
  rID: 'get:consent';
  value: string;
}>(
  { id: 'get:consent' },
  {
    waitFor: (msg: { rID: 'get:consent' }) => msg.rID === 'get:consent',
  }
);

// --------------------------------------------------------------------------
