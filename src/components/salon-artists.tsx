import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, MoveUpRight } from 'lucide-react'
import { whatsappEnquiry } from '@/lib/salon-contact'
import './salon-artists.css'

const Lanyard = lazy(() => import('@/components/ui/Lanyard'))

// Demo profiles: replace these names, roles and AI-generated portraits with the salon's team.
export const artists = [
  { name: 'Mira Shah', role: 'Hair artist', note: 'Great hair. Your way.', tone: '#e8b6c9' },
  { name: 'Aarav Mehta', role: 'Colour artist', note: 'Find your own shade.', tone: '#dfba9a' },
  { name: 'Riya Patel', role: 'Makeup artist', note: 'Made for your moment.', tone: '#c7b5da' },
  { name: 'Kavya Joshi', role: 'Skin specialist', note: 'A little time for you.', tone: '#b9c9b5' },
  { name: 'Dev Shah', role: 'Grooming artist', note: 'It’s all in the details.', tone: '#afc6ce' },
]

function ArtistBadge({ artist, index }: { artist: typeof artists[number]; index: number }) {
  const host = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [flipped, setFlipped] = useState(false)
  const number = String(index + 1).padStart(2, '0')
  const front = `/images/artists/artist-${number}-front-ai.svg`
  const back = `/images/artists/artist-${number}-back.svg`
  useEffect(() => {
    const element = host.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } }, { rootMargin: '100px' })
    observer.observe(element)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => { observer.disconnect(); media.removeEventListener('change', onChange) }
  }, [])
  const flip = () => {
    const lanyard = host.current?.querySelector('.lanyard[data-ready="true"]')
    if (lanyard && !reduced) lanyard.dispatchEvent(new Event('lanyard-flip'))
    else setFlipped(value => !value)
  }
  const fallback = <div className="artist-static-badge"><img src={flipped ? back : front} alt="" loading="lazy" /></div>
  return <article className="artist-profile" style={{ '--artist-tone': artist.tone } as React.CSSProperties} aria-labelledby={`artist-${number}-name`}>
    <div className="artist-rail-pin" aria-hidden="true"><span />{number}</div>
    <div className="artist-lanyard-stage" ref={host}>
      {inView && !reduced ? <Suspense fallback={fallback}><Lanyard frontImage={front} backImage={back} strapImage="/images/artists/band.svg" imageFit="cover" cardColor="#ffffff" orientation="portrait" finish="glossy" cornerRadius={0.3} size={0.6} anchor="center" strapLength={0.5} strapColor="#321827" strapWidth={0.65} metal="silver" gravity={1} damping={0.5} elasticity={0.5} breeze={0.25} interactive intro /></Suspense> : fallback}
    </div>
    <div className="artist-info"><p className="artist-speciality">{artist.role}</p><h3 id={`artist-${number}-name`}>{artist.name}</h3><p className="artist-note">{artist.note}</p>
      <button type="button" className="artist-flip" onClick={flip} aria-label={`Flip ${artist.name}'s card`}><RotateCw size={13} /> Flip card</button>
    </div>
  </article>
}

export function SalonArtists() {
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const scrollTo = (index: number) => {
    const list = track.current
    if (!list) return
    const next = Math.max(0, Math.min(artists.length - 1, index))
    const card = list.children[next] as HTMLElement
    list.scrollTo({ left: card.offsetLeft - (list.clientWidth - card.clientWidth) / 2, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  const updateActive = () => {
    const list = track.current
    if (!list) return
    const center = list.scrollLeft + list.clientWidth / 2
    let nearest = 0
    let distance = Infinity
    Array.from(list.children).forEach((child, index) => {
      const el = child as HTMLElement
      const delta = Math.abs(el.offsetLeft + el.clientWidth / 2 - center)
      if (delta < distance) { nearest = index; distance = delta }
    })
    setActive(nearest)
  }
  return <section id="artists" className="salon-artists" aria-labelledby="artists-title">
    <div className="artists-intro"><div><p className="artists-eyebrow"><span /> THE HANDS BEHIND THE MAGIC</p><h2 id="artists-title">Our artists.<br /><em>Your kind of magic.</em></h2></div><div className="artists-intro-aside"><p>Different talents. One little obsession.<br />Making you feel beautifully you.</p><span className="artists-interaction"><span aria-hidden="true">↔</span> Drag to play. Tap to discover.</span></div></div>
    <div className="artists-track" ref={track} onScroll={updateActive} role="region" aria-label="Meet our five artists" tabIndex={0} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); scrollTo(active + (event.key === 'ArrowRight' ? 1 : -1)) } }}>
      {artists.map((artist, index) => <ArtistBadge key={artist.name} artist={artist} index={index} />)}
    </div>
    <div className="artists-mobile-controls"><button type="button" aria-label="Previous artist" onClick={() => scrollTo(active - 1)} disabled={active === 0}><ArrowLeft size={18} /></button><div>{artists.map((artist, index) => <button key={artist.name} type="button" aria-label={`Show ${artist.name}`} aria-current={active === index ? 'true' : undefined} onClick={() => scrollTo(index)}><span /></button>)}</div><button type="button" aria-label="Next artist" onClick={() => scrollTo(active + 1)} disabled={active === artists.length - 1}><ArrowRight size={18} /></button></div>
    <footer className="artists-footer"><p>Illustrated demo profiles. Meet the salon’s actual team on your visit.</p><a href={whatsappEnquiry('Hello Blossom, I would like help choosing an artist for my next visit.')} target="_blank" rel="noopener noreferrer">Find your artist <MoveUpRight size={15} /></a></footer>
  </section>
}
