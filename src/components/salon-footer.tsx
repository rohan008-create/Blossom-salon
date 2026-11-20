import { ArrowUp, ArrowUpRight, Check, Copy, Phone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import LogoIcon from '@/assets/logo/logo-icon'
import { SALON_ADDRESS, SALON_MAPS, SALON_PHONE, SALON_TEL, whatsappEnquiry } from '@/lib/salon-contact'
import './salon-footer.css'
import { FooterLetterSwap } from './footer-letter-swap'

const links = [
  ['Services', '#our-services'], ['Our artists', '#artists'],
  ['Combos', '#combos'], ['About Blossom', '#about'],
  ['Gallery', '#gallery'], ['Plan a visit', '#booking'],
  ['Products', '#services'], ['Good to know', '#faq'],
]

export function SalonFooter() {
  const footerRef = useRef<HTMLElement>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current) }, [])
  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let observer: IntersectionObserver | undefined
    const configure = () => {
      observer?.disconnect()
      const parts = footer.querySelectorAll('.bf-topline,.bf-brand,.bf-navigation,.bf-contact,.bf-letter-signature,.bf-bottom')
      if (media.matches) {
        delete footer.dataset.motion
        delete footer.dataset.active
        parts.forEach(part => part.classList.remove('bf-reveal', 'bf-visible'))
        return
      }
      footer.dataset.motion = 'true'
      parts.forEach(part => part.classList.add('bf-reveal'))
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.target === footer) footer.dataset.active = String(entry.isIntersecting)
          else if (entry.isIntersecting) entry.target.classList.add('bf-visible')
        })
      }, { threshold: .08 })
      observer.observe(footer)
      parts.forEach(part => observer?.observe(part))
    }
    configure()
    media.addEventListener('change', configure)
    return () => { observer?.disconnect(); media.removeEventListener('change', configure) }
  }, [])
  const copyAddress = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(SALON_ADDRESS)
      else {
        const input = document.createElement('textarea')
        input.value = SALON_ADDRESS; input.readOnly = true; input.style.position = 'fixed'; input.style.opacity = '0'
        document.body.appendChild(input); input.select()
        let copied = false
        try { copied = document.execCommand('copy') } finally { input.remove() }
        if (!copied) throw new Error('Clipboard unavailable')
      }
      setCopyState('copied')
    } catch { setCopyState('failed') }
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopyState('idle'), 3000)
  }
  const year = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date())
  return <footer ref={footerRef} id="footer" className="blossom-footer" aria-label="Blossom salon information">
    <svg className="bf-center-notch" viewBox="0 0 220 38" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H220C185 0 187 36 153 36H67C33 36 35 0 0 0Z" /></svg>
    <div className="bf-inner">
      <div className="bf-topline"><p><span /> A LITTLE BLOSSOM, EVERY DAY.</p><a href="#booking">Your next look starts here <ArrowUpRight size={14} /></a></div>
      <div className="bf-content">
        <div className="bf-brand"><a href="#home" aria-label="Blossom Family Salon home" className="bf-brand-logo"><LogoIcon variant="auto" /></a><h2>Come as you are.<br /><em>Leave a little brighter.</em></h2><p>Your neighbourhood space for hair, beauty and a little time for yourself.</p><a href="#booking" className="bf-book">Let’s plan your visit <span><ArrowUpRight size={17} /></span></a><div className="bf-location-tag"><span>RAJKOT, INDIA</span><span>FAMILY SALON</span></div></div>
        <nav className="bf-navigation" aria-label="Footer navigation"><p className="bf-label">TAKE A LOOK AROUND</p><div>{links.map(([label, href]) => <a key={href} href={href}>{label}<ArrowUpRight size={12} /></a>)}</div><a className="bf-whatsapp" href={whatsappEnquiry()} target="_blank" rel="noopener noreferrer">A question? Let’s chat <ArrowUpRight size={14} /></a></nav>
        <div className="bf-contact"><p className="bf-label">A LITTLE CLOSER TO YOU</p><div className="bf-address-card"><div className="bf-address-heading"><span>VISIT BLOSSOM</span><span>01 / RAJKOT</span></div><h3>Find your way<br />to <em>Blossom.</em></h3><address>{SALON_ADDRESS}</address><div className="bf-address-actions"><a href={SALON_MAPS} target="_blank" rel="noopener noreferrer">Get directions <ArrowUpRight size={13} /></a><button type="button" onClick={copyAddress} aria-label="Copy salon address">{copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />}<span>{copyState === 'copied' ? 'Copied' : 'Copy'}</span></button></div><span className="bf-copy-status" role="status">{copyState === 'copied' ? 'Address copied.' : copyState === 'failed' ? 'Select the address above to copy it.' : ''}</span></div><a href={SALON_TEL} className="bf-phone"><span className="bf-phone-icon"><Phone size={15} /></span><span><small>CALL THE SALON</small>{SALON_PHONE}</span><ArrowUpRight size={15} /></a></div>
      </div>
      <FooterLetterSwap />
      <div className="bf-bottom"><p>© {year} Blossom Family Salon.</p><span>Made for your kind of beautiful.</span><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Back to top <span><ArrowUp size={14} /></span></button></div>
    </div>
  </footer>
}
