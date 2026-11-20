import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Images, X } from 'lucide-react';
import GlassFolder, { type FolderFile } from '@/components/ui/glass-folder-cards';
import { useTheme } from '@/lib/next-themes';
import './salon-gallery.css';

const collections = [
  { label: 'The Hair Edit', caption: 'Cuts, colour & a little confidence.', images: ['haircut.png', 'hair-color.png', 'grooming.png'], names: ['Fresh perspective', 'Colour stories', 'The finishing touch'] },
  { label: 'Beauty Rituals', caption: 'Small details. Beautiful possibilities.', images: ['facial.png', 'nails.png', 'makeup.png'], names: ['A moment to glow', 'At your fingertips', 'Soft glamour'] },
  { label: 'The Blossom Mood', caption: 'A little inspiration for everyone.', images: ['../hero-kids.jpg', '../hero-men.jpg', '../hero-women.jpg'], names: ['Little moments', 'Effortlessly you', 'In full bloom'] },
].map(collection => ({ ...collection, files: collection.images.map((image, index) => ({ name: collection.names[index], meta: 'Style inspiration', image: image.startsWith('../') ? `/images/${image.slice(3)}` : `/images/services/looks/${image}` })) }));

export function SalonGallery() {
  const { resolvedTheme } = useTheme();
  const [active, setActive] = useState<FolderFile | null>(null);
  const [openFolder, setOpenFolder] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const allPhotos = collections.flatMap(collection => collection.files);
  const activeIndex = allPhotos.findIndex(photo => photo.image === active?.image);
  const previewOpen = active !== null;
  const movePhoto = (direction: number) => setActive(allPhotos[(activeIndex + direction + allPhotos.length) % allPhotos.length]);
  const desk = useRef<HTMLDivElement>(null);
  const [folderWidth, setFolderWidth] = useState(240);
  useEffect(() => {
    const el = desk.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const column = el.querySelector<HTMLElement>('.bloom-gallery-collection');
      if (column) setFolderWidth(Math.min(280, Math.max(160, column.clientWidth - 56)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!previewOpen) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const modal = dialog.current; return () => { modal?.close(); document.body.style.overflow = previous; };
  }, [previewOpen]);
  return <section id="gallery" aria-labelledby="gallery-title" className="bloom-gallery">
    <div className="bloom-gallery-heading">
      <div><p className="bloom-gallery-eyebrow">● &nbsp; The inspiration archive</p><h2 id="gallery-title">Good looks.<br /><em>Worth keeping.</em></h2></div>
      <div className="bloom-gallery-intro"><p>A little colour. A fresh perspective. Explore the possibilities inside our curated style folders.</p><span>03 COLLECTIONS &nbsp; ↗ &nbsp; ENDLESS INSPIRATION</span></div>
    </div>
    <div className="bloom-gallery-desk" ref={desk}>
      <div className="bloom-gallery-collections">{collections.map((collection, index) => <div className="bloom-gallery-collection" key={collection.label}>
        <div className="bloom-gallery-index"><span>0{index + 1}</span><span>STYLE NOTES ↗</span></div>
        <GlassFolder label={collection.label} meta="3 looks · Click to explore" image={collection.files[2].image} files={collection.files} art="none" action="none" tone={resolvedTheme} width={folderWidth} appearDelay={index * 140} open={openFolder === index} onOpenChange={open => setOpenFolder(current => open ? index : current === index ? null : current)} onFileSelect={setActive} />
        <p className="bloom-gallery-caption">{collection.caption}</p>
        <div className="bloom-gallery-thumbnails" aria-label={`${collection.label} photos`}>
          {collection.files.map(file => <button type="button" key={file.image} onClick={() => setActive(file)} aria-label={`View ${file.name}`}><img src={file.image} alt={file.name} loading="lazy" /><span>{file.name}</span></button>)}
        </div>
        <button type="button" className="bloom-gallery-view" onClick={() => setActive(collection.files[0])}><Images size={15} aria-hidden="true" /> View photos <ArrowRight size={15} aria-hidden="true" /></button>
      </div>)}</div>
      <div className="bloom-gallery-footnote"><span>HOVER TO PEEK · CLICK TO OPEN · SELECT A LOOK</span><p>Illustrative images for inspiration. Actual salon work coming soon.</p></div>
    </div>
    <dialog ref={dialog} className="bloom-gallery-lightbox" aria-labelledby="gallery-photo-title" onKeyDown={event => { event.stopPropagation(); if (event.key === 'ArrowRight') { event.preventDefault(); movePhoto(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); movePhoto(-1); } }} onClose={() => setActive(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      {active && <div className="bloom-gallery-photo"><button type="button" onClick={() => dialog.current?.close()} aria-label="Close photo"><X size={22} /></button><img src={active.image} alt={`${active.name} — illustrative salon inspiration`} /><div><h3 id="gallery-photo-title">{active.name}</h3><p>Style inspiration · Illustrative image</p><nav className="bloom-gallery-photo-nav" aria-label="Browse gallery photos"><button type="button" onClick={() => movePhoto(-1)} aria-label="Previous photo"><ArrowLeft size={20} /></button><span aria-live="polite">{activeIndex + 1} / {allPhotos.length}</span><button type="button" onClick={() => movePhoto(1)} aria-label="Next photo"><ArrowRight size={20} /></button></nav></div></div>}
    </dialog>
  </section>;
}
