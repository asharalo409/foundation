import { useState } from 'react'

async function shrink(file: File, max = 1200): Promise<Blob> {
  const url = URL.createObjectURL(file)
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = url
  })
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = img.width * scale
  c.height = img.height * scale
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  URL.revokeObjectURL(url)
  return new Promise(res => c.toBlob(b => res(b!), 'image/jpeg', 0.82))
}

export default function PhotoPicker({
  supabase,
  folder,
  label,
  onDone,
}: {
  supabase: any
  folder: string
  label: string
  onDone: (url: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setMsg('')
    try {
      const blob = await shrink(file)
      const path = folder + '/' + Date.now() + '.jpg'
      const { error } = await supabase.storage
        .from('photos')
        .upload(path, blob, { contentType: 'image/jpeg' })
      if (error) throw error
      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      onDone(data.publicUrl)
    } catch (err: any) {
      setMsg('আপলোড ব্যর্থ: ' + (err.message || ''))
    }
    setBusy(false)
  }

  return (
    <div>
      <label className="inline-block border border-green-700 text-green-700 rounded-lg px-3 py-2 text-sm font-semibold">
        {busy ? 'আপলোড হচ্ছে...' : label}
        <input type="file" accept="image/*" className="hidden" onChange={pick} disabled={busy} />
      </label>
      {msg && <p className="text-xs text-red-600 mt-1">{msg}</p>}
    </div>
  )
}
