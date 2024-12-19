import { z } from 'zod';

export const Height = z
  .string()
  .endsWith('px')
  .brand('height');

const fetchHeight = z.object({
  type: z.literal('fetch:height'),
});
export type FetchHeightMessage = z.infer<
  typeof fetchHeight
>;

export function isFetchHeightMessage(
  v: unknown
): v is FetchHeightMessage {
  return fetchHeight.safeParse(v).success;
}

const responseHeight = z.object({
  type: z.literal('response:height'),
  payload: Height,
});
export type ResponseHeightMessage = z.infer<
  typeof responseHeight
>;

export function isResponseHeightMessage(
  v: unknown
): v is ResponseHeightMessage {
  return responseHeight.safeParse(v).success;
}
