export interface GenericMessage {
  type: unknown;
  payload?: unknown;
}

export function mercy<
  TGenericMessageIn extends GenericMessage,
  TGenericMessageOut extends GenericMessage
>(
  {
    isValidMessage: isValidMessageIn,
  }: {
    isValidMessage?: (v: unknown) => v is TGenericMessageIn;
  } = {},
  thisWindow: Window = window
) {
  /**
   * Sends a message and awaits for a specific message type
   * @returns a promise with the payload of the response message
   * */
  function fetchMessage<
    TMessageIn extends TGenericMessageIn
  >({
    toWindow,
    message,
    waitFor,
  }: {
    toWindow: Window;
    message: TGenericMessageOut;
    waitFor: TMessageIn['type'];
  }) {
    const promise = waitForMessage({
      fromOrigin: toWindow.origin,
      messageType: waitFor,
    });
    postMessage(toWindow, message);
    return promise;
  }

  /**
   * Subscribes to all ocurrences of a specific message type
   * @returns the unsubscribe function
   * */
  function addMessageListener<
    TMessageIn extends TGenericMessageIn
  >({
    fromOrigin,
    messageType,
    onMessage,
  }: {
    fromOrigin: string;
    messageType: TMessageIn['type'];
    onMessage: (data: TMessageIn['payload']) => void;
  }) {
    const listener = (e: MessageEvent) => {
      if (e.origin !== fromOrigin) return;
      if (isValidMessageIn && !isValidMessageIn(e.data))
        return;
      if (e.data.type !== messageType) return;
      onMessage(e.data.payload);
    };

    thisWindow.addEventListener('message', listener);
    return function unsubscribe() {
      thisWindow.removeEventListener('message', listener);
    };
  }

  /**
   * Listens to one ocurrence of a specific message type
   * @returns a promise of the awaited message payload
   * */
  async function waitForMessage<
    TMessageIn extends TGenericMessageIn
  >({
    fromOrigin,
    messageType,
  }: {
    fromOrigin: string;
    messageType: TMessageIn['type'];
  }) {
    return new Promise<TMessageIn['payload']>((resolve) => {
      const unsubscribe = addMessageListener({
        fromOrigin,
        messageType,
        onMessage: (data) => {
          resolve(data);
          unsubscribe();
        },
      });
    });
  }

  /**
   * Receives a message and sends another message as response
   */
  function respondMessage<
    TMessageIn extends TGenericMessageIn
  >({
    fromOrigin,
    toWindow,
    waitFor,
    responseFn,
  }: {
    fromOrigin: string;
    toWindow: Window;
    waitFor: TMessageIn['type'];
    responseFn: (
      data: TMessageIn['payload']
    ) => TGenericMessageOut;
  }) {
    addMessageListener({
      fromOrigin: fromOrigin,
      messageType: waitFor,
      onMessage: (payload) => {
        postMessage(toWindow, responseFn(payload));
      },
    });
  }

  /** wrap of window.postMessage */
  function postMessage(
    to: Window,
    message: TGenericMessageOut
  ) {
    to.postMessage(message, to.origin);
  }

  return {
    fetchMessage,
    respondMessage,
    addMessageListener,
    waitForMessage,
    postMessage,
  };
}
