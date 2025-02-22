import type { CommonMessageClientOptions } from './types';

export interface MessageClientOptions extends CommonMessageClientOptions {}
export interface MessageClient {
  sendMessage: SendMessageFunction;
}

export type SendMessageFunction = <TResponseBody, const TRequestBody = unknown>(
  id: string,
  options?: SendMessageOptions<TRequestBody>
) => Promise<TResponseBody>;

export interface SendMessageOptions<TRequestBody> {
  waitFor?: string;
  body?: TRequestBody;
}

export declare function mercyClient(
  options: MessageClientOptions
): MessageClient;
