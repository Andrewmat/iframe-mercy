import type { CommonMessageClientOptions } from './types';

export declare function createStandaloneMessageClient<
  TMessage,
  TIdProperty extends TMessage extends Record<string, unknown>
    ? keyof TMessage
    : string,
>(
  options: StandaloneMessageClientOptions<TMessage, TIdProperty>
): StandaloneMessageClient<TMessage, TIdProperty>;

interface StandaloneMessageClientOptions<
  TMessage,
  TIdProperty extends TMessage extends Record<string, unknown>
    ? keyof TMessage
    : string,
> extends CommonMessageClientOptions {
  idProperty: TIdProperty;
}

interface StandaloneMessageClient<
  TMessage,
  TIdProperty extends TMessage extends Record<string, unknown>
    ? keyof TMessage
    : string,
> {
  sendMessage: StandaloneSendMessageFunction<TMessage, TIdProperty>;
}

type StandaloneSendMessageFunction<
  TMessage,
  TIdProperty extends TMessage extends Record<string, unknown>
    ? keyof TMessage
    : string,
> = <TResponseMessage extends TMessage>(
  message: TMessage,
  options?: StandaloneSendMessageOptions<TResponseMessage, TIdProperty>
) => Promise<TResponseMessage>;

type StandaloneSendMessageOptions<
  TMessage,
  TIdProperty extends TMessage extends Record<string, unknown>
    ? keyof TMessage
    : string,
> = {
  waitFor: MessageMatcher<TMessage, TIdProperty>;
};

type MessageStringMatcher<
  TMessage,
  TIdProperty extends TMessage extends Record<string, unknown>
    ? keyof TMessage
    : string,
> = TIdProperty extends keyof TMessage ? TMessage[TIdProperty] : string;

type MessageFunctionMatcher<TMessage> = (message: TMessage) => boolean;

export type MessageMatcher<
  TMessage,
  TIdProperty extends TMessage extends Record<string, unknown>
    ? keyof TMessage
    : string,
> =
  | MessageFunctionMatcher<TMessage>
  | (TMessage extends Record<TIdProperty, unknown>
      ? MessageStringMatcher<TMessage, TIdProperty>
      : string);
