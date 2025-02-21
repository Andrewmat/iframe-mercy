import type { GenericMessage } from '../../src';

export interface HelloMessage extends GenericMessage {
  action: 'hello';
  payload: {
    name: string;
  };
}

export interface HelloBackMessage extends GenericMessage {
  action: 'hello back';
  payload: {
    timeOfDay: 'morning' | 'night';
  };
}
