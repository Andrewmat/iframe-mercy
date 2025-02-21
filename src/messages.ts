import type { GenericMessage } from './types';

export const initMessage = {
  action: '__mercy_init__',
} as const satisfies GenericMessage;

export const ackMessage = {
  action: '__mercy_ack__',
} as const satisfies GenericMessage;
