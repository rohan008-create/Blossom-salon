/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotchNavbar } from "@/components/ui/notch-navbar"
import { BridalHero } from "@/components/bridal-hero"
import { SalonServices } from "@/components/salon-services"
import { SalonAbout } from "@/components/salon-about"
import { SalonGallery } from "@/components/salon-gallery"
import { SalonRituals } from "@/components/salon-rituals"
import { SalonReviews } from "@/components/salon-reviews"
import { SalonVisit } from "@/components/salon-visit"
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
        <NotchNavbar />
        <main>
          <BridalHero />
          <SalonServices />
          <SalonGallery />
          <SalonRituals />
          <SalonAbout />
          <SalonReviews />
          <SalonVisit />
          <SalonFaq />
          <SalonFinalCta />
        </main>
        <SalonFooter />
      </div>
    </ThemeProvider>
  )
}
