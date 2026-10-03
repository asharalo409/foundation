import { useEffect, useState } from 'react'

type M = { kind: 'iframe' | 'video' | 'image'; src: string; url: string }

const IMG = /\.(jpe?g|png|gif|webp|avif|bmp)$/i
const VID = /\.(mp4|webm|mov|m4v|ogv)$/i
const enc = encodeURIComponent

export function mediaFor(raw: string): M | null {
  let u: URL
  try { u = new URL(raw) } catch { return null }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null

  const h = u.hostname.replace(/^(www|m|mobile)\./, '')
  const p = u.pathname
  const q = u.searchParams
  const frame = (src: string): M => ({ kind: 'iframe', src, url: raw })
  const yt = (id: string) =>
    frame(`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`)
  const fbVideo = () =>
    frame(`https://www.facebook.com/plugins/video.php?href=${enc(raw)}&show_text=false&width=500`)
  const fbPost = () =>
    frame(`https://www.facebook.com/plugins/post.php?href=${enc(raw)}&show_text=true&width=500`)

  if (h === 'youtu.be') {
    const id = p.split('/')[1]
    return id ? yt(id) : null
  }
  if (h === 'youtube.com') {
    if (p === '/watch' && q.get('v')) return yt(q.get('v') as string)
    const m = p.match(/^\/(shorts|embed|live)\/([\w-]+)/)
    if (m) return yt(m[2])
    if (p === '/playlist' && q.get('list'))
      return frame(`https://www.youtube-nocookie.com/embed/videoseries?list=${q.get('list')}`)
    return null
  }
  if (h === 'vimeo.com') {
    const id = p.match(/^\/(\d+)/)?.[1]
    return id ? frame(`https://player.vimeo.com/video/${id}`) : null
  }
  if (h === 'fb.watch') return fbVideo()
  if (h === 'facebook.com' || h === 'fb.com') {
    if (/\/(videos?|reels?)\b/.test(p) || /^\/watch\/?$/.test(p) || /^\/share\/(v|r)\//.test(p))
      return fbVideo()
    if (
      /\/(photo|photos|posts|permalink|media)\b/.test(p) ||
      /^\/share\/p\//.test(p) ||
      /pfbid/.test(p) ||
      p === '/photo.php' || p === '/permalink.php' || p === '/story.php' ||
      q.has('fbid')
    ) return fbPost()
    return null
  }
  if (h === 'instagram.com') {
    const m = p.match(/^\/(p|reel|tv)\/([\w-]+)/)
    return m ? frame(`https://www.instagram.com/${m[1]}/${m[2]}/embed`) : null
  }
  if (h === 'drive.google.com') {
    const id = p.match(/\/file\/d\/([\w-]+)/)?.[1] || q.get('id')
    return id ? frame(`https://drive.google.com/file/d/${id}/preview`) : null
  }
  if (IMG.test(p)) return { kind: 'image', src: raw, url: raw }
  if (VID.test(p)) return { kind: 'video', src: raw, url: raw }
  if (/\.pdf$/i.test(p))
    return frame(`https://docs.google.com/viewer?embedded=true&url=${enc(raw)}`)
  return null
}

export default function MediaHost() {
  const [m, setM] = useState<M | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return
      const a = (e.target as Element)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.hasAttribute('data-native')) return
      const media = mediaFor(a.href)
      if (!media) return
      e.preventDefault()
      setM(media)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  if (!m) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col" onClick={() => setM(null)}>
      <div className="flex justify-between items-center p-3 text-white" onClick={e => e.stopPropagation()}>
        <span className="text-sm">▶ অ্যাপের ভেতরে দেখছেন</span>
        <button className="text-2xl px-2" onClick={() => setM(null)}>✕</button>
      </div>

      <div className="flex-1 flex items-center justify-center p-2 overflow-auto"
        onClick={e => e.stopPropagation()}>
        {m.kind === 'image' && (
          <img src={m.src} className="max-w-full max-h-full object-contain rounded-lg" />
        )}
        {m.kind === 'video' && (
          <video src={m.src} controls autoPlay playsInline className="max-w-full max-h-full rounded-lg" />
        )}
        {m.kind === 'iframe' && (
          <iframe
            src={m.src}
            className="w-full h-full max-w-3xl rounded-lg bg-white"
            style={{ minHeight: 360 }}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
      </div>

      <p className="text-center text-[11px] text-gray-400 p-2" onClick={e => e.stopPropagation()}>
        লিংকটি না চললে{' '}
        <a data-native href={m.url} target="_blank" rel="noreferrer" className="underline">
          বাইরে খুলুন
        </a>
      </p>
    </div>
  )
}
