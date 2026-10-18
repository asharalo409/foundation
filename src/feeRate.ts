// কোন সদস্যের কোন মাসের চাঁদা কত:
// ক্যাটাগরি চালুর মাস (fee_plan.from) থেকে ক্যাটাগরির টাকা, তার আগের মাসে আগের সাধারণ চাঁদা (monthly_fee)
export function feeFor(settings: any, memberId: string, year: number, month: number): number {
  const base = Number(settings?.monthly_fee || 0)
  const pl = settings?.fee_plan
  if (!pl || !Array.isArray(pl.cats)) return base
  const cat = pl.cats.find((c: any) => c.id === pl.map?.[memberId])
  if (!cat) return base
  if (pl.from) {
    const [fy, fm] = String(pl.from).split('-').map(Number)
    if (fy && fm && year * 12 + month < fy * 12 + fm) return base
  }
  return Number(cat.amount || 0)
}
