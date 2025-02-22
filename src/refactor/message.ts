import { getVersion } from '../utils';

export type MercyMessage<TId extends string, TBody> = {
  mercy: {
    version: string;
  };
  id: TId;
  body: TBody | undefined;
};

export function createMessage<TId extends string, TBody>(
  id: TId,
  body?: TBody
): MercyMessage<TId, TBody> {
  return {
    mercy: { version: getVersion() },
    id,
    body,
  };
}
