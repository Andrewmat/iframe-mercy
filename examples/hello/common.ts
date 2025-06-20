import { matchKey } from '../../src';

export interface HelloMessage {
  type: 'hello';
  payload: {
    name: string;
  };
}

export interface HelloBackMessage {
  type: 'hello back';
  payload: {
    timeOfDay: 'morning' | 'night';
  };
}

export const matchType = matchKey('type');
