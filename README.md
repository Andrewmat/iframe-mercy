# iframe-mercy

Fully typed library for iframe communications

## Getting started

```txt
pnpm add iframe-mercy
yarn add iframe-mercy
npm install iframe-mercy
```

Set types for messages to be used by both parents and iframes:

```ts
import type { GenericMessage } from 'iframe-mercy';

export interface MessageFromParent extends GenericMessage {
  type: 'fetchValue';
  payload: undefined;
}
export interface MessageFromIframe extends GenericMessage {
  type: 'returnValue';
  payload: { random: number };
}
```

In the parent, use `fetchMessage` to send a message to the iframe and await its result:

```ts
import { mercy } from 'iframe-mercy';
import {
  MessageFromIframe,
  MessageFromParent,
} from '~/types';

const iframe = document.getElementsByTagName('iframe')[0];

// in this context, in = iframe / out = parent
type IncomingMessage = MessageFromIframe;
type OutgoingMessage = MessageFromParent;

// bind the message types
const { fetchMessage } = mercy<
  IncomingMessage,
  OutgoingMessage
>();

// use `fetchMessage()` to send a message and await its return
const payload = await fetchMessage({
  toWindow: iframe.contentWindow,
  message: { type: 'fetchValue' },
  waitFor: 'returnValue',
});

console.log(
  'iframe returned with a random value',
  payload.random
);
```

In the iframe, use `respondMessage` to return the message with another message

```ts
import { mercy } from 'iframe-mercy';
import {
  MessageFromIframe,
  MessageFromParent,
} from '~/types';

// in this context, in = parent / out = iframe
type OutgoingMessage = MessageFromIframe;
type IncomingMessage = MessageFromParent;

// bind the types
const { respondMessage } = mercy<
  IncomingMessage,
  OutgoingMessage
>();

// For safety reasons, set a expected origin of the message
const expectedOrigin = 'http://localhost:3000';
// use `respondMessage()` to await a message and return another message
respondMessage({
  fromOrigin: expectedOrigin,
  toWindow: window.parent,
  waitFor: 'fetchValue',
  responseFn() {
    return {
      type: 'returnValue',
      payload: { random: Math.random() },
    };
  },
});
```

## API

### `mercy()`

This library exports a single function `mercy` that binds types of expected messages, and returns the functions for communication

```ts
function mercy<IncomingMessage, OutgoingMessage>(options: {
  isValidMessage: (v: unknown) => v is IncomingMessage;
}): MercyFunctions;
```

`MercyFunctions` is defined as:

### `fetchMessage()`

```ts
// signature
function fetchMessage(options: {
  toWindow: Window;
  message: OutgoingMessage;
  waitFor: IncomingMessage['type'];
}): Promise<IncomingMessage['payload']>;
```

Sends a message and awaits for a specific message type
Returns a promise that is the response of the sent message

```ts
// example
const { fetchMessage } = mercy<IncomingMessage, OutgoingMessage>()
const returnValuePayload = await fetchMessage({
  toWindow: iframe.contentWindow,
  message: { type: 'fetchValue' }
  waitFor: 'returnValue'
})
```

### `respondMessage()`

```ts
// signature
function respondMessage(options: {
  fromOrigin: string;
  toWindow: Window;
  waitFor: IncomingMessage['type'];
  responseFn: (
    payload: IncomingMessage['payload']
  ) => OutgoingMessage;
}): void;
```

Receives a message and sends another message as response

```ts
// example
const { respondMessage } = mercy<IncomingMessage, OutgoingMessage>()
respondMessage({
  fromOrigin: 'http://localhost:3000',
  toWindow: window.parent,
  waitFor: 'fetchValue',
  responseFn(fetchPayload) {
    console.log(fetchPayload);
    return {
      type: 'returnValue',
      payload: { random: Math.random() },
    };
  },
});
```

### `addMessageListener()`

```ts
// signature
function addMessageListener(options: {
  fromOrigin: string;
  messageType: IncomingMessage['type'];
  onMessage: (payload: IncomingMessage['payload']) => void;
}): () => void;
```

Subscribes to all ocurrences of a specific message type
Returns the unsubscribe function

```ts
// example
const { addMessageListener } = mercy<IncomingMessage, OutgoingMessage>()
const unsubscribe = addMessageListener({
  fromOrigin: 'http://localhost:3000',
  messageType: 'returnValue',
  onMessage: (returnValuePayload) => {
    console.log(returnValuePayload);
  },
});

function onUnmount() {
  unsubscribe();
}
```

### `waitForMessage()`

```ts
// signature
function waitForMessage(options: {
  fromOrigin: string;
  messageType: IncomingMessage['type'];
}): Promise<IncomingMessage['payload']>;
```

Listens to one ocurrence of a specific message type
Returns a promise of the received message payload

```ts
// example
const { waitForMessage } = mercy<IncomingMessage, OutgoingMessage>()
const returnValuePayload = await waitForMessage({
  fromOrigin: 'http://localhost:3000',
  messageType: 'returnValue',
});
```
