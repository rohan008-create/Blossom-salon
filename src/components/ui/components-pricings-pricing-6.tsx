"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import Avatar from './components-primitives-avatar'
import './pricing.css'

export interface PricingPlan {
  name: string
  price: number
  eyebrow: string
  features: string[]
  description: string
  buttonText: string
  href: string
  isFeatured?: boolean
  featuredLabel?: string
}
interface PricingProps { plans: PricingPlan[]; title: ReactNode; description: string; note?: string }
const rupees = new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 })
const palettes = ['blue', 'purple', 'amber'] as const

export default function Pricing6({plans, title, description, note}: PricingProps) {
  const track = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const update = useCallback(() => {
    const el = track.current
    if (!el) return
    const viewport = el.getBoundingClientRect()
    let nearest = 0, distance = Infinity
    Array.from(el.children).forEach((child, index) => {
      const card = child as HTMLElement
      const rect = card.getBoundingClientRect()
      const offset = (rect.left + rect.width / 2 - viewport.left - viewport.width / 2) / rect.width
      if (Math.abs(offset) < distance) { nearest = index; distance = Math.abs(offset) }
      const mobile = window.matchMedia('(max-width: 900px)').matches
      card.style.setProperty('--card-turn', mobile && !reduced ? `${Math.max(-1,Math.min(1,offset)) * -9}deg` : '0deg')
      card.style.setProperty('--card-depth', mobile && !reduced ? `${Math.min(Math.abs(offset),1) * -24}px` : '0px')
    })
    setActive(nearest)
  }, [reduced])
  useEffect(() => {
    const el = track.current
    if (!el) return
    let frame = 0
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update) }
    const observer = new ResizeObserver(schedule)
    observer.observe(el)
    el.addEventListener('scroll',schedule,{passive:true})
    schedule()
    return () => { observer.disconnect(); el.removeEventListener('scroll',schedule); cancelAnimationFrame(frame) }
  },[update,plans])
  const goTo = (index:number) => {
    const el = track.current, child = el?.children[index] as HTMLElement | undefined
    if (el && child) el.scrollTo({left:child.offsetLeft - (el.clientWidth-child.offsetWidth)/2,behavior:reduced?'instant':'smooth'})
  }
  return <div className="combo-pricing">
    <header className="combo-heading"><div><p className="combo-eyebrow">THE BLOSSOM COLLECTION</p><h2 id="combos-title">{title}</h2><p className="combo-intro">{description}</p></div><p className="combo-heading-note">A little care.<br/><em>A whole new feeling.</em></p></header>
    <div className="combo-plans" ref={track} role="region" aria-label="Salon packages, scroll to explore" tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();goTo(Math.max(0,Math.min(plans.length-1,active+(e.key==='ArrowRight'?1:-1))))}}}>
      {plans.map((plan,index)=><article key={plan.name} className="combo-card" data-palette={palettes[index%palettes.length]} data-featured={plan.isFeatured||undefined} aria-labelledby={`combo-plan-${index}`}>
        <div className="combo-card-hero">
          <div className="combo-card-top"><span aria-hidden="true"><Avatar shape="squircle" size="sm" color={(['blue','purple','yellow'] as const)[index%3]} blinking={!reduced}/></span>{plan.isFeatured&&<span className="combo-featured-label">{plan.featuredLabel||'Signature pick'}</span>}</div>
          <p className="combo-card-eyebrow">{plan.eyebrow}</p>
          <h3 id={`combo-plan-${index}`}>{plan.name}</h3><p className="combo-description">{plan.description}</p>
          <div className="combo-price"><span>{rupees.format(plan.price)}</span><span>/ visit</span></div><p className="combo-price-caption">Sample package price</p>
          <a className="combo-book" href={plan.href} target="_blank" rel="noopener noreferrer" aria-label={`Enquire about ${plan.name} on WhatsApp`}>{plan.buttonText}</a>
        </div>
        <div className="combo-card-body"><p className="combo-included">Your package includes</p><ul>{plan.features.map(feature=><li key={feature}><Check size={16} strokeWidth={1.8} aria-hidden="true"/><span>{feature}</span></li>)}</ul><footer><strong>One visit. Just for you.</strong><p>Our team will confirm your services and availability when you enquire.</p></footer></div>
      </article>)}
    </div>
    <div className="combo-scroll-controls"><button type="button" onClick={()=>goTo(active-1)} disabled={active===0} aria-label="Previous package"><ChevronLeft size={18}/></button><div className="combo-scroll-dots">{plans.map((plan,index)=><button type="button" key={plan.name} aria-label={`Show ${plan.name}`} aria-current={active===index?'true':undefined} onClick={()=>goTo(index)}/>)}</div><button type="button" onClick={()=>goTo(active+1)} disabled={active===plans.length-1} aria-label="Next package"><ChevronRight size={18}/></button></div>
    {note&&<p className="combo-pricing-note">{note}</p>}
  </div>
}
