# iframe-mercy

`<iframe>` communication made simple

## Getting started

```txt
pnpm add iframe-mercy
yarn add iframe-mercy
npm install iframe-mercy
```

In the iframe, use `setupServer()` and `messageHandler` to create message handlers

```ts
import { setupServer, messageHandler } from 'iframe-mercy'

const parentOrigin = 'https://www.example.com'
const server = setupServer({
  origin: parentOrigin,
  client: window.parent,
  handlers: [
    messageHandler('parent-message', () => {
      doSomething()
      return { type: 'iframe-message' }
    })
  ]
})
server.listen()
```

In the parent, use `setupClient()`

```ts
import { setupClient } from 'iframe-mercy'

const iframe = document.getElementsByTagName('iframe')[0];
const iframeOrigin = new URL(iframe.src).origin

const fetchIframe = setupClient({
  origin: iframeOrigin,
  client: iframe.contentWindow,
})

const iframeMessage = await fetchIframe({
  message: { type: 'parent-message' },
  waitFor: 'iframe-message',
})
```
