export const synMessage = {
  '__@mercy_type': 'init',
} as const;

export const ackMessage = {
  '__@mercy_type': 'ack',
} as const;

export function synMatcher(message: unknown): message is typeof synMessage {
  if (message == null || typeof message != 'object') return false;
  if (!('__@mercy_type' in message)) return false;
  if (message['__@mercy_type'] !== 'init') return false;

  return true;
}
export function ackMatcher(message: unknown): message is typeof ackMessage {
  if (message == null || typeof message != 'object') return false;
  if (!('__@mercy_type' in message)) return false;
  if (message['__@mercy_type'] !== 'ack') return false;

  return true;
}
