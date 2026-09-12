import { useClubOpenTables } from '../useClubOpenTables'
import { ClubActiveTableBanner } from './ClubActiveTableBanner'

/** Dashboard entry point for the in-the-moment case: a club you're in has a table running right now.
 * Self-contained and renders nothing when there isn't one, same shape as HostedTableBanner. */
export function ClubOpenTablesBanner() {
  const { rows } = useClubOpenTables()

  if (rows.length === 0) return null

  return (
    <>
      {rows.map(({ table, club }) => (
        <ClubActiveTableBanner key={table.id} table={table} clubName={club.name} />
      ))}
    </>
  )
}
