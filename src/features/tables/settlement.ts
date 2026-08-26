export interface PlayerNet {
  userId: string
  displayName: string
  netCents: number
}

export interface SettlementPayment {
  fromUserId: string
  fromDisplayName: string
  toUserId: string
  toDisplayName: string
  amountCents: number
}

export function totalImbalanceCents(nets: PlayerNet[]): number {
  return nets.reduce((sum, n) => sum + n.netCents, 0)
}

/** Sort debtors/creditors by magnitude, repeatedly settle the smaller of the two remaining amounts. */
export function computeDirectSettlement(nets: PlayerNet[]): SettlementPayment[] {
  const debtors = nets
    .filter((n) => n.netCents < 0)
    .map((n) => ({ ...n, remaining: -n.netCents }))
    .sort((a, b) => b.remaining - a.remaining)
  const creditors = nets
    .filter((n) => n.netCents > 0)
    .map((n) => ({ ...n, remaining: n.netCents }))
    .sort((a, b) => b.remaining - a.remaining)

  const payments: SettlementPayment[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.remaining, creditor.remaining)
    if (amount > 0) {
      payments.push({
        fromUserId: debtor.userId,
        fromDisplayName: debtor.displayName,
        toUserId: creditor.userId,
        toDisplayName: creditor.displayName,
        amountCents: amount,
      })
    }
    debtor.remaining -= amount
    creditor.remaining -= amount
    if (debtor.remaining === 0) i++
    if (creditor.remaining === 0) j++
  }
  return payments
}

/** Every non-host loser pays the host; the host pays every non-host winner. The host's own net (if
 * they played too) is never a separate leg — it's implicitly what they keep or cover out of pocket. */
export function computeHostSettlement(nets: PlayerNet[], hostUserId: string, hostDisplayName: string): SettlementPayment[] {
  const payments: SettlementPayment[] = []
  for (const n of nets) {
    if (n.userId === hostUserId || n.netCents === 0) continue
    if (n.netCents < 0) {
      payments.push({
        fromUserId: n.userId,
        fromDisplayName: n.displayName,
        toUserId: hostUserId,
        toDisplayName: hostDisplayName,
        amountCents: -n.netCents,
      })
    } else {
      payments.push({
        fromUserId: hostUserId,
        fromDisplayName: hostDisplayName,
        toUserId: n.userId,
        toDisplayName: n.displayName,
        amountCents: n.netCents,
      })
    }
  }
  return payments
}
