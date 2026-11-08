import { DishOrbitCarousel, type Dish } from '@/components/ui/dish-orbit-carousel'
import { RunwayBottleSvg } from '@/components/salon-product-artwork'
import { UNISEX_SERVICES } from '@/lib/salon-services-config'
import { whatsappEnquiry } from '@/lib/salon-contact'
import './salon-rituals.css'

const names = [ ['Golden', 'Hair care'], ['Silky', 'Colour care'], ['Everyday', 'Styling'], ['Dewy', 'Skin care'], ['Fresh', 'Wash care'], ['The final', 'Finishing'], ['Refined', 'Grooming'], ['Rooted in', 'Scalp care'] ]
const products: Dish[] = UNISEX_SERVICES.map((product, index) => ({
  title: names[index][0], subtitle: names[index][1], label: product.shortTab,
  image: '', artwork: <RunwayBottleSvg productIndex={index} />,
  alt: `${product.title} product packaging`, eyebrow: `${product.numberLabel} / THE BLOSSOM CARE EDIT`,
  chef: product.title, kitchen: 'BLOSSOM / SALON CARE', description: product.description,
  ingredients: ['Explore with our team', 'Personalised care advice', 'Ask about availability'],
  accent: product.accentColor, rating: 0, likes: 0,
}))

export function SalonRituals() {
  return <section id="services" className="salon-rituals" aria-labelledby="rituals-title">
    <header className="rituals-heading"><div><p className="rituals-kicker">THE BLOSSOM EDIT / 01—08</p><h2 id="rituals-title">A little care.<br /><em>A beautiful everyday.</em></h2></div><p>Explore our salon care edit.<br />Find a little something for your routine.</p></header>
    <DishOrbitCarousel dishes={products} height="min(760px, 100svh)" loop={false} onPlay={() => document.getElementById('our-services')?.scrollIntoView({ behavior: 'smooth' })} onOrder={product => window.open(whatsappEnquiry(`Hello Blossom, I would like to enquire about ${product.label} products. Please share your current range and availability.`), '_blank', 'noopener,noreferrer')} />
    <p className="rituals-footnote">Illustrative product concepts. Please confirm current brands, products and availability with the salon.</p>
  </section>
}
