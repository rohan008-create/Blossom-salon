import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Pause, Play } from 'lucide-react'
import './footer-letter-swap.css'

const messages = ['BLOSSOM FAMILY SALON', 'YOUR BEAUTY DESTINATION', 'BEAUTIFUL MOMENTS IN RAJKOT']
const slots = Math.max(...messages.map(message => message.length))
const centered = (text: string) => text.padStart(text.length + Math.floor((slots - text.length) / 2)).padEnd(slots)

/** Original implementation: staggered, double-sided 3D letter flips. */
export function FooterLetterSwap() {
  const root = useRef<HTMLDivElement>(null)
  const [faces, setFaces] = useState([messages[0], messages[1]])
  const [turn, setTurn] = useState(0)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const turnRef = useRef(0), indexRef = useRef(0), busy = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flip = () => {
    if (busy.current) return
    const next = (indexRef.current + 1) % messages.length
    const rotation = turnRef.current + 1
    setFaces(previous => { const copy = [...previous]; copy[rotation % 2] = messages[next]; return copy })
    turnRef.current = rotation; indexRef.current = next
    setCurrent(next); setTurn(rotation)
    if (!reduced) {
      busy.current = true
      timer.current = setTimeout(() => { busy.current = false; timer.current = null }, 750 + slots * 22)
    }
  }
  const flipRef = useRef(flip); flipRef.current = flip
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const onMedia = () => { setReduced(media.matches); if (media.matches) { busy.current = false; if (timer.current) clearTimeout(timer.current) } }
    const onPage = () => setPageVisible(!document.hidden)
    media.addEventListener('change', onMedia); document.addEventListener('visibilitychange', onPage)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .2 })
    if (root.current) observer.observe(root.current)
    return () => { observer.disconnect(); media.removeEventListener('change', onMedia); document.removeEventListener('visibilitychange', onPage); if (timer.current) clearTimeout(timer.current) }
  }, [])
  useEffect(() => {
    if (paused || reduced || !visible || !pageVisible) return
    const interval = setInterval(() => flipRef.current(), 4500)
    return () => clearInterval(interval)
  }, [paused, reduced, visible, pageVisible])
  const a = centered(faces[0]), b = centered(faces[1])
  return <div className="bf-letter-signature" ref={root}>
    <div className="bf-letter-caption"><span>BLOSSOM / WORDS TO LIVE BY</span><div><span>{reduced ? 'Tap to change the message' : 'Hover or tap to turn the page'}</span>{!reduced && <button type="button" aria-label={paused ? 'Resume footer animation' : 'Pause footer animation'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={12} /> : <Pause size={12} />}</button>}</div></div>
    <button type="button" className="bf-letter-stage" aria-label={`Next footer message. ${messages[current]}`} onClick={() => flipRef.current()} onPointerEnter={event => { if (event.pointerType === 'mouse') flipRef.current() }}>
      <span className="bf-letter-row" aria-hidden="true">{Array.from({ length: slots }, (_, index) => <span className="bf-letter-slot" key={index}><span className="bf-letter-cube" style={{ '--letter-turn': `${-180 * turn}deg`, '--letter-delay': `${index * 22}ms` } as CSSProperties}><span className="bf-letter-face bf-letter-front">{a[index] === ' ' ? '\u00a0' : a[index]}</span><span className="bf-letter-face bf-letter-back">{b[index] === ' ' ? '\u00a0' : b[index]}</span></span></span>)}</span>
    </button>
    <div className="bf-letter-pagination" aria-hidden="true">{messages.map((message, index) => <span key={message} className={current === index ? 'is-current' : ''} />)}</div>
  </div>
}
