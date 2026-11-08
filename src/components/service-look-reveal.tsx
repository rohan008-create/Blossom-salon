import { useEffect, useRef, useState } from 'react';
import './service-look-reveal.css';

export function ServiceLookReveal({ id, title, alt }: { id: string; title: string; alt: string }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fullRef = useRef(false);
  const repaint = useRef<() => void>(() => {});
  const [full, setFull] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = `/images/services/looks/${id}.png`;

  useEffect(() => { fullRef.current = full; repaint.current(); }, [full]);
  useEffect(() => {
    const target = root.current!, output = canvas.current!, ctx = output.getContext('2d');
    if (!ctx) return;
    const card = target.closest('article') ?? target;
    const image = new Image();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let loaded = false, disposed = false, frame = 0, resizeFrame = 0;
    let wanted = 0, progress = 0, previousTime = 0;
    const drawPhoto = (after: boolean) => {
      const half = image.naturalWidth / 2, h = image.naturalHeight;
      const scale = Math.max(output.width / half, output.height / h);
      ctx.drawImage(image, after ? half : 0, 0, half, h, (output.width - half * scale) / 2, (output.height - h * scale) / 2, half * scale, h * scale);
    };
    const render = (time: number) => {
      frame = 0;
      if (!loaded || disposed) return;
      const destination = fullRef.current ? 1 : wanted;
      const dt = previousTime ? Math.min(time - previousTime, 50) : 16;
      previousTime = time;
      progress = reduced.matches ? destination : progress + (destination - progress) * (1 - Math.exp(-dt / 155));
      if (Math.abs(progress - destination) < .002) progress = destination;
      ctx.clearRect(0, 0, output.width, output.height); drawPhoto(false);
      if (progress > 0) {
        // A single diagonal curtain reveals the entire finished look.
        const edge = (output.width + output.height) * progress;
        ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(edge, 0); ctx.lineTo(0, edge); ctx.closePath(); ctx.clip(); drawPhoto(true); ctx.restore();
        if (progress < .99 && !reduced.matches) {
          ctx.save(); ctx.beginPath(); ctx.moveTo(edge, 0); ctx.lineTo(0, edge);
          ctx.strokeStyle = 'rgba(255, 245, 230, .35)'; ctx.lineWidth = output.width * .025; ctx.stroke(); ctx.restore();
        }
      }
      target.style.setProperty('--reveal-position', `${progress * 100}%`);
      target.classList.toggle('is-revealed', progress > .55);
      if (progress !== destination) frame = requestAnimationFrame(render);
    };
    const schedule = () => { if (!frame && loaded) { previousTime = 0; frame = requestAnimationFrame(render); } };
    repaint.current = () => { if (!fullRef.current) wanted = 0; schedule(); };
    const resize = () => {
      const bounds = target.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width * dpr)), height = Math.max(1, Math.round(bounds.height * dpr));
      if (output.width !== width || output.height !== height) { output.width = width; output.height = height; }
      schedule();
    };
    const observer = new ResizeObserver(() => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(resize); });
    observer.observe(target); resize();
    image.onload = () => { if (!disposed) { loaded = true; setReady(true); resize(); } };
    image.onerror = () => { if (!disposed) setFailed(true); };
    image.src = src;
    const enter = (event: PointerEvent) => { if (event.pointerType !== 'touch') { wanted = 1; schedule(); } };
    const leave = (event: PointerEvent) => { if (event.pointerType !== 'touch') { wanted = 0; schedule(); } };
    const focus = () => { wanted = 1; schedule(); };
    const blur = (event: FocusEvent) => { if (!card.contains(event.relatedTarget as Node | null)) { wanted = 0; schedule(); } };
    card.addEventListener('pointerenter', enter as EventListener);
    card.addEventListener('pointerleave', leave as EventListener);
    card.addEventListener('focusin', focus); card.addEventListener('focusout', blur as EventListener);
    return () => {
      disposed = true; cancelAnimationFrame(frame); cancelAnimationFrame(resizeFrame); observer.disconnect(); repaint.current = () => {};
      card.removeEventListener('pointerenter', enter as EventListener); card.removeEventListener('pointerleave', leave as EventListener);
      card.removeEventListener('focusin', focus); card.removeEventListener('focusout', blur as EventListener);
    };
  }, [src]);

  return <div ref={root} className={`service-look-reveal${ready ? ' is-ready' : ''}${full ? ' is-full' : ''}`} role="group" aria-label={`${title} makeover reveal`} onClick={event => {
    if (!(event.target as HTMLElement).closest('button') && !failed) setFull(value => !value);
  }}>
    <img className="service-look-fallback" src={src} alt={alt} loading="lazy" decoding="async" />
    <canvas ref={canvas} aria-hidden="true" />
    <span className="service-look-state" aria-hidden="true"><span className="service-label-idle">THE EVERYDAY</span><span className="service-label-active">THE NEW LOOK</span></span>
    <button className="service-look-cue" type="button" disabled={failed} aria-label={`${full ? 'Show before' : 'Reveal after'}: ${title}`} aria-pressed={full} onClick={() => setFull(value => !value)}>{full ? 'Back to original' : 'Reveal the makeover'} <span aria-hidden="true">↗</span></button>
  </div>;
}
