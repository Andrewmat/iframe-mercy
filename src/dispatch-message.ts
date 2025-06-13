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
