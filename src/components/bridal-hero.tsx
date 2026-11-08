import { useEffect, useRef, useState } from 'react';
import { whatsappEnquiry } from '@/lib/salon-contact';
import './bridal-hero.css';
type Stamp = {x:number;y:number;t:number;lobes:{dx:number;dy:number;r:number}[]};
export function BridalHero(){
 const hero=useRef<HTMLElement>(null),figure=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),cursor=useRef<HTMLDivElement>(null);
 const [coarse,setCoarse]=useState(false),[full,setFull]=useState(false),[failed,setFailed]=useState(false); const fullRef=useRef(false);
 useEffect(()=>{fullRef.current=full},[full]);
 useEffect(()=>{
 const el=hero.current!,box=figure.current!,out=canvas.current!,ctx=out.getContext('2d')!;
 const mask=document.createElement('canvas'),buf=document.createElement('canvas'),m=mask.getContext('2d')!,b=buf.getContext('2d')!;
 const front=new Image(),back=new Image(); let frontReady=false,backReady=false,disposed=false;
 front.onload=()=>{frontReady=true;out.classList.add('ready')};back.onload=()=>{backReady=true};front.onerror=back.onerror=()=>{if(!disposed)setFailed(true)};
 front.src='/images/bridal/before-cutout.png';back.src='/images/bridal/after.png';
 const mq=matchMedia('(hover:none), (pointer:coarse)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');let touch=mq.matches;
 const sync=()=>{touch=mq.matches;setCoarse(touch)};sync();mq.addEventListener('change',sync);
 let W=1,H=1,dpr=1,frame=0,autoT=0,lastMove=performance.now(),stamps:Stamp[]=[];
 let last:{x:number;y:number}|null=null,autoLast:{x:number;y:number}|null=null;
 const resize=()=>{const r=box.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);const width=Math.round(W*dpr),height=Math.round(H*dpr);if(out.width===width&&out.height===height)return;for(const c of [out,mask,buf]){c.width=width;c.height=height}stamps=[];last=null};
 let resizeFrame=0;
 const observer=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(resize)});observer.observe(box);resize();
 const stamp=(x:number,y:number,t:number)=>{const base=Math.max(W,260)*(touch?.15:.12);stamps.push({x,y,t,lobes:Array.from({length:3+Math.floor(Math.random()*3)},()=>{const a=Math.random()*Math.PI*2,d=Math.random()*base*.45;return{dx:Math.cos(a)*d,dy:Math.sin(a)*d,r:base*(.45+Math.random()*.55)}})})};
 const point=(e:PointerEvent)=>{const r=box.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,now=performance.now();if(last){const count=Math.min(40,Math.ceil(Math.hypot(x-last.x,y-last.y)/(Math.max(W,260)*.04)));for(let i=1;i<count;i++)stamp(last.x+(x-last.x)*i/count,last.y+(y-last.y)*i/count,now)}stamp(x,y,now);last={x,y};lastMove=now;cursor.current!.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;cursor.current!.classList.add('on')};
 const leave=()=>{last=null;cursor.current?.classList.remove('on')};el.addEventListener('pointermove',point);el.addEventListener('pointerdown',point);el.addEventListener('pointerleave',leave);
 const cover=(c:CanvasRenderingContext2D,img:HTMLImageElement)=>{const scale=Math.max(out.width/img.naturalWidth,out.height/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;c.drawImage(img,(out.width-w)/2,out.height-h,w,h)};
 const draw=(now:number)=>{
 if(touch&&!reduced.matches&&now-lastMove>2500){autoT+=.016;const x=W*(.5+Math.sin(autoT*1.3)*.28),y=H*(.32+Math.sin(autoT*.9+1)*.22);if(!autoLast||Math.hypot(x-autoLast.x,y-autoLast.y)>W*.02){stamp(x,y,now);autoLast={x,y}}}
 stamps=stamps.filter(s=>now-s.t<1100);m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,mask.width,mask.height);m.setTransform(dpr,0,0,dpr,0,0);m.fillStyle='#000';
 for(const s of stamps){const k=1-(now-s.t)/1100,scale=k<.75?k/.75:1;for(const l of s.lobes){m.beginPath();m.arc(s.x+l.dx*scale,s.y+l.dy*scale,l.r*Math.pow(scale,.8),0,Math.PI*2);m.fill()}}
 ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,out.width,out.height);
 if(fullRef.current&&backReady)cover(ctx,back);else{if(frontReady)cover(ctx,front);if(stamps.length&&backReady){ctx.globalCompositeOperation='destination-out';ctx.drawImage(mask,0,0);ctx.globalCompositeOperation='source-over';b.globalCompositeOperation='source-over';b.clearRect(0,0,buf.width,buf.height);b.drawImage(mask,0,0);b.globalCompositeOperation='source-in';cover(b,back);ctx.drawImage(buf,0,0)}}frame=requestAnimationFrame(draw)};frame=requestAnimationFrame(draw);
 return()=>{disposed=true;cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);observer.disconnect();mq.removeEventListener('change',sync);el.removeEventListener('pointermove',point);el.removeEventListener('pointerdown',point);el.removeEventListener('pointerleave',leave)};
 },[]);
 return <><section id="home" className="bridal-hero" ref={hero} aria-label="Blossom bridal makeover experience">
 <div className="bridal-intro">
   <div className="bridal-eyebrow"><span /> THE BRIDAL EDIT</div>
   <h1>Your day.<br />Your kind of<br /><em>beautiful.</em></h1>
   <p>Still you. Just a little more unforgettable.<br />Bridal artistry, made personal.</p>
   <a href={whatsappEnquiry('Hello Blossom, I would like to enquire about a bridal makeup appointment.')} target="_blank" rel="noreferrer">Plan your bridal look <span aria-hidden="true">↗</span></a>
   <div className="bridal-signature">BLOSSOM FAMILY SALON <span>RAJKOT</span></div>
 </div>
 <div className="bridal-marquees" aria-hidden="true"><div className="bridal-row ghost">{Array.from({length:4},(_,i)=><span key={i}>Your day. Your glow.</span>)}</div><div className="bridal-row solid">{Array.from({length:4},(_,i)=><span key={i}>Made to be unforgettable.</span>)}</div></div>
 <div className="bridal-figure" ref={figure}><img src="/images/bridal/before-cutout.png" alt="Woman before her bridal salon makeover"/><canvas ref={canvas} aria-hidden="true"/></div>
 <p className="bridal-hint"><i/>{failed?'Your bridal moment awaits':coarse?'Drag to reveal your bridal glow':'Move your cursor to reveal the bridal glow'}</p>
 <button className="bridal-toggle" type="button" aria-pressed={full} onClick={()=>setFull(v=>!v)}>{full?'See the before':'Reveal the bridal look'} <span aria-hidden="true">↗</span></button>
 </section><div className="bridal-cursor" ref={cursor}/></>;
}
