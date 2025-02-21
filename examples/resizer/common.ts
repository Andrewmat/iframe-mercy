import { z } from 'zod';

export const Height = z.string().endsWith('px').brand('height');

const fetchHeight = z.object({
  action: z.literal('fetch:height'),
});
export type FetchHeightMessage = z.infer<typeof fetchHeight>;

const responseHeight = z.object({
  action: z.literal('response:height'),
  payload: Height,
});
export type ResponseHeightMessage = z.infer<typeof responseHeight>;
