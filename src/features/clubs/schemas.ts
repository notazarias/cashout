import { z } from 'zod'
import { codeFieldSchema } from '@/features/tables/schemas'

export const clubNameFieldSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(60, 'Keep it under 60 characters')

export const createClubSchema = z.object({
  name: clubNameFieldSchema,
})

export const joinClubSchema = z.object({
  code: codeFieldSchema,
})
