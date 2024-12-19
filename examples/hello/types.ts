import type { GenericMessage } from '../../src';

export interface HelloMessage extends GenericMessage {
  type: 'hello';
  payload: {
    name: string;
  };
}

export interface HelloBackMessage extends GenericMessage {
  type: 'hello back';
  payload: {
    timeOfDay: 'morning' | 'night';
  };
}
