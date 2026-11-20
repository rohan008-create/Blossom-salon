/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SalonNavbar } from "@/components/ui/salon-navbar"
import { BridalHero } from "@/components/bridal-hero"
import { SalonCombos } from "@/components/salon-combos"
import { SalonServices } from "@/components/salon-services"
import { SalonArtists } from "@/components/salon-artists"
import { SalonAbout } from "@/components/salon-about"
import { SalonGallery } from "@/components/salon-gallery"
import { SalonRituals } from "@/components/salon-rituals"
import { SalonBooking } from "@/components/salon-booking"
import { SalonFaq } from "@/components/salon-faq"
import { SalonFinalCta } from "@/components/salon-final-cta"
import { SalonFooter } from "@/components/salon-footer"
import { ThemeProvider } from "next-themes"
import { useEffect } from "react"

function InitialHashScroll() {
  useEffect(() => {
    if (!window.location.hash) return
    let frame = 0
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        let id: string
        try { id = decodeURIComponent(window.location.hash.slice(1)) }
        catch { return }
        document.getElementById(id)?.scrollIntoView({ behavior: "instant" })
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [])
  return null
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <InitialHashScroll />
        <SalonNavbar />
        <main>
          <BridalHero />
          <SalonServices />
          <SalonCombos />
          <SalonGallery />
          <SalonRituals />
          <SalonAbout />
          <SalonArtists />
          <SalonBooking />
          <SalonFaq />
          <SalonFinalCta />
        </main>
        <SalonFooter />
      </div>
    </ThemeProvider>
  )
}
