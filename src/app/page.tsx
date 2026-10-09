"use client";

import { useEffect, useRef } from "react";
import "./hero.css";

const SHOTS = [
  { v: "pay", url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110422_0fc34393-7417-41b0-a200-43fd2b08a37f.png" },
  { v: "launch", url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110423_ba46182e-43bc-43a8-9007-a8234acf442d.png" },
  { v: "shop", url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110423_06cfbb84-6f96-48f6-be45-e03516510e48.png" },
  { v: "brand", url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110422_634bf390-f171-4f5d-9151-0d2c86c26e7b.png" },
  { v: "frete", url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110423_0cfe058d-db0e-4ee6-9708-7a297cc11a7a.png" },
  { v: "plain", t: "STUDIO GRADE", url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110422_a90a35d7-ae20-4ce3-86d7-e3f6f658a6bc.png" },
  { v: "power", url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110422_de267714-7647-4d9a-a0a9-55325683b2a2.png" },
  { v: "plain", t: "JUST ARRIVED", url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110504_80eda275-e380-4ccb-b51f-332f25337079.png" },
  { v: "off", url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110422_d6ba08f5-4ff8-4f09-8abe-93ee6bb0e34e.png" },
  { v: "plain", t: "WIRELESS", url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110423_87ec2115-3157-47ef-ac98-973f8ad6532d.png" },
];

export default function PricoraHero() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  // Element Refs for Type Fitter
  const h1aRef = useRef<HTMLDivElement>(null);
  const h1bRef = useRef<HTMLDivElement>(null);
  const sub1Ref = useRef<HTMLDivElement>(null);
  const sub2Ref = useRef<HTMLDivElement>(null);
  const badgeTxtRef = useRef<HTMLElement>(null);
  const wmNameRef = useRef<HTMLDivElement>(null);
  const ctaLabelRef = useRef<HTMLSpanElement>(null);
  const vpLabelRef = useRef<HTMLSpanElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate Stars
    if (starsRef.current) {
      let stA = [], stB = [];
      for (let i=0; i<150; i++) stA.push(`${Math.random()*100}vw ${Math.random()*100}vh 0px 0 rgba(255,255,255,${0.05 + Math.random()*0.25})`);
      for (let i=0; i<18; i++) stB.push(`${Math.random()*100}vw ${Math.random()*100}vh 1.2px 0 rgba(255,255,255,${0.35 + Math.random()*0.35})`);
      starsRef.current.style.boxShadow = [...stA, ...stB].join(',');
    }

    // Type Fitter & Responsive Layout Logic
    let k = 1;
    let isMobile = false;

    const measureCap = (el: HTMLElement) => {
      const cvs = document.createElement('canvas');
      const ctx = cvs.getContext('2d');
      if (!ctx) return 0.7;
      const st = window.getComputedStyle(el);
      ctx.font = `${st.fontWeight} 100px ${st.fontFamily}`;
      const m = ctx.measureText('H');
      return (m.actualBoundingBoxAscent || 70) / 100;
    };

    const baseline = (el: HTMLElement, y: number, sz: number) => {
      const cvs = document.createElement('canvas');
      const ctx = cvs.getContext('2d');
      if (!ctx) return;
      const st = window.getComputedStyle(el);
      ctx.font = `${st.fontWeight} ${sz}px ${st.fontFamily}`;
      const m = ctx.measureText('H');
      const A = m.actualBoundingBoxAscent || sz * 0.8;
      const D = m.actualBoundingBoxDescent || sz * 0.2;
      el.style.top = `${y - ((sz - (A + D)) / 2 + A)}px`;
    };

    const layout = () => {
      if (!canvasRef.current) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const TAB_MAX = 1080;
      const TAB_MIN = 701;
      const DW_MIN = 920;
      
      isMobile = vw <= 700;

      if (isMobile) {
        k = 1;
        canvasRef.current.style.removeProperty('--k');
        canvasRef.current.style.removeProperty('--fill');
        return; // Native CSS handles mobile
      }

      let W = 1172;
      let T = 1;

      if (vw <= TAB_MAX && vw > 700) {
        W = DW_MIN + (vw - TAB_MIN) * (1172 - DW_MIN) / (TAB_MAX - TAB_MIN);
        if (vh > vw * 1.15) W = Math.min(W, 900);
        const ramp = Math.min(1, (TAB_MAX - vw) / 120);
        T = 1 + 0.14 * ramp;
        
        k = Math.min(vw / W, vh / 560);
        let fill = Math.max(0, vh / k - 657);
        if (fill > 0) {
          const ss = Math.min(fill * 0.55, 420) * ramp;
          const rs = 1 + Math.min(fill / 1100, 0.75) * ramp;
          const slack = 219.5 - 125 * rs + ss;
          const st = Math.max(0, slack / 2 - 28) * ramp;
          fill -= ss;
          
          canvasRef.current.style.setProperty('--stshift', `${st}px`);
          canvasRef.current.style.setProperty('--sshift', `${ss}px`);
          canvasRef.current.style.setProperty('--rs', `${rs}`);
        } else {
          canvasRef.current.style.setProperty('--stshift', '0px');
          canvasRef.current.style.setProperty('--sshift', '0px');
          canvasRef.current.style.setProperty('--rs', '1');
        }
        canvasRef.current.style.setProperty('--fill', `${fill}px`);
      } else {
        k = Math.min(vw / W, vh / 560);
        canvasRef.current.style.setProperty('--fill', '0px');
        canvasRef.current.style.setProperty('--stshift', '0px');
        canvasRef.current.style.setProperty('--sshift', '0px');
        canvasRef.current.style.setProperty('--rs', '1');
      }

      canvasRef.current.style.setProperty('--k', `${k}`);

      // Apply type fitter rules
      const fitBox = (el: HTMLElement | null, tw: number, tc: number, pre = '') => {
        if (!el) return;
        const capR = measureCap(el);
        const sz = tc / capR;
        el.style.fontSize = `${sz}px`;
        const inkW = el.getBoundingClientRect().width / k;
        el.style.transform = `${pre} scaleX(${tw / inkW})`;
        return sz;
      };

      const sz1 = fitBox(h1aRef.current, 563.5 * T, 37.2 * T, 'translateX(-50%)');
      if (sz1 && h1aRef.current) baseline(h1aRef.current, 204.5, sz1);
      
      const sz2 = fitBox(h1bRef.current, 197.5 * T, 37.2 * T, 'translateX(-50%)');
      if (sz2 && h1bRef.current) baseline(h1bRef.current, 258.5, sz2);
      
      const sz3 = fitBox(sub1Ref.current, 389 * T, 8.4 * T, 'translateX(-50%)');
      if (sz3 && sub1Ref.current) baseline(sub1Ref.current, 300.5, sz3);
      
      const sz4 = fitBox(sub2Ref.current, 311 * T, 8.4 * T, 'translateX(-50%)');
      if (sz4 && sub2Ref.current) baseline(sub2Ref.current, 316.5, sz4);
      
      fitBox(badgeTxtRef.current, 184 * T, 9.4 * T, 'translate(2px,-1px)');
      
      const szWm = fitBox(wmNameRef.current, 51 * T, 11.4 * T);
      if (szWm && wmNameRef.current) baseline(wmNameRef.current, 38.5, szWm);
      
      fitBox(ctaLabelRef.current, 87 * T, 8.9 * T);
      fitBox(vpLabelRef.current, 76 * T, 9.5 * T);
    };

    window.addEventListener('resize', layout);
    document.fonts.ready.then(layout);
    setTimeout(layout, 400);

    // Master Entrance Timeline
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mql.matches && typeof Element !== 'undefined' && 'animate' in Element.prototype) {
      const EXPO = 'cubic-bezier(.16,1,.3,1)';
      const SOFT = 'cubic-bezier(.22,.61,.36,1)';
      let promises: Promise<any>[] = [];

      const play = (el: string, translate: number, dur: number, delay: number, ease: string, xtra: any = {}) => {
        document.querySelectorAll(el).forEach(node => {
          const kf = { opacity: [0, 1], ...xtra };
          if (translate) {
            const D = window.innerWidth <= 700 ? 0.66 : 1;
            kf.translate = [`0 ${translate * D}px`, '0 0px'];
          }
          const a = node.animate(kf, { duration: dur, delay, easing: ease, fill: 'both' });
          promises.push(a.finished);
        });
      };

      play('.nav', -9, 620, 60, EXPO);
      play('.mark', 6, 520, 150, SOFT);
      play('.wm', 6, 520, 185, SOFT);
      document.querySelectorAll('.links a').forEach((node, i) => {
        const a = node.animate({ opacity: [0, 1], translate: [`0 ${6 * (window.innerWidth <= 700 ? 0.66 : 1)}px`, '0 0'] }, { duration: 460, delay: 215 + i * 45, easing: SOFT, fill: 'both' });
        promises.push(a.finished);
      });
      play('.burger', 6, 460, 300, SOFT);
      play('.nav .btn', 6, 500, 400, SOFT);
      play('.badge', 11, 560, 270, EXPO, { scale: [0.985, 1] });
      play('#h1a', 15, 900, 380, EXPO, { clipPath: ['inset(100% 0 -30% 0)', 'inset(-30% 0 -30% 0)'] });
      play('#h1b', 15, 900, 470, EXPO, { clipPath: ['inset(100% 0 -30% 0)', 'inset(-30% 0 -30% 0)'] });
      play('#sub1', 10, 620, 690, EXPO);
      play('#sub2', 10, 620, 745, EXPO);
      play('.cta2', 13, 620, 830, EXPO, { scale: [0.985, 1] });
      play('.ring', 18, 950, 700, EXPO, { scale: [0.99, 1] });
      play('.browser', 26, 900, 900, EXPO);
      play('.wa', 0, 500, 1260, EXPO, { scale: [0.88, 1] });

      Promise.all(promises).then(() => {
        document.getAnimations().forEach(a => a.cancel());
        document.documentElement.classList.remove('intro');
      }).catch(() => document.documentElement.classList.remove('intro'));
    }

    // 3D Carousel Loop
    let phase = -2;
    let last = performance.now();
    let frame: number;

    const tick = (t: number) => {
      if (!ringRef.current) return;
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      if (!mql.matches) phase -= 1.9 * dt;

      const cards = ringRef.current.children;
      for (let i = 0; i < 37; i++) {
        const card = cards[i] as HTMLElement;
        const a = (((i * 9.7297 + phase) % 360) + 540) % 360 - 180;
        if (Math.abs(a) > 42) {
          card.style.visibility = 'hidden';
          continue;
        }
        card.style.visibility = 'visible';
        const r = a * Math.PI / 180;
        const c = Math.cos(r);
        card.style.transform = `translate3d(${891 * Math.sin(r)}px, 0, ${891 * (1 - c)}px) rotateY(${-a}deg)`;
        card.style.filter = `brightness(${0.84 + 0.5 * (1 / c - 1)})`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    const handleVis = () => { if (!document.hidden) last = performance.now(); };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      window.removeEventListener('resize', layout);
      document.removeEventListener('visibilitychange', handleVis);
      cancelAnimationFrame(frame);
    };
  }, []);

  const renderCard = (i: number) => {
    const d = SHOTS[i % 10];
    const im = `<img alt="" src="${d.url}">`;
    let inner = "";

    switch (d.v) {
      case 'pay':
        inner = `
          <div class="fill" style="background:#efedea"></div>
          <div class="ph" style="top:112px;bottom:0">${im}</div>
          <svg class="ph" style="top:118px;bottom:0" viewBox="0 0 130 182" preserveAspectRatio="none">
            <g stroke="#e5202f" stroke-width="8" fill="none" opacity=".92" stroke-linecap="square">
              <path d="M2 42h30M14 30v96M4 100l26-16"/>
              <path d="M96 34v58M120 34v58M96 92q12 15 24 0"/>
              <path d="M92 108l14 34M126 108l-12 34"/>
            </g>
          </svg>
          <div class="cv" style="top:20px;text-align:right;font-size:3.4px;letter-spacing:.15em;color:#8d9298">METHOD OF CHECKOUTS</div>
          <div class="cv t-big" style="top:32px;font-size:14px;color:#16171b">Checkouts</div>
          <div class="cv t-big" style="top:47px;font-size:14px;color:#e5202f">Quick n simple</div>
          <div class="cv" style="top:76px;font-size:5.2px;font-weight:700;color:#16171b;line-height:1.7">
            <div><b class="dot"></b>SPEND VIA <b>ACH</b></div>
            <div style="margin-top:8px"><b class="dot sq"></b>OR AT MAX <b>12X</b><br>
            <span style="margin-left:11px">ON CREDIT</span></div>
          </div>
        `;
        break;
      case 'launch':
        inner = `
          <div class="fill" style="background:linear-gradient(168deg,#f9d9e5,#f3bdd2 55%,#e8a3c0)"></div>
          <div class="ph" style="top:100px;bottom:0">${im}<div class="fill" style="background:linear-gradient(180deg,rgba(249,217,229,.97),rgba(249,217,229,0) 30%)"></div></div>
          <div class="cv t-serif" style="top:36px;font-size:17px;color:#b03a63">COLLECTION</div>
          <div class="cv t-serif" style="top:55px;font-size:17px;color:#b03a63">EXCLUSIVE!</div>
        `;
        break;
      case 'shop':
        inner = `
          <div class="fill" style="background:#fff"></div>
          <div class="ph" style="top:0;height:148px">${im}</div>
          <div class="cv" style="top:158px;font-size:5.4px;font-weight:700;letter-spacing:.09em;color:#16171b">AUDIO AT DAWNS</div>
          <div class="cv" style="top:168px;font-size:4.2px;color:#7b8087">Bass · Treble · Clarity</div>
          <div style="position:absolute;left:10px;top:180px;padding:4px 11px;border-radius:20px;background:#16171b;font-size:4.6px;font-weight:600;color:#fff;letter-spacing:.05em">Acquire today</div>
        `;
        break;
      case 'brand':
        inner = `
          <div class="fill" style="background:linear-gradient(180deg,#0a2a4a,#0d3a63 50%,#08192b)"></div>
          <div class="ph" style="top:92px;bottom:0">${im}<div class="fill" style="background:linear-gradient(180deg,rgba(10,42,74,.98),rgba(10,42,74,0) 36%)"></div></div>
          <div class="cv" style="top:16px;font-size:4.2px;line-height:1.7;color:rgba(255,255,255,.82);width:74px">Soundscapes light, assessed perfectly n designed with a new ritual.</div>
          <div style="position:absolute;right:10px;top:16px;font-size:5.4px;font-weight:600;color:#fff;opacity:.92">✳ Pricora</div>
        `;
        break;
      case 'frete':
        inner = `
          <div class="fill" style="background:linear-gradient(158deg,#4a0c80 0%,#7a16a6 40%,#a81fc6 66%,#5c0e90 100%)"></div>
          <div class="ph" style="top:140px;bottom:0;opacity:.45;mix-blend-mode:screen">${im}</div>
          <div class="fill" style="background:radial-gradient(44% 16% at 50% 62%, rgba(255,255,255,.92), rgba(255,255,255,0) 72%)"></div>
          <div style="position:absolute;left:-6px;right:-6px;top:44px;height:13px;background:#ff2d8a;transform:rotate(-2.6deg);box-shadow:0 4px 12px rgba(255,45,138,.5)"></div>
          <div style="position:absolute;left:0;right:0;top:45.5px;transform:rotate(-2.6deg);text-align:center;font-size:5.6px;font-weight:700;letter-spacing:.05em;color:#fff">OBTAIN AT HOME AND</div>
          <div class="cv t-big" style="top:64px;font-size:24px;color:#fff;text-shadow:0 3px 0 rgba(84,9,124,.6)">Ships</div>
          <div class="cv t-big" style="top:87px;font-size:24px;color:#fff;text-shadow:0 3px 0 rgba(84,9,124,.6)">Gratis</div>
          <div class="cv t-big" style="top:113px;font-size:19px;color:#fff">+</div>
        `;
        break;
      case 'power':
        inner = `
          <div class="ph phf">${im}</div>
          <div class="fill" style="background:linear-gradient(180deg,rgba(6,5,10,0) 34%,rgba(6,5,10,.55) 52%,rgba(6,5,10,.92) 72%)"></div>
          <div class="cv t-serif" style="top:132px;font-size:16px;color:#fff">A POWER</div>
          <div class="cv t-serif" style="top:150px;font-size:16px;color:#fff">BASSLINE</div>
          <div class="cv" style="top:171px;font-size:4.4px;letter-spacing:.07em;color:rgba(255,255,255,.85)">is echoing in all we acquire</div>
        `;
        break;
      case 'off':
        inner = `
          <div class="ph phf">${im}</div>
          <div class="fill" style="background:linear-gradient(180deg,rgba(3,9,20,0) 30%,rgba(3,9,20,.6) 48%,rgba(3,9,20,.95) 70%)"></div>
          <div class="cv t-big" style="top:126px;font-size:10px;color:#fff;opacity:.9">On sale · til</div>
          <div class="cv t-big" style="top:139px;font-size:22px;color:#3fe3ff;text-shadow:0 0 16px rgba(63,227,255,.5)">50% off</div>
        `;
        break;
      case 'plain':
        inner = `
          <div class="ph phf">${im}</div>
          <div class="fill" style="background:linear-gradient(180deg,rgba(4,8,16,0) 38%,rgba(4,8,16,.85) 68%)"></div>
          <div class="cv" style="top:150px;font-size:5.4px;font-weight:600;letter-spacing:.2em;color:#fff">${d.t}</div>
        `;
        break;
    }

    return (
      <div key={i} className="card" dangerouslySetInnerHTML={{ __html: inner + '<div class="edge"></div>' }} />
    );
  };

  return (
    <div className="stage bg">
      <div className="stars" ref={starsRef}></div>
      <div className="canvas" ref={canvasRef}>
        
        {/* NAV */}
        <div className="nav">
          <svg className="mark" viewBox="0 0 48 48">
            <defs>
              <linearGradient id="sw" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8ef4ff"/>
                <stop offset="50%" stopColor="#35d8ff"/>
                <stop offset="100%" stopColor="#0a86d8"/>
              </linearGradient>
              <linearGradient id="sw2" x1="40" y1="10" x2="10" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a6f7ff" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#0f9ae0" stopOpacity="0.25"/>
              </linearGradient>
            </defs>
            <g transform="rotate(-32 24 24)">
              <ellipse cx="24" cy="24" rx="18.5" ry="9.6" stroke="url(#sw2)" strokeWidth="3.1" strokeLinecap="round" strokeDasharray="58 30" strokeDashoffset="14" fill="none"/>
              <circle cx="41.4" cy="20.6" r="3.1" fill="#bff6ff"/>
            </g>
            <circle cx="24" cy="24" r="6.6" fill="url(#sw)"/>
            <circle cx="24" cy="24" r="2.6" fill="#fff"/>
          </svg>
          <div className="wm">
            <div className="kick">AUDIO</div>
            <div className="name" ref={wmNameRef}>PRICORA</div>
          </div>
          <div className="links" ref={linksRef}>
            <a href="#">Origin</a>
            <a href="#">Learn how</a>
            <a href="#">Core Audio</a>
            <a href="#">Prices</a>
            <a href="#">Support</a>
          </div>
          <a className="btn" href="#"><span ref={ctaLabelRef}>Build new setup</span></a>
          <button type="button" className="burger" aria-label="Opens menu" aria-expanded="false" aria-controls="navmenu">
            <span></span><span></span><span></span>
          </button>
          <div className="navmenu" id="navmenu"></div>
        </div>

        {/* STACK (Text & Badges) */}
        <div className="stack">
          <div className="badge">
            <i>
              <svg viewBox="5 1 14 22" preserveAspectRatio="none" fill="rgba(16,112,152,.72)" stroke="rgba(190,236,255,.6)" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M13.9 1.6 5.5 13.6a.7.7 0 0 0 .6 1.1h4.2l-1 7.7a.7.7 0 0 0 1.25.55l8.3-12.1a.7.7 0 0 0-.6-1.1h-4.2l1-7.7a.7.7 0 0 0-1.25-.55Z"/>
              </svg>
            </i>
            <b ref={badgeTxtRef}>Professionals at audio tracking</b>
          </div>
          
          <div className="h1" id="h1a" ref={h1aRef}>Streamline the audio</div>
          <div className="h1" id="h1b" ref={h1bRef}>Process</div>
          
          <div className="sub" id="sub1" ref={sub1Ref}><b>Restructuring sound systems / <span className="nb">E-commerce</span></b> orchestrated with</div>
          <div className="sub" id="sub2" ref={sub2Ref}>checkouts, performance, a sustainable expansion.</div>
          
          <a className="btn cta2" href="#"><span ref={vpLabelRef}>See prices</span></a>
        </div>

        {/* SHOWCASE & RING */}
        <div className="showcase">
          <div className="ring" ref={ringRef}>
            {Array.from({ length: 37 }).map((_, i) => renderCard(i))}
          </div>
        </div>

        {/* BROWSER MOCK */}
        <div className="browser">
          <div className="bar">
            <div className="dots"><i></i><i></i><i></i></div>
            <div className="omni">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/></svg>
              <span>Shop Focused - Audio Gear</span>
            </div>
            <div className="tools">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 16V4m0 0L8 8m4-4 4 4M4 15v5h16v-5"/></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff"><path d="M12 3 3 8l9 5 9-5-9-5Z" fill="#fff" opacity=".95"/><path d="M3 13l9 5 9-5" opacity=".55" strokeWidth="2"/></svg>
            </div>
          </div>
          <div className="page">
            <div className="ann">
              <u>&#8249;</u><span>Moisturized daily at home</span><u style={{right: '20px', left: 'auto'}}>&#8250;</u>
            </div>
            <div className="shoplogo">
              <em>GLOW</em><i>SKIN CARE</i>
            </div>
            <div className="shopicons">
              <svg viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4.5 21c0-4.2 3.4-6.6 7.5-6.6s7.5 2.4 7.5 6.6"/></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><path d="M5.5 8h13l-1.2 12H6.7L5.5 8Z"/><path d="M9 8V6.2A3 3 0 0 1 15 6.2V8"/></svg>
            </div>
            <div className="pagebody">
              <div className="pghero">
                <img alt="Warm amber" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110504_0316394c-37bd-432b-a1f2-ee46a461c22b.png" />
                <div className="scrim"></div>
                <div className="copy">
                  <u>Just added</u>
                  <em>Let your beauty<br/>be sacred.</em>
                  <i>EXPLORE TODAY</i>
                </div>
              </div>
              <div className="pgsec">
                <b>Best reviewed</b><u>see more</u>
              </div>
              <div className="pggrid">
                <div className="pgcard">
                  <div className="ph"><img alt="" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110423_3b5dcf24-cc07-4f3b-8423-b597fffcdbfb.png"/><div className="tag">-24%</div></div>
                  <b>Serum Radiance C</b><i>Brightens · 30ml</i><s>$ 129.90 <span>$ 169.90</span></s>
                </div>
                <div className="pgcard">
                  <div className="ph"><img alt="" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110504_50ec81be-8341-447f-a0c2-a5673a465447.png"/></div>
                  <b>Nourishing Lotion</b><i>Arid skin · 50g</i><s>$ 89.90</s>
                </div>
                <div className="pgcard">
                  <div className="ph"><img alt="" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110504_fd208d72-9112-4cde-b509-8d273b470c6f.png"/><div className="tag">SET</div></div>
                  <b>Kit Sunset Renewal</b><i>3 products</i><s>$ 219.90 <span>$ 289.90</span></s>
                </div>
                <div className="pgcard">
                  <div className="ph"><img alt="" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_110504_9731544c-a83b-48c4-bacb-e31e4d4b9f42.png"/><div className="tag">JUST</div></div>
                  <b>Defender SPF 60</b><i>Light feel · 40g</i><s>$ 74.90</s>
                </div>
              </div>
              <div className="pgstrip">
                <span>Ships gratis north of $ 199</span><span>Pay 12x nil rates</span><span>Swaps in 30 days</span><span>Hypoallergenically checked</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="wa" aria-label="WhatsApp">
        <svg viewBox="0 0 32 32" fill="#fff"><path d="M16 2a13 13 0 0 0-11 20L3 29l7-2a13 13 0 1 0 6-25zm0 24a11 11 0 0 1-5.6-1.5l-3.8 1 1-3.6A11 11 0 1 1 16 26zm6-8c-.3-.2-1.9-1-2.2-1s-.6-.2-.8.1l-1 1.2c-.2.2-.4.3-.7.1s-1.4-.5-2.6-1.6c-1-.9-1.6-2-1.8-2.3s0-.5.2-.6c.2-.2.3-.4.5-.6s.3-.4.4-.6c.1-.2 0-.5 0-.7s-.7-1.7-1-2.3c-.3-.6-.5-.5-.8-.5h-.6c-.2 0-.7.1-1 .4s-1.2 1.2-1.2 2.9c0 1.7 1.3 3.3 1.4 3.5s2.4 3.7 5.8 5.1c3.4 1.5 3.4 1 4 1s2-1 2.3-2 .2-1.6.1-1.8c-.2-.2-.4-.3-.7-.4z"/></svg>
      </div>
    </div>
  );
}
