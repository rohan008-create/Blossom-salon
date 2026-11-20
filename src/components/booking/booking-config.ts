export const EXPERIENCES = [
  { id: 'salon', number: '01', title: 'Salon Visit', caption: 'A LITTLE EVERYDAY MAGIC', description: 'Fresh hair, glowing skin, and a little time just for you.', image: '/images/booking/salon-visit.webp', action: 'Plan my salon visit', services: ['Haircut & Styling', 'Hair Colour & Care', 'Hair Spa', 'Facial & Skin Care', 'Nails & Manicure', 'Beard & Grooming'] },
  { id: 'bridal', number: '02', title: 'Bridal & Wedding', caption: 'FOR YOUR FOREVER MOMENT', description: 'From the first consultation to your unforgettable day.', image: '/images/booking/bridal-wedding.webp', action: 'Plan my bridal look', services: ['Bridal Consultation', 'Bridal Makeup', 'Bridal Hairstyling', 'Pre-Bridal Care', 'Engagement Makeup', 'Wedding Guest Makeup'] },
  { id: 'occasion', number: '03', title: 'Party & Occasion', caption: 'A LITTLE EXTRA YOU', description: 'Your kind of glam, for the moments that deserve it.', image: '/images/booking/party-occasion.webp', action: 'Plan my occasion look', services: ['Occasion Makeup', 'Hairstyling', 'Nail Art', 'Saree Draping Enquiry', 'Group Makeup Enquiry'] },
] as const
export type ExperienceId = typeof EXPERIENCES[number]['id']
export interface BookingDraft { experience: ExperienceId | null; services: string[]; date: string; time: string; eventDate: string; location: string; venue: string; guests: string; preference: string; name: string; phone: string; notes: string }
export const EMPTY_DRAFT: BookingDraft = { experience: null, services: [], date: '', time: '', eventDate: '', location: 'At the salon', venue: '', guests: '1', preference: 'Please recommend', name: '', phone: '', notes: '' }
export function indiaNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? ''
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` }
}
export const TIMES = Array.from({ length: 11 }, (_, index) => `${String(10 + index).padStart(2, '0')}:00`)
export function isPast(date: string, time: string) { const now = indiaNow(); return date < now.date || (date === now.date && time <= now.time) }
export function dateLabel(date: string) { return date ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(`${date}T12:00:00`)) : 'Choose a date' }
export function timeLabel(time: string) { const hour = Number(time.split(':')[0]); return time ? `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}` : 'Choose a time' }
export function visitError(draft: BookingDraft) {
  if (!draft.experience || !draft.services.length) return 'Choose at least one service for your visit.'
  if (!draft.date || !draft.time) return 'Choose your preferred appointment date and time.'
  if (isPast(draft.date, draft.time)) return 'Please choose a future appointment date and time.'
  if (draft.experience === 'bridal' && !draft.eventDate) return 'Add your wedding or event date so we can plan with you.'
  if (draft.experience !== 'salon' && draft.eventDate && draft.eventDate < draft.date) return 'Your event date should be on or after your appointment date.'
  if (draft.experience !== 'salon' && draft.location === 'At my venue — enquire' && draft.venue.trim().length < 3) return 'Tell us the venue or area for your visit enquiry.'
  if (!/^\d+$/.test(draft.guests) || +draft.guests < 1 || +draft.guests > 20) return 'Choose a group size between 1 and 20. For larger groups, add a note.'
  return ''
}
export function contactError(draft: BookingDraft) {
  if (draft.name.trim().length < 2) return 'Please enter your name (at least 2 characters).'
  const digits = draft.phone.replace(/\D/g, '')
  if (!/^[+\d\s()-]+$/.test(draft.phone) || digits.length < 10 || digits.length > 15) return 'Please enter a valid mobile number with 10–15 digits.'
  return ''
}
export function bookingMessage(draft: BookingDraft) {
  return ['Hello Blossom Family Salon! I would like to request an appointment.', '', `Name: ${draft.name.trim()}`, `Mobile: ${draft.phone.trim()}`, `Experience: ${EXPERIENCES.find(item => item.id === draft.experience)?.title}`, `Services: ${draft.services.join(', ')}`, `Preferred appointment: ${dateLabel(draft.date)}, ${timeLabel(draft.time)} (IST)`, `Artist preference: ${draft.preference}`, ...(draft.experience !== 'salon' ? [...(draft.eventDate ? [`Wedding / event date: ${dateLabel(draft.eventDate)}`] : []), `Location preference: ${draft.location}`, ...(draft.location === 'At my venue — enquire' ? [`Venue / area: ${draft.venue.trim()}`] : []), `Number of people: ${draft.guests}`] : []), ...(draft.notes.trim() ? [`Notes: ${draft.notes.trim()}`] : []), '', 'Please confirm availability, services and the final price. This is a booking request; the appointment is confirmed only after the salon replies.'].join('\n')
}
