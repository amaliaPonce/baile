"use client";

import { useState } from "react";
import styles from "./PabloPortfolio.module.css";

const videos = ["14qc0wdvqZ4t-GgwWlaRguKq2W7gyPzKC","1XKph8lsvp3dW5mAWImmdXv372LGK_NTw","1-QMtnvmO1NQ1oe2TWZ_NL6AR4aFfW2Uw","1eKoN7OoVxykdUPRXgi99wVkRscjJsWqQ","19v4Z__ZQE3S2xTcTWAZr8V9_xLwZLl7H","1VaalPIYesqSHXvHxXaadEm7KjtGT97KI","1twx-chUXdJCEVHXbu_JV-u4XeT0DDh9j","1_8iLVf060PW6QsOXIwWMrsuns-qd9hh6","1_1oUBDfV2fe4Dz8eqaNGjKCWO6UxW-G7","1L2k2wO-j1r2mAGCohEKF_rGv6r5TD1bG","1DIVT-RyAHihS1bm8aA2addoUDIdfYCE4","1SM0k8485UhhreaqCej7h9GrZ1_tBvzTp","1Oh4UeRRyWU_2OXA77s2Pvl7I45B9nSFW"];
const instagram = "https://www.instagram.com/pablocf_dancer/";
const thumb = (id: string, size: number) => `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
const original = (id: string) => `https://drive.google.com/file/d/${id}/view`;

function Photo({ id, label, size = 1200 }: { id: string; label: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.photo}><span className={styles.fallback}>{label}</span>{!failed && (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={thumb(id, size)} alt={label} onError={() => setFailed(true)} />
  )}<a className={styles.mediaLink} href={original(id)} target="_blank" rel="noopener noreferrer">Ver original ↗</a></div>;
}

export default function PabloPortfolio({ bookingHref }: { bookingHref: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected ?? 0;
  return <main className={styles.site} id="inicio">
    <header className={styles.nav}><a href="#inicio" className={styles.brand}>PABLO CF<small>BACHATA · DANCER</small></a><nav aria-label="Navegación principal"><a href="#sobre-mi">Sobre mí</a><a href="#portfolio">Portfolio</a><a href="#clases">Clases</a></nav><a className={styles.button} href={bookingHref}>Reservar ↗</a></header>
    <section className={styles.hero}><div className={styles.heroText}><span className={styles.eyebrow}>Pablo CF / Dancer</span><h1>El arte de<br/><em>conectar.</em></h1><p>Bachata, musicalidad y movimiento. Descubre mi forma de vivir el baile.</p><div className={styles.actions}><a className={styles.button} href="#portfolio">Ver mi baile ▶</a><a className={styles.outline} href={bookingHref}>Reserva tu clase</a></div></div><Photo id="1b5cgc-I-XjFuW4Qas3obif9GyNlq0INw" label="Pablo CF · Fotografía"/></section>
    <div className={styles.ribbon}><span>01 / Bachata</span><span>02 / Conexión</span><span>03 / Musicalidad</span></div>
    <section id="sobre-mi" className={styles.light}><div className={styles.split}><Photo id="1W6d1X13ntyzCKSKBgrzPm6CdUun5xE2Q" label="Pablo CF · Retrato"/><div><span className={styles.eyebrow}>01 / Meet Pablo</span><h2>Mucho más<br/>que <em>pasos.</em></h2><p>La bachata es una forma de escuchar, sentir y conectar. Cada baile es diferente y cada conexión cuenta una historia.</p><p>Descubre mi trabajo y comparte conmigo esta pasión por el baile.</p><a className={styles.textLink} href={instagram} target="_blank" rel="noopener noreferrer">@pablocf_dancer ↗</a></div></div></section>
    <section id="portfolio" className={styles.section}><div className={styles.heading}><div><span className={styles.eyebrow}>02 / Dance portfolio</span><h2>Bachata <em>in motion.</em></h2></div><span className={styles.eyebrow}>13 vídeos / Archivo</span></div><p>Una selección de momentos en movimiento.</p><div className={styles.videoGrid}><div className={styles.player}>{selected === null ? <div><h3>In motion.</h3><button className={styles.button} onClick={() => setSelected(0)}>Reproducir vídeo ▶</button></div> : <iframe key={videos[active]} src={`https://drive.google.com/file/d/${videos[active]}/preview`} title={`Vídeo de baile ${active + 1}`} allow="autoplay; fullscreen" allowFullScreen />}</div><div className={styles.playlist}>{videos.map((id, i) => <button key={id} className={styles.videoItem} aria-pressed={i === active} onClick={() => setSelected(i)}><span className={styles.thumb}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={thumb(id, 240)} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = "none"; }}/><span>▶</span></span><span>Dance film {String(i + 1).padStart(2,"0")}<small>VÍDEO ORIGINAL</small></span></button>)}</div></div><div className={styles.videoMeta}><span>{String(active+1).padStart(2,"0")} / 13</span><a href={original(videos[active])} target="_blank" rel="noopener noreferrer">Abrir vídeo original ↗</a></div><p className={styles.note}>Si el reproductor no carga, abre el vídeo original en Drive.</p></section>
    <section id="clases" className={styles.light}><div className={styles.split}><div><span className={styles.eyebrow}>03 / Learn with me</span><h2>Tu siguiente<br/><em>paso.</em></h2><p>Un espacio para disfrutar de la bachata y desarrollar tu propia forma de bailar.</p><div className={styles.offer}>Clases particulares <span>01</span></div><div className={styles.offer}>Técnica y musicalidad <span>02</span></div><div className={styles.offer}>Conexión en pareja <span>03</span></div></div><div className={styles.booking}><span className={styles.eyebrow}>Reserva tu clase</span><h3>Elige tu próximo horario.</h3><p>Consulta el calendario de disponibilidad y reserva directamente con Pablo.</p><a className={styles.button} href={bookingHref}>Consultar disponibilidad ↗</a><p className={styles.note}>Acceso al sistema de reservas real.</p></div></div></section>
    <section className={styles.contact} id="contacto"><span className={styles.eyebrow}>04 / Let&apos;s connect</span><h2>Nos vemos<br/><em>en la pista.</em></h2><p>Clases particulares y consultas profesionales.</p><a className={styles.button} href={instagram} target="_blank" rel="noopener noreferrer">Contactar por Instagram ↗</a></section>
    <footer className={styles.footer}><span>PABLO CF — DANCER</span><a href="/profesor">Acceso profesor</a><a href="#inicio">Volver arriba ↑</a></footer>
  </main>;
}
