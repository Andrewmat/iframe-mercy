export interface HelloMessage {
  action: 'hello';
  payload: {
    name: string;
  };
}

export interface HelloBackMessage {
  action: 'hello back';
  payload: {
    timeOfDay: 'morning' | 'night';
  };
}
