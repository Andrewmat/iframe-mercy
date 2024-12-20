import type { GenericMessage } from './types';

export const initMessage = {
  type: '__mercy_init__',
} as const satisfies GenericMessage;

export const ackMessage = {
  type: '__mercy_ack__',
} as const satisfies GenericMessage;
