import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown, MapPin, MessageCircle, UserRound } from 'lucide-react'
import { whatsappEnquiry } from '@/lib/salon-contact'
import { EXPERIENCES, EMPTY_DRAFT, TIMES, bookingMessage, contactError, dateLabel, indiaNow, isPast, timeLabel, visitError, type BookingDraft, type ExperienceId } from './booking/booking-config'
import './salon-booking.css'

export function SalonBooking() {
  const [draft, setDraft] = useState<BookingDraft>({ ...EMPTY_DRAFT })
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<ExperienceId | null>(null)
  const reduced = useReducedMotion()
  const cards = useRef<HTMLDivElement>(null), shell = useRef<HTMLDivElement>(null), heading = useRef<HTMLHeadingElement>(null)
  const selected = EXPERIENCES.find(item => item.id === draft.experience)
  const occasion = draft.experience !== 'salon'
  const today = indiaNow().date
  const oldStep = useRef(step)
  useEffect(() => {
    if (step === oldStep.current) return
    oldStep.current = step
    const element = step === 0 ? cards.current : shell.current
    element?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
    if (step > 0) heading.current?.focus({ preventScroll: true })
  }, [step, reduced])
  const choose = (experience: ExperienceId) => {
    setDraft(previous => previous.experience === experience ? previous : { ...previous, experience, services: [], eventDate: '', location: 'At the salon', venue: '', guests: '1' })
    setPreview(null); setError(''); setStep(1)
    if (step === 1) shell.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
  }
  const patch = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => { setDraft(previous => ({ ...previous, [key]: value })); setError('') }
  const toggleService = (service: string) => { setDraft(previous => ({ ...previous, services: previous.services.includes(service) ? previous.services.filter(item => item !== service) : [...previous.services, service] })); setError('') }
  const next = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = step === 1 ? visitError(draft) : contactError(draft)
    if (message) { setError(message); return }
    setError(''); setStep(value => Math.min(3, value + 1))
  }
  const send = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const visit = visitError(draft), contact = contactError(draft)
    if (visit || contact) { event.preventDefault(); setStep(visit ? 1 : 2); setError(visit || contact) }
  }
  const tilt = (event: PointerEvent<HTMLButtonElement>) => {
    if (reduced || event.pointerType !== 'mouse') return
    const element = event.currentTarget, rect = element.getBoundingClientRect()
    element.style.setProperty('--book-rx', `${((event.clientY - rect.top) / rect.height - .5) * -5}deg`)
    element.style.setProperty('--book-ry', `${((event.clientX - rect.left) / rect.width - .5) * 6}deg`)
  }
  const untilt = (event: PointerEvent<HTMLButtonElement>) => { event.currentTarget.style.setProperty('--book-rx', '0deg'); event.currentTarget.style.setProperty('--book-ry', '0deg') }
  return <section id="booking" className="salon-booking" aria-labelledby="booking-title">
    <header className="book-section-heading"><div><p className="book-eyebrow"><span /> YOUR NEXT BLOSSOM MOMENT</p><h2 id="booking-title">Make time<br />for <em>beautiful.</em></h2></div><div><p>A little everyday care. A once-in-a-lifetime day.<br />Whatever your moment, let’s make it yours.</p><span className="book-heading-note"><CalendarDays size={13} /> Choose your experience to begin</span></div></header>
    <div className="book-experiences" ref={cards}>
      {EXPERIENCES.map((experience, index) => <motion.div key={experience.id} className={`book-card-wrap book-tone-${experience.id}${preview === experience.id ? ' is-previewing' : ''}`} initial={reduced ? false : { opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .55, delay: index * .08 }}>
        <button type="button" className={`book-experience-card${draft.experience === experience.id ? ' is-selected' : ''}`} aria-label={`Book ${experience.title}`} aria-pressed={draft.experience === experience.id} onClick={() => choose(experience.id)} onPointerMove={tilt} onPointerLeave={untilt} style={{ '--book-rx': '0deg', '--book-ry': '0deg' } as CSSProperties}>
          <span className="book-card-media"><span className="book-card-orbit" /><span className="book-card-number">{experience.number}</span><img src={experience.image} alt="" width={1086} height={1448} loading="lazy" draggable={false} /><span className="book-card-mini">{experience.id === 'bridal' ? 'THE WEDDING EDIT' : experience.id === 'salon' ? 'THE EVERYDAY EDIT' : 'THE OCCASION EDIT'}</span></span>
          <span className="book-card-content"><span className="book-card-caption">{experience.caption}</span><span className="book-card-title">{experience.id === 'salon' ? <>Salon <em>Visit.</em></> : experience.id === 'bridal' ? <>Bridal <em>& Wedding.</em></> : <>Party <em>& Occasion.</em></>}</span><span className="book-card-description">{experience.description}</span><span className="book-card-action"><span>{draft.experience === experience.id ? 'Your selected experience' : experience.action}</span><span>{draft.experience === experience.id ? <Check size={17} /> : <ArrowUpRight size={18} />}</span></span></span>
        </button>
        <button type="button" className="book-preview-toggle" aria-expanded={preview === experience.id} aria-controls={`book-preview-${experience.id}`} onClick={() => setPreview(current => current === experience.id ? null : experience.id)}>{preview === experience.id ? 'Close preview' : 'Explore services'}<span aria-hidden="true">{preview === experience.id ? '-' : '+'}</span></button>
        <div className="book-preview-panel" id={`book-preview-${experience.id}`} hidden={preview !== experience.id}><p>A LITTLE SOMETHING FOR YOU</p><h3>{experience.title}</h3><span>Pick a service to start your visit.</span><div>{experience.services.map(service => <button type="button" key={service} onClick={() => { setDraft(previous => ({ ...previous, experience: experience.id, services: [service], eventDate: '', location: 'At the salon', venue: '', guests: '1' })); setPreview(null); setError(''); setStep(1) }}>{service}<ArrowUpRight size={12} /></button>)}</div></div>
      </motion.div>)}
    </div>
    <p className="book-start-note"><span /> Choose a card. Plan your visit. Let’s talk on WhatsApp.</p>
    {step > 0 && selected && <motion.div className="book-form-shell" ref={shell} initial={reduced ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
      <aside className={`book-visit-aside book-tone-${selected.id}`}><div><p className="book-aside-kicker">YOUR SELECTED EXPERIENCE</p><h3>{selected.title}</h3><p>{selected.description}</p><button type="button" onClick={() => { setStep(0); setError('') }}>Change experience <ArrowUpRight size={13} /></button></div><div className="book-aside-portrait"><span /><img src={selected.image} alt="" width={1086} height={1448} loading="lazy" /></div><div className="book-aside-footer"><span>BLOSSOM FAMILY SALON</span><span>RAJKOT / INDIA</span></div></aside>
      <div className="book-form-main"><ol className="book-progress" aria-label="Booking progress">{['Services & date', 'Your details', 'Review & send'].map((title, index) => <li key={title} className={step > index + 1 ? 'is-complete' : ''} aria-current={step === index + 1 ? 'step' : undefined}><span>{step > index + 1 ? <Check size={12} /> : `0${index + 1}`}</span>{title}</li>)}</ol>
        <form onSubmit={next}>
          <p className="book-form-kicker">STEP 0{step} / A LITTLE CLOSER TO YOU</p><h3 ref={heading} tabIndex={-1} className="book-form-title">{['', 'Your visit, your way.', 'Let’s get to know you.', 'Looks like a lovely plan.'][step]}</h3><p className="book-form-intro">{['', 'Choose your services and tell us when you’d love to visit.', 'A few details so our team can help plan your moment.', 'Check the details below, then review and send your request on WhatsApp.'][step]}</p>
          {step === 1 && <div className="book-fields"><fieldset><legend>What would you like? <span>Choose one or more</span></legend><div className="book-services">{selected.services.map(service => <label key={service} className={draft.services.includes(service) ? 'is-selected' : ''}><input type="checkbox" checked={draft.services.includes(service)} onChange={() => toggleService(service)} /><span>{service}</span></label>)}</div></fieldset>
            <div className="book-field-row"><label>Preferred appointment date<input type="date" min={today} required value={draft.date} onChange={event => { const date = event.target.value; setDraft(previous => ({ ...previous, date, time: previous.time && isPast(date, previous.time) ? '' : previous.time })); setError('') }} /></label><label>Preferred time<select aria-label="Preferred time" required value={draft.time} onChange={event => patch('time', event.target.value)}><option value="">Choose a time</option>{TIMES.map(time => <option value={time} key={time} disabled={!draft.date || isPast(draft.date, time)}>{timeLabel(time)}</option>)}</select></label></div><p className="book-field-hint">All times are in IST. Preferred times are subject to salon availability.</p>
            {occasion && <fieldset className="book-event-fields"><legend>A little about your occasion</legend><div className="book-field-row"><label>Wedding / event date {draft.experience !== 'bridal' && <span className="book-optional">(optional)</span>}<input type="date" min={draft.date || today} required={draft.experience === 'bridal'} value={draft.eventDate} onChange={event => patch('eventDate', event.target.value)} /></label><label>Number of people<input type="number" required min={1} max={20} step={1} value={draft.guests} onChange={event => patch('guests', event.target.value)} inputMode="numeric" /></label></div><label>Where would you like the service?<select aria-label="Where would you like the service?" value={draft.location} onChange={event => patch('location', event.target.value)}><option>At the salon</option><option>At my venue — enquire</option></select></label>{draft.location === 'At my venue — enquire' && <label>Venue or area<input required minLength={3} maxLength={150} value={draft.venue} onChange={event => patch('venue', event.target.value)} placeholder="Venue name / area / city" autoComplete="off" /></label>}<p className="book-field-hint">Venue visits and group services will be discussed and confirmed by the team.</p></fieldset>}
            <label>Artist preference<select aria-label="Artist preference" value={draft.preference} onChange={event => patch('preference', event.target.value)}><option>Please recommend</option><option>No preference</option><option>Female artist preferred</option><option>Male artist preferred</option></select></label>
          </div>}
          {step === 2 && <div className="book-fields"><div className="book-field-row"><label>Your name<input required minLength={2} maxLength={80} autoComplete="name" placeholder="Your full name" value={draft.name} onChange={event => patch('name', event.target.value)} /></label><label>Mobile / WhatsApp number<input type="tel" inputMode="tel" required maxLength={22} autoComplete="tel" placeholder="+91 98765 43210" value={draft.phone} onChange={event => patch('phone', event.target.value)} /></label></div><label>Anything you’d like us to know? <span className="book-optional">(optional)</span><textarea rows={4} maxLength={500} value={draft.notes} onChange={event => patch('notes', event.target.value)} placeholder="Your look, skin or hair concerns, occasion details, or a larger group…" /></label><p className="book-field-hint">Your details are added to your WhatsApp draft. This form doesn’t store them on a server.</p></div>}
          {step === 3 && <div className="book-review"><div className="book-review-heading"><span>YOUR VISIT AT A GLANCE</span><button type="button" onClick={() => { setStep(1); setError('') }}>Edit visit</button></div><h4>{selected.title}</h4><p className="book-review-services">{draft.services.join(' · ')}</p><div className="book-review-grid"><div><CalendarDays size={16} /><span>{dateLabel(draft.date)}<small>{timeLabel(draft.time)} IST</small></span></div><div><UserRound size={16} /><span>{draft.name.trim()}<small>{draft.phone}</small></span></div>{occasion && <><div><HeartSymbol /><span>{draft.eventDate ? dateLabel(draft.eventDate) : 'Event date to discuss'}<small>{draft.guests} {draft.guests === '1' ? 'person' : 'people'}</small></span></div><div><MapPin size={16} /><span>{draft.location}<small>{draft.location === 'At my venue — enquire' ? draft.venue : 'Blossom Family Salon, Rajkot'}</small></span></div></>}</div><p className="book-review-preference">Artist preference: {draft.preference}</p>{draft.notes.trim() && <p className="book-review-notes">{draft.notes}</p>}<button type="button" className="book-edit-contact" onClick={() => setStep(2)}>Edit contact details</button><details className="book-message-preview"><summary>Preview your WhatsApp message <ChevronDown size={14} /></summary><pre>{bookingMessage(draft)}</pre></details></div>}
          {error && <p className="book-error" role="alert">{error}</p>}
          <div className="book-form-actions"><button type="button" className="book-back" onClick={() => { setStep(value => value - 1); setError('') }}><ArrowLeft size={14} /> {step === 1 ? 'Experiences' : 'Back'}</button>{step < 3 ? <button type="submit" className="book-continue">{step === 1 ? 'Your details' : 'Review my request'}<ArrowRight size={16} /></button> : <a href={whatsappEnquiry(bookingMessage(draft))} target="_blank" rel="noopener noreferrer" className="book-continue book-whatsapp" onClick={send}><MessageCircle size={16} /> Continue on WhatsApp <ArrowUpRight size={16} /></a>}</div>
          <p className="book-confirmation-note">No payment now. Our team will confirm your services, price and appointment on WhatsApp. Your request becomes a booking only after confirmation.</p>
        </form>
      </div>
    </motion.div>}
  </section>
}
function HeartSymbol() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg> }
