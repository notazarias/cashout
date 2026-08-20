import { z } from 'zod'

export const moneyFieldSchema = z.coerce.number().min(0, 'Must be 0 or more')
export const dateFieldSchema = z.string().min(1, 'Date is required')
export const locationFieldSchema = z.string().optional()
export const durationFieldSchema = z.coerce.number().min(0).optional()

export const startSessionSchema = z.object({
  date: dateFieldSchema,
  locationLabel: locationFieldSchema,
  buyIn: moneyFieldSchema,
})

export const closeSessionSchema = z.object({
  cashOut: moneyFieldSchema,
})

export const addBuyInSchema = z.object({
  amount: moneyFieldSchema,
})

export const logPastSessionSchema = z.object({
  date: dateFieldSchema,
  locationLabel: locationFieldSchema,
  buyIn: moneyFieldSchema,
  cashOut: moneyFieldSchema,
  durationMinutes: durationFieldSchema,
})

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
