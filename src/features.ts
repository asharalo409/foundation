let cur: Record<string, boolean> = {}

export const setFeatures = (f: any) => {
  cur = f && typeof f === 'object' ? f : {}
}

export const feat = (k: string) => cur[k] !== false
