# iframe-mercy

Simple Iframe communication.

The API `postMessage` for iframe communication is limited and lackluster.

This library introduces a new way to deal with communication, using the same model that everyone is used to.

## Getting started

```txt
pnpm add iframe-mercy
yarn add iframe-mercy
npm install iframe-mercy
```

You will need to create a server and a client. The client will request the server, and the server will listen and respond back to the client.

### Server

```ts
import { setupServer, matchMessage } from 'iframe-mercy';

const parentOrigin = 'https://www.example.com';
const mercyServer = setupServer({
  incomingOrigins: [parentOrigin],
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

### Client

```ts
import { setupClient, matchMessage } from 'iframe-mercy';

const mercyClient = setupClient({
  outgoingOrigin: 'https://iframe.example.com',
  outgoingRoot: document.getElementsByTagName('iframe')[0],
});

const response = await mercyClient.postMessage({
  message: { type: 'user-data' },
  waitFor: matchMessage({ type: 'user-data:response' }),
});

console.log(response.payload); // > John Doe
```

## Server/Client

Your iframe and parent container need to be assigned to server/client roles.

- **Server**: Passive, awaits messages and triggers actions, possibly returning a response.
- **Client**: Post messages to the server and awaits responses.

Both iframe and parent can have dual roles if needed (e.g., iframe requests data from parent, and also sends height data to parent).

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

### `setupClient(options: SetupClientOptions): MercyClient`

Creates a new client to send messages to a server.

#### `SetupClientOptions`

```ts
type SetupClientOptions = {
  outgoingOrigin: string;
  outgoingRoot: Window;
  signal?: AbortSignal;
  waitForServer?: boolean;
};
```

- `outgoingOrigin`: The expected origin for the server (required).
- `outgoingRoot`: The target window (iframe or parent) (required).
- `signal`: Optional abort signal for cleanup.
- `waitForServer`: Wait for server initialization (default: true). Set to `false` if the receiver does not use `iframe-mercy`'s server (e.g., custom message handlers), so the client sends messages immediately without waiting for a handshake.

#### `MercyClient`

The client instance returned by `setupClient`. The only method is:

```ts
postMessage<TOutgoing, TIncoming>(options: PostMessageOptions<TOutgoing, TIncoming>): Promise<TIncoming | void>;
```

```ts
// usage example
const response = await mercyClient.postMessage({
  message: { type: 'get-user', id: 123 },
  waitFor: matchMessage({ type: 'get-user:response' }),
});
console.log(response.user);

// Without waitFor (fire and forget)
client.postMessage({
  message: { type: 'log-event' },
});
```

#### `PostMessageOptions`

```ts
type PostMessageOptions<TOutgoing = any, TIncoming = any> = {
  message: TOutgoing;
  waitFor?: MessageMatcher<TIncoming>;
  signal?: AbortSignal;
};
```

- `message`: The message to send.
- `waitFor`: Matcher for the expected response. Can be a custom function, or created with `matchMessage` or `matchKey`.
- `signal`: Optional abort signal for the `waitFor` response.

### `setupServer(options: SetupServerOptions): MercyServer`

Creates a new server to listen for messages from clients.

#### `SetupServerOptions`

```ts
type SetupServerOptions = {
  incomingOrigins?: string[];
  signal?: AbortSignal;
};
```

- `incomingOrigins`: Array of allowed origins for incoming messages.
- `signal`: Optional abort signal for cleanup.

```ts
import { setupServer } from 'iframe-mercy';

const abortController = new AbortController();
const mercyServer = setupServer({
  incomingOrigins: ['https://external.example.com'],
  signal: abortController.signal,
});
```

#### `MercyServer`

The server instance returned by `setupServer`. Main methods:

- `addListener(matcher: MessageMatcher, listener: MessageListener): MercyServer`
- `listen(): void`

```ts
mercyServer.addListener(matchMessage({ type: 'save-data' }), (message) => {
  return { type: 'save-data:response', status: 'ok' };
});

mercyServer.listen();
```

#### `MessageListener`

A function that handles incoming messages and returns a response (sync or async):

```ts
type MessageListener<TIncoming = any, TOutgoing = any> = (
  data: TIncoming
) => TOutgoing | Promise<TOutgoing>;
```

### `MessageMatcher`

A function that checks if a message matches certain criteria

```ts
type MessageMatcher<T> = (message: T) => boolean;
```

### `matchMessage(pattern: Partial<T>): MessageMatcher<T>`

Creates a matcher that matches messages with all key/value pairs in the pattern.

```ts
import { matchMessage } from 'iframe-mercy';

const matcher = matchMessage({ type: 'get-user' });
matcher({ type: 'get-user', id: 123 }); // true
matcher({ type: 'other' }); // false

// usage example
mercyServer.addListener(matcher, (message) => {
  console.log(message.type); // > 'get-user'
});
```

### `matchKey(key: string): (value: any) => MessageMatcher`

Creates a matcher factory for a specific key in message objects.

```ts
// usage example
import { matchKey } from 'iframe-mercy';

const matchType = matchKey('type');

mercyServer.addListener(matchType('get-user'), (message) => {
  return { type: 'get-user:response', data: userData };
});

client.postMessage({
  message: { type: 'get-user', id: 123 },
  waitFor: matchType('get-user:response'),
});
```

## Glossary

### Origin

The origin part of the URL, containing the protocol, hostname and port. Ex: `https://my.example.com:3350`

### AbortController

A native JS API that can be used to remove listeners and stop requests. This is the main method chosen in this lib for cleanup effects.

```ts
const abortController = new AbortController();
fetch(url, { signal: abortController.signal });
window.addEventListener('custom', listener, { signal: abortController.signal });
button.addEventListener('click', () => abortController.abort());
```
