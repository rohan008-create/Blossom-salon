"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react"
import { ArrowUpRight, Menu, Phone, X } from "lucide-react"

import LogoIcon from "@/assets/logo/logo-icon"
import { SALON_PHONE, SALON_TEL, whatsappEnquiry } from "@/lib/salon-contact"
import { ThemeToggle } from "@/components/theme-toggle"
import "./salon-navbar.css"

/** The links, split either side of the wordmark. */
const LEFT_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Our Services", href: "#our-services" },
  { label: "Gallery", href: "#gallery" },
]

const RIGHT_LINKS = [
  { label: "Products", href: "#services" },
  { label: "Combos", href: "#combos" },
  { label: "About", href: "#about" },
]

const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS]

/** Section ids the navbar watches, in page order. */
const SECTIONS = ["home", "our-services", "services", "combos", "gallery", "about", "booking"]

/** Mobile focus trap: every control inside the drawer, in tab order. */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function SalonNavbar({
  className,
  logo,
  ...props
}: React.HTMLAttributes<HTMLElement> & { logo?: React.ReactNode }) {
  const [scrolled, setScrolled] = React.useState(false)
  const [active, setActive] = React.useState<string>("")
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const burgerRef = React.useRef<HTMLButtonElement>(null)
  const closeRef = React.useRef<HTMLButtonElement>(null)
  const drawerRef = React.useRef<HTMLDivElement>(null)
  const capsuleRef = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 })

  /* ---- scroll state ---------------------------------------------------- */
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* ---- which section is on screen ------------------------------------- */
  React.useEffect(() => {
    const elements = SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    )
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  /* ---- the drawer ------------------------------------------------------ */
  React.useEffect(() => {
    if (!drawerOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false)
        return
      }
      if (event.key !== "Tab") return

      const drawer = drawerRef.current
      if (!drawer) return
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
      burgerRef.current?.focus()
    }
  }, [drawerOpen])

  /* ---- the bloom follows the pointer ----------------------------------- */
  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = capsuleRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--bnav-x", `${((event.clientX - rect.left) / rect.width) * 100}%`)
    el.style.setProperty("--bnav-y", `${((event.clientY - rect.top) / rect.height) * 100}%`)
  }, [])

  const closeDrawer = React.useCallback(() => setDrawerOpen(false), [])

  return (
    <>
      <header
        className={"bnav" + (className ? " " + className : "")}
        data-scrolled={scrolled || undefined}
        {...props}
      >
        <div className="bnav-row">
          <div
            ref={capsuleRef}
            className="bnav-capsule"
            onPointerMove={onPointerMove}
          >
            <span className="bnav-bloom" aria-hidden="true" />

            <div className="bnav-main">
              <nav className="bnav-left" aria-label="Primary">
                {LEFT_LINKS.map((link) => (
                  <NavLink key={link.href} {...link} active={active === link.href.slice(1)} />
                ))}
              </nav>

              <Link
                href="#home"
                className="bnav-brand"
                aria-label="Blossom Family Salon — back to top"
              >
                {logo || <LogoIcon variant="auto" />}
              </Link>

              <nav className="bnav-right" aria-label="Secondary">
                {RIGHT_LINKS.map((link) => (
                  <NavLink key={link.href} {...link} active={active === link.href.slice(1)} />
                ))}

                <span className="bnav-sep" aria-hidden="true" />

                <span className="bnav-toggle">
                  <ThemeToggle />
                </span>

                <Link href="#booking" className="bnav-cta">
                  <span>Book your visit</span>
                  <span className="bnav-cta-icon" aria-hidden="true">
                    <ArrowUpRight />
                  </span>
                </Link>
              </nav>

              <button
                ref={burgerRef}
                type="button"
                className="bnav-burger"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen}
                aria-controls="salon-nav-drawer"
              >
                <Menu aria-hidden="true" />
                <span aria-hidden="true">Menu</span>
              </button>

              <span className="bnav-mobile-tools">
                <a className="bnav-icon-btn" href={SALON_TEL} aria-label="Call the salon">
                  <Phone aria-hidden="true" />
                </a>
                <span className="bnav-toggle">
                  <ThemeToggle />
                </span>
              </span>
            </div>

            <div className="bnav-progress" aria-hidden="true">
              <motion.span style={{ scaleX: progress }} />
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="bnav-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />
            <motion.div
              ref={drawerRef}
              id="salon-nav-drawer"
              className="bnav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
            >
              <div className="bnav-drawer-head">
                <span className="bnav-drawer-brand">
                  <LogoIcon variant="auto" />
                  <i aria-hidden="true" />
                  <b>Rajkot</b>
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  className="bnav-drawer-close"
                  onClick={closeDrawer}
                  aria-label="Close menu"
                >
                  <X aria-hidden="true" />
                </button>
              </div>

              <div className="bnav-drawer-eyebrow">
                <span>The Blossom Edit</span>
                <span aria-hidden="true">Menu</span>
              </div>

              <nav aria-label="Mobile navigation">
                {ALL_LINKS.map((link, index) => {
                  const isActive = active === link.href.slice(1)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="bnav-drawer-item"
                      data-active={isActive || undefined}
                      aria-current={isActive ? "true" : undefined}
                      onClick={closeDrawer}
                      style={{ animationDelay: `${70 + index * 45}ms` }}
                    >
                      <i>0{index + 1}</i>
                      <b>{link.label}</b>
                      <span className="bnav-drawer-arrow" aria-hidden="true">
                        <ArrowUpRight />
                      </span>
                    </Link>
                  )
                })}
              </nav>

              <div className="bnav-drawer-foot">
                <div className="bnav-drawer-contact">
                  <a href={SALON_TEL}>
                    <span className="bnav-drawer-contact-icon" aria-hidden="true">
                      <Phone />
                    </span>
                    <span>
                      <i>Call the studio</i>
                      <b>{SALON_PHONE}</b>
                    </span>
                  </a>
                  <a href={whatsappEnquiry()} target="_blank" rel="noopener noreferrer">
                    <span className="bnav-drawer-contact-icon" aria-hidden="true">
                      <ArrowUpRight />
                    </span>
                    <span>
                      <i>Prefer to write?</i>
                      <b>Enquire on WhatsApp</b>
                    </span>
                  </a>
                </div>

                <Link
                  href="#booking"
                  className="bnav-cta bnav-drawer-cta"
                  onClick={closeDrawer}
                >
                  <span>Book your visit</span>
                  <span className="bnav-cta-icon" aria-hidden="true">
                    <ArrowUpRight />
                  </span>
                </Link>

                <p className="bnav-drawer-signature">
                  Blossom Family Salon <i aria-hidden="true" /> Rajkot
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className="bnav-link"
      data-active={active || undefined}
      aria-current={active ? "true" : undefined}
    >
      <span>{label}</span>
      <i className="bnav-pip" aria-hidden="true" />
    </Link>
  )
}

export default SalonNavbar
