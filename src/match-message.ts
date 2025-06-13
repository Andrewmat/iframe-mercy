import type { MessageMatcher } from './utils';

export function matchMessage<
  TIncoming extends TRecord,
  const TRecord extends {},
>(record: TRecord): MessageMatcher<TIncoming> {
  const entries = Object.entries(record);
  return function recordMatcher(data: unknown): data is TIncoming {
    if (data == null) return false;

    for (const entry of entries) {
      const recordKey = entry[0];
      const recordValue = entry[1];
      if (!data[recordKey as keyof typeof data]) return false;

      const dataValue = data[recordKey as keyof typeof data];

      if (dataValue !== recordValue) return false;
    }
    return true;
  };
}
