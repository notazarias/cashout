import { z } from 'zod'
import { dateFieldSchema, locationFieldSchema, moneyFieldSchema } from '@/features/sessions/schemas'

export const maxPlayersFieldSchema = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.coerce.number().int().min(1).optional(),
)

export const hostTableSchema = z.object({
  locationLabel: locationFieldSchema,
  buyIn: moneyFieldSchema,
  maxPlayers: maxPlayersFieldSchema,
})

export const codeFieldSchema = z
  .string()
  .min(1, 'Code is required')
  .transform((s) => s.trim().toUpperCase())

export const joinTableSchema = z.object({
  code: codeFieldSchema,
  date: dateFieldSchema,
  locationLabel: locationFieldSchema,
  buyIn: moneyFieldSchema,
})
