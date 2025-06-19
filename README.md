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
const mercyServer = setupServer({
  outgoingOrigin: parentOrigin,
  outgoingRoot: window.parent,
});

// endpoints
mercyServer.addListener(
  matchMessage({ type: 'user-data' }),
  (request) => {
    console.log('received request', request),
    return {
      type: 'user-data:response',
      payload: 'John Doe',
    }
  }
)

mercyServer.listen();
```

For the client, you will send messages to the server and receive responses

```ts
import { setupClient, matchMessage } from 'iframe-mercy';

const mercyClient = setupClient({
  outgoingOrigin: 'https://iframe.example.com',
  outgoingRoot: document.getElementsByTagName('iframe')[0]
});

const response = await mercyClient.postMessage({
  message: { type: 'user-data' }
  waitFor: matchMessage({ type: 'user-data:response' })
})

console.log(response.payload) // > John Doe
```

## Server/Client

Your iframe and parent container needs to be assigned to server/client roles.

Server roles are passive, it awaits for messages and trigger actions based on it, possibly returning a response to it.

Clients serve to trigger these actions. The client posts messages to the server, and awaits for its response.

Your iframe and parent containers should have the role that best fits its purpose, or even have dual roles. For instance, the iframe could request url data from the parent, and also send height data from itself to a parent container; in this case, both iframe and parent would need a client and a server.

## Matchers

`iframe-mercy` requires matchers to trigger requests and responses. That is why helpful functions like `matchMessage` and `matchKey` exist.

```ts
import { matchMessage, matchKey } from 'iframe-mercy';

client.postMessage({
  // matches key/values pairs of the given object
  waitFor: matchMessage({ action: 'MY_ACTION' }),
});

// you can also share a single identifier key in the application
const action = matchKey('action');
client.postMessage({
  waitFor: action('MY_ACTION'),
});
```

However, the matcher can also be a function for custom matching.

```ts
client.postMessage({
  waitFor: (message) => message.type?.startsWith('ACTION/'),
});
```

## API reference

### `setupClient(setupClientOptions)`

Creates a new client to send messages to server. It requires an options object argument and returns the client

```ts
function setupClient(options: SetupClientOptions): MercyClient;
```

```ts
// usage example
import { setupClient } from 'iframe-mercy';

const mercyClient = setupClient({
  outgoingOrigin: 'https://iframe.example.com',
  outgoingRoot: iframe.contentWindow!,
});
```

### `SetupClientOptions`

```ts
type SetupClientOptions = {
  outgoingOrigin: string;
  outgoingRoot: Window;
  waitForServer?: boolean;
  signal?: AbortSignal;
};
```

```ts
// usage example
import { type SetupClientOptions } from 'iframe-mercy';

const setupClientOptions: SetupClientOptions = {
  outgoingOrigin: 'https://iframe.example.com',
  outgoingRoot: iframe.contentWindow!,
  waitForServer: false,
  signal: abortController.signal,
};
```

#### `SetupClientOptions['outgoingOrigin']`

The expected origin to post messages.

```ts
// usage example
import { setupClient } from 'iframe-mercy';

const mercyClient = setupClient({
  outgoingOrigin: 'https://server.example.com',
});
```

> It can be set to `'*'`, however this will disable any security checks and it is highly discouraged

#### `SetupClientOptions['outgoingRoot']`

The window to post the message to. To post messages to an iframe, you can use the `contentWindow` property.

```ts
// post to iframe example
import { setupClient } from 'iframe-mercy';

const mercyClient = setupClient({
  outgoingRoot: iframe.contentWindow!,
  // ...
});
```

To get the parent window, you can use the `parent` property.

```ts
// post to parent example
import { setupClient } from 'iframe-mercy';

const mercyClient = setupClient({
  outgoingRoot: window.parent,
  //...
});
```

#### `SetupClientOptions['waitForServer']`

`default: true`

This waits for `ServerMercy` to initialize in the receiver.

If false, the message is sent to the server without checking if the server is initialized.

This can be useful if the receiver does not use `MercyServer` and uses custom message handlers instead.

```ts
// usage example
import { setupClient } from 'iframe-mercy';

const mercyClient = setupClient({
  waitForServer: false,
  //...
});
```

#### `SetupClientOptions['signal']`

An AbortSignal that stops the client from listening the return of the posted messages and removes the message listener. It is used for cleanups and stop memory leaks.

```ts
// usage example
import { setupClient } from 'iframe-mercy';

effect((onCleanup) => {
  const controller = new AbortController();
  const client = setupClient({
    signal: controller.signal,
    // ...
  });
  onCleanup(() => {
    controller.abort();
  });
});
```

### `mercyClient.postMessage(postMessageOptions)`

TO DO

#### `PostMessageOptions['message']`

TO DO

#### `PostMessageOptions['waitFor']`

TO DO

#### `PostMessageOptions['signal']`

An AbortSignal that stops the client from listening the return of the posted message. Only has effect if there is a waitFor.

```ts
effect((onCleanup) => {
  const controller = new AbortController();

  client.postMessage({
    message: { type: 'request' }
    waitFor: matchMessage({ type: 'response' })
    signal: controller.signal,
  });

  onCleanup(() => {
    controller.abort()
  });
})
```

### `setupServer(setupServerOptions)`

Creates a new unitialized server to listen to messages. It requires an options object argument and returns the server.

```ts
function setupServer(options: SetupServerOptions): MercyServer;
```

```ts
// usage example
import { setupServer, matchKey } from 'iframe-mercy';

const matchType = matchKey('type');

const mercyServer = setupServer({
  outgoingOrigin: 'https://iframe.example.com',
  outgoingRoot: iframe.contentWindow!,
})
  .addListener(
    matchType('request'),
    (message) => {
      doSomething(message)
      return { type: 'response' }
    }
  );

mercyServer.listen()
```

### `SetupServerOptions`

```ts
type SetupServerOptions = {
  outgoingOrigin: string;
  outgoingRoot: Window;
  incomingOrigins?: string[];
  signal?: AbortSignal;
};
```

### `SetupServerOptions['outgoingOrigin']`

TO DO

### `SetupServerOptions['outgoingRoot']`

TO DO

### `SetupServerOptions['incomingOrigins']`

TO DO

### `SetupServerOptions['signal']`

An AbortSignal that stops the server and removes the message listener. It is used for cleanups and stop memory leaks.

```ts
// usage example
import { setupServer } from 'iframe-mercy';

effect((onCleanup) => {
  const controller = new AbortController();
  const server = setupServer({
    signal: controller.signal,
    // ...
  });
  onCleanup(() => {
    controller.abort();
  });
});
```

### `mercyServer.listen()`

```ts
function listen(): void;
```

Initializes the server

```ts
// usage example
import { setupServer } from 'iframe-mercy'

setupServer(serverOptions).listen()
```

### `mercyServer.addListener(matcher, controller)`

```ts
function addListener<TIncoming, TOutgoing>(
  matcher: MessageMatcher<TIncoming>,
  controller: MessageController<TIncoming, TOutgoing>
): MercyServer;

type MessageController<TIncoming, TOutgoing> = (
  data: TIncoming
) => TOutgoing | Promise<TOutgoing>;
```

```ts
// usage example
import { setupServer } from 'iframe-mercy';

setupServer(serverOptions).addListener(
  (message) => message.type === 'save-data',
  (message) => {
    storage.set('data', message.payload);
    return { type: 'save-data:response' };
  }
);
```

### matchMessage

TO DO

### matchKey

TO DO

## Glossary

### Origin

The origin part of the URL, containing the protocol, hostname and port. Ex: `https://my.example.com:3350`
