"use client";

import { useState } from "react";
import styles from "./PabloPortfolio.module.css";

const videos = ["14qc0wdvqZ4t-GgwWlaRguKq2W7gyPzKC","1XKph8lsvp3dW5mAWImmdXv372LGK_NTw","1-QMtnvmO1NQ1oe2TWZ_NL6AR4aFfW2Uw","1eKoN7OoVxykdUPRXgi99wVkRscjJsWqQ","19v4Z__ZQE3S2xTcTWAZr8V9_xLwZLl7H","1VaalPIYesqSHXvHxXaadEm7KjtGT97KI","1twx-chUXdJCEVHXbu_JV-u4XeT0DDh9j","1_8iLVf060PW6QsOXIwWMrsuns-qd9hh6","1_1oUBDfV2fe4Dz8eqaNGjKCWO6UxW-G7","1L2k2wO-j1r2mAGCohEKF_rGv6r5TD1bG","1DIVT-RyAHihS1bm8aA2addoUDIdfYCE4","1SM0k8485UhhreaqCej7h9GrZ1_tBvzTp","1Oh4UeRRyWU_2OXA77s2Pvl7I45B9nSFW"];
const instagram = "https://www.instagram.com/pablocf_dancer/";
const thumb = (id: string, size: number) => `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;

function Instagram({ className }: { className?: string }) {
  return <a className={className} href={instagram} target="_blank" rel="noopener noreferrer"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg><span>@pablocf_dancer</span><span aria-hidden="true">↗</span></a>;
}

function Media({ id, eager = false }: { id: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <span className={styles.media} aria-hidden="true">{!failed && (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={thumb(id, eager ? 1600 : 640)} alt="" loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)}/>
  )}</span>;
}

function InlinePlayer({ index, onClose }: { index: number; onClose: () => void }) {
  return <div className={styles.inlinePlayer}>
    <iframe title={`Vídeo de baile ${index+1}`} src={`https://drive.google.com/file/d/${videos[index]}/preview`} allow="autoplay; fullscreen" allowFullScreen />
    <button type="button" className={styles.stopVideo} onClick={onClose} aria-label="Cerrar vídeo y volver a la portada">×</button>
  </div>;
}

function Clip({ index, large = false, active, onPlay, onClose }: { index: number; large?: boolean; active: boolean; onPlay: () => void; onClose: () => void }) {
  return <div className={large ? styles.featureClip : styles.clip}>
    {active ? <InlinePlayer index={index} onClose={onClose}/> : <button type="button" className={styles.clipButton} onClick={onPlay} aria-label={`Reproducir vídeo ${index+1}`}>
      <Media id={videos[index]} />
      <span className={styles.clipIndex}>{String(index+1).padStart(2,"0")}</span>
      <span className={styles.play} aria-hidden="true">▶</span>
    </button>}
  </div>;
}

export default function PabloPortfolio({ bookingHref }: { bookingHref: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const close = () => setSelected(null);
  const renderClip = (index: number, large = false) => <Clip key={index} index={index} large={large} active={selected === `clip-${index}`} onPlay={() => setSelected(`clip-${index}`)} onClose={close}/>;
  return <main className={styles.site} id="inicio">
    <header className={styles.nav}>
      <a href="#inicio" className={styles.brand}>PC<span>F.</span></a>
      <nav aria-label="Navegación principal"><a href="#sobre-mi">Pablo</a><a href="#videos">Vídeos</a><a href="#clases">Clases</a></nav>
      <Instagram className={styles.navSocial}/>
      <a className={styles.navBook} href={bookingHref}>Reserva <span>↗</span></a>
    </header>
    <section className={styles.hero}>
      <div className={styles.heroImage}><Media id={videos[1]} eager/><div className={styles.heroShade}/></div>
      <div className={styles.heroBody}>
        <span className={styles.kicker}><span/> BACHATA / BAILE / CLASES</span>
        <h1>PABLO<br/><span>CABEZUELO.</span></h1>
        <div className={styles.heroBottom}><p>Nos vemos en la pista.</p><button className={styles.watch} onClick={() => setSelected("hero")}><span>▶</span> Ver vídeo</button></div>
      </div>
      {selected === "hero" && <div className={styles.heroPlayback}><InlinePlayer index={1} onClose={close}/></div>}
      <div className={styles.heroFoot}><Instagram className={styles.social}/><a href="#videos">Explorar vídeos ↓</a></div>
    </section>
    <section className={styles.intro} id="sobre-mi">
      <div className={styles.introText}><span className={styles.kicker}>PABLO CF</span><h2>Hola,<br/>soy Pablo<span>.</span></h2><p>Bailarín y profesor. Aquí puedes ver mi trabajo, encontrarme en redes y reservar una clase particular de baile conmigo.</p><Instagram className={styles.social}/></div>
      <div className={styles.portrait}><Media id="1b5cgc-I-XjFuW4Qas3obif9GyNlq0INw"/><span>PCF / DANCER</span></div>
    </section>
    <section className={styles.feature} id="videos">
      <div className={styles.sectionHead}><div><span className={styles.kicker}>VÍDEOS</span><h2>En la pista<span>.</span></h2></div><p>El baile se entiende mejor viéndolo.</p></div>
      <div className={styles.featureGrid}>{renderClip(0,true)}<div className={styles.featureStack}>{renderClip(2,true)}{renderClip(3,true)}</div></div>
      <div className={styles.filmCaption}><span>Una mirada a mi baile.</span><Instagram className={styles.social}/></div>
    </section>
    <section className={styles.feed} id="redes">
      <div className={styles.feedHeading}><span className={styles.kicker}>INSTAGRAM</span><h2>Fuera de aquí,<br/>también bailamos<span>.</span></h2><p>Más vídeos y novedades en mi perfil.</p><Instagram className={styles.follow}/></div>
      <div className={styles.reels}>{(expanded ? [4,5,6,7,8,9,10,11,12] : [4,5,6,7,8,9]).map(i => renderClip(i))}</div>
      <div className={styles.feedFoot}><button className={styles.textButton} onClick={() => { if (expanded && ["clip-10","clip-11","clip-12"].includes(selected ?? "")) close(); setExpanded(v => !v); }}>{expanded ? "Ver menos vídeos −" : "Ver todos los vídeos +"}</button><a href={instagram} target="_blank" rel="noopener noreferrer">Ir a Instagram ↗</a></div>
    </section>
    <section className={styles.classes} id="clases">
      <div className={styles.classPhoto}>{selected === "classes" ? <InlinePlayer index={10} onClose={close}/> : <><Media id={videos[10]}/><button type="button" onClick={() => setSelected("classes")} className={styles.watch}><span>▶</span> Ver vídeo</button></>}</div>
      <div className={styles.classText}><span className={styles.kicker}>CLASES PARTICULARES</span><h2>¿Bailamos<span>?</span></h2><p>Si quieres aprender bachata o seguir mejorando, puedes consultar mis horarios y reservar una clase particular directamente desde aquí.</p><a className={styles.book} href={bookingHref}>Consultar horarios <span>↗</span></a><a className={styles.textButton} href={instagram} target="_blank" rel="noopener noreferrer">¿Tienes dudas? Escríbeme por Instagram ↗</a></div>
    </section>
    <footer className={styles.footer}><div><span className={styles.kicker}>CONTACTO</span><h2>Pablo CF<span>.</span></h2><Instagram className={styles.social}/></div><div className={styles.footerLinks}><a href={bookingHref}>Clases particulares ↗</a><a href={instagram} target="_blank" rel="noopener noreferrer">Colaboraciones / Instagram ↗</a><a href="/profesor">Acceso profesor</a><a href="#inicio">Volver arriba ↑</a></div></footer>
  </main>;
}
