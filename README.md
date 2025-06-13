# iframe-mercy

Your iframe communication made simple.

## The issue and solution

The API `postMessage` for iframe communication is limited and lackluster.

This library introduces a new way to deal with communication, using the same model that everyone is used to.

## Getting started

```txt
pnpm add iframe-mercy
yarn add iframe-mercy
npm install iframe-mercy
```

You will need to create a server and a client. The client will request the server, and the server will listen and respond back to the client.

For the server, you will need to declare all message handlers

```ts
import { setupServer, matchMessage } from 'iframe-mercy';

const parentOrigin = 'https://www.example.com';
const server = setupServer({
  outgoingOrigin: parentOrigin,
  outgoingWindow: window.parent,
});

// endpoints
server.addListener(
  matchMessage({ type: 'user-data' }),
  (request) => {
    console.log('received request', request),
    return {
      type: 'user-data:response',
      payload: 'John Doe',
    }
  }
)

server.listen();
```

For the client, you will send messages to the server and receive responses

```ts
import { setupClient, matchMessage } from 'iframe-mercy';

const mercyClient = setupClient({
  outgoingOrigin: 'https://iframe.example.com',
  outgoingWindow: document.getElementsByTagName('iframe')[0]
});

const response = await mercyClient.postMessage({
  message: { type: 'user-data' }
  waitFor: matchMessage({ type: 'user-data:response' })
})

console.log(response.payload) // > John Doe
```

## Helpful tips

`iframe-mercy` requires matchers to trigger requests and responses. That is why helpful functions like `matchMessage` and `matchKey` exist.

```ts
import { matchMessage, matchKey } from 'iframe-mercy';

client.postMessage({
  // matches key/values pairs of the given object
  waitFor: matchMessage({ action: 'MY_ACTION' }),
});

// you can also share a single format in the application
const matchAction = matchKey('action');
client.postMessage({
  waitFor: matchAction('MY_ACTION')
})
```

However, the matcher also can be a function to be customized.

```ts
client.postMessage({
  waitFor: (message) => message.type.startsWith('ACTION/'),
})
```

## API

TO DO
