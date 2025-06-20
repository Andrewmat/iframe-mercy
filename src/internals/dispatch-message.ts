export function dispatchMessage<TMessage>({
  message,
  targetOrigin,
  targetWindow,
}: {
  message: TMessage;
  targetOrigin: string;
  targetWindow: Window;
}) {
  targetWindow.postMessage(message, targetOrigin);
}

export function replyMessage<TMessage>({
  message,
  event,
}: {
  message: TMessage;
  event: MessageEvent;
}) {
  const targetWindow = event.source;
  if (targetWindow) {
    targetWindow.postMessage(message, { targetOrigin: event.origin });
    return;
  }

  console.error(
    '[iframe-mercy] The message source is unreachable and cannot be responded. It may be because security restrictions or sending messages to an inactive worker. In other cases, open an issue @ https://git.new/aOtstLa'
  );
}
