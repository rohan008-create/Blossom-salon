import { Pricing, type PricingPlan } from '@/components/ui/pricing'
import { whatsappEnquiry } from '@/lib/salon-contact'

// Editable demo prices; confirm the final packages with the salon before publishing.
const combos: PricingPlan[] = [
  { name: 'Fresh Look', price: 699, eyebrow: 'THE EVERYDAY RESET', description: 'Fresh shape. Clean lines. A confident start to whatever’s next.', features: ['Haircut & styling', 'Beard shaping & grooming', 'Hair wash', 'Finishing touches'], buttonText: 'Enquire about this combo', href: whatsappEnquiry('Hello Blossom, I am interested in the Fresh Look combo shown at a sample price of ₹699. Please confirm the current price, included services and availability.') },
  { name: 'Glow & Go', price: 1499, eyebrow: 'YOUR MOMENT TO RESET', description: 'Good hair and a little skin care. Leave feeling refreshed, from the inside out.', features: ['Refreshing facial', 'Hair wash & conditioning', 'Blow-dry & hair styling', 'Personalised aftercare advice'], buttonText: 'Find your glow', href: whatsappEnquiry('Hello Blossom, I am interested in the Glow & Go combo shown at a sample price of ₹1,499. Please confirm the current price, included services and availability.'), isFeatured: true, featuredLabel: 'THE GLOW EDIT' },
  { name: 'Party Ready', price: 2999, eyebrow: 'FOR YOUR NEXT BIG MOMENT', description: 'A beautiful look, down to the last detail. Your occasion, your kind of glam.', features: ['Occasion makeup', 'Hairstyling', 'Classic nail polish', 'Final look consultation'], buttonText: 'Plan your party look', href: whatsappEnquiry('Hello Blossom, I am interested in the Party Ready combo shown at a sample price of ₹2,999. Please confirm the current price, included services and availability.') },
]

export function SalonCombos() {
  return <section id="combos" className="salon-combos" aria-labelledby="combos-title"><Pricing plans={combos} title={<>Better <em>together.</em></>} description="Your favourite little rituals, beautifully paired. Find a combo for your kind of day." note="Sample prices for now. Our team will confirm final services, pricing and availability when you enquire." /></section>
}
