"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar, Footer, JobCard, logoColor, logoLetters } from "@/lib/components";
import HomeCandidato from "@/lib/home-candidato";
import HomeEmpresa from "@/lib/home-empresa";

// ─── TOKENS ─────────────────────────────────────────────────────────────────
// Paleta editorial propia del proyecto — no el azul corporativo genérico.
// Base oscura casi negra, verde profundo para empresa/trabajo, terracota
// cálido como acento de marca, crema para contraste tipográfico.
const INK = "#0B0F0E";       // negro-verde, fondo del hero
const FOREST = "#1C2620";    // verde oscuro, superficies sobre INK
const BONE = "#EFE8DA";      // hueso, texto principal sobre fondo oscuro
const CLAY = "#D97D45";      // terracota, acento de marca / candidato
const SAGE = "#7C9885";      // verde sage, acento empresa
const PAPER = "#F6F2EA";     // crema claro, fondo general de la página

const FONT_DISPLAY = "'Fraunces', serif";
const FONT_BODY = "'Inter', sans-serif";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const MapPinIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const ArrowIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FEATURED_JOBS = [
  { id: 1, titulo: "Desarrollador Full Stack", empresa: "Entel Bolivia", ciudad: "La Paz", salario: "Bs. 8.000 – 12.000", tipo_contrato: "Tiempo completo", created_at: new Date(Date.now()-7200000).toISOString(), destacado: true },
  { id: 2, titulo: "Analista de Marketing Digital", empresa: "Tigo Bolivia", ciudad: "Santa Cruz", salario: "Bs. 5.500 – 7.000", tipo_contrato: "Tiempo completo", created_at: new Date(Date.now()-18000000).toISOString(), destacado: true },
  { id: 3, titulo: "Contador General", empresa: "Banco Fie", ciudad: "Cochabamba", salario: "Bs. 6.000 – 8.500", tipo_contrato: "Tiempo completo", created_at: new Date(Date.now()-86400000).toISOString(), destacado: false },
  { id: 4, titulo: "Ingeniero de Sistemas", empresa: "YPFB", ciudad: "La Paz", salario: "Bs. 9.000 – 14.000", tipo_contrato: "Tiempo completo", created_at: new Date(Date.now()-86400000).toISOString(), destacado: false },
];

const DEPARTMENTS = ["La Paz","Santa Cruz","Cochabamba","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"];

const CATEGORIES = [
  { name: "Tecnología", count: 156 }, { name: "Ventas", count: 142 },
  { name: "Administración", count: 98 }, { name: "Marketing", count: 76 },
  { name: "Salud", count: 54 }, { name: "Ingeniería", count: 89 },
];

// Las dos historias paralelas que la portada cuenta — una por audiencia.
// El número no es decorativo: es el dato real que cada lado necesita ver
// primero para decidir si sigue leyendo.
const STORIES = {
  candidato: {
    eyebrow: "Para quien busca",
    kicker: "18.400 ofertas activas",
    headline: "Tu próximo trabajo está en Bolivia",
    body: "Miles de empresas bolivianas publican ofertas reales todos los días. Crea tu perfil una vez y postula con un toque.",
    cta: "Buscar empleo",
    accent: CLAY,
  },
  empresa: {
    eyebrow: "Para quien contrata",
    kicker: "2.400 empresas activas",
    headline: "El talento boliviano te está esperando",
    body: "Publica tu oferta en minutos y llega a candidatos verificados en los 9 departamentos del país.",
    cta: "Publicar oferta",
    accent: SAGE,
  },
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const role = user?.unsafeMetadata?.role || null;

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: PAPER }}>
        <div style={{ width: "36px", height: "36px", border: `3px solid #e5ddc8`, borderTopColor: CLAY, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isSignedIn && role === "candidato") return <HomeCandidato />;
  if (isSignedIn && role === "empresa") return <HomeEmpresa />;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (searchLocation) params.set("ciudad", searchLocation);
    router.push(`/buscar?${params.toString()}`);
  };

  const handleAcceso = (tipo) => {
    router.push(tipo === "empresa" ? "/empresa-login" : "/candidato-login");
  };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: FONT_BODY }}>
      <Navbar />

      {/* ═══ HERO: portada dividida, dos historias en paralelo ═══════════════ */}
      <section style={{ background: INK, position: "relative", overflow: "hidden" }}>
        {/* Línea vertical de eje — la portada tiene un pliegue, no dos cajas */}
        <div className="fold-line" style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: "1px", background: "rgba(239,232,218,0.12)" }} />

        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 24px" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "560px" }}>

            {/* Columna candidato */}
            <div style={{ padding: "64px 48px 56px 0", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "none" }}>
              <Story data={STORIES.candidato} onClick={() => handleAcceso("candidato")} align="left" />
            </div>

            {/* Columna empresa */}
            <div style={{ padding: "64px 0 56px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Story data={STORIES.empresa} onClick={() => handleAcceso("empresa")} align="left" />
            </div>
          </div>

          {/* Buscador — vive en el pliegue, sirve a ambos lados */}
          <div className="search-bridge" style={{ position: "relative", marginTop: "-28px", marginBottom: "0", zIndex: 5, display: "flex", justifyContent: "center" }}>
            <div style={{ background: BONE, borderRadius: "999px", padding: "6px", boxShadow: "0 24px 48px -12px rgba(0,0,0,0.5)", display: "flex", gap: "4px", width: "100%", maxWidth: "640px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px", display: "flex", alignItems: "center", gap: "10px", padding: "11px 18px" }}>
                <span style={{ color: "#8a8275" }}><SearchIcon /></span>
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Puesto, empresa o habilidad"
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: "14px", color: INK, width: "100%", fontFamily: FONT_BODY }}
                />
              </div>
              <div style={{ width: "1px", background: "rgba(11,15,14,0.12)", margin: "8px 0" }} />
              <div style={{ flex: "0 1 150px", display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px" }}>
                <span style={{ color: "#8a8275" }}><MapPinIcon /></span>
                <select
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: searchLocation ? INK : "#8a8275", width: "100%", cursor: "pointer", fontFamily: FONT_BODY }}
                >
                  <option value="">Bolivia</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <button onClick={handleSearch} style={{ background: INK, color: BONE, border: "none", borderRadius: "999px", padding: "12px 26px", fontWeight: "600", fontSize: "13px", cursor: "pointer", flexShrink: 0 }}>
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OFERTAS DESTACADAS ════════════════════════════════════════════ */}
      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "96px 24px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: "600", fontSize: "28px", color: INK, letterSpacing: "-0.5px" }}>
            Publicado esta semana
          </h2>
          <a href="/buscar" style={{ color: CLAY, fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
            Ver todas <ArrowIcon />
          </a>
        </div>

        <div className="jobs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "#e5ddc8", border: "1px solid #e5ddc8" }}>
          {FEATURED_JOBS.map(job => (
            <div key={job.id} onClick={() => router.push(`/empleos/${job.id}`)} style={{ background: PAPER, padding: "28px", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "white"}
              onMouseLeave={e => e.currentTarget.style.background = PAPER}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: logoColor(job.empresa), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "12px" }}>
                  {logoLetters(job.empresa)}
                </div>
                {job.destacado && <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px", color: CLAY, textTransform: "uppercase" }}>Destacada</span>}
              </div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: "600", fontSize: "19px", color: INK, marginBottom: "4px" }}>{job.titulo}</h3>
              <p style={{ color: "#6b6457", fontSize: "13px", marginBottom: "16px" }}>{job.empresa} · {job.ciudad}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid #e5ddc8" }}>
                <span style={{ fontWeight: "600", fontSize: "13px", color: "#3d6b52" }}>{job.salario}</span>
                <span style={{ fontSize: "12px", color: "#8a8275" }}>{job.tipo_contrato}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CATEGORÍAS — lista editorial, no tarjetas ════════════════════ */}
      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 24px 96px" }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: "600", fontSize: "28px", color: INK, marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Sectores con más movimiento
        </h2>
        <p style={{ color: "#6b6457", fontSize: "14px", marginBottom: "36px" }}>Donde se concentran las ofertas activas en este momento</p>

        <div>
          {CATEGORIES.map((cat, i) => (
            <a key={cat.name} href={`/buscar?categoria=${cat.name}`}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 4px", borderTop: i === 0 ? "1px solid #e5ddc8" : "none", borderBottom: "1px solid #e5ddc8", textDecoration: "none", transition: "padding-left 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.paddingLeft = "14px"}
              onMouseLeave={e => e.currentTarget.style.paddingLeft = "4px"}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: "20px", color: INK, fontWeight: "500" }}>{cat.name}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "13px", color: "#8a8275" }}>{cat.count} ofertas</span>
                <ArrowIcon />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ═══ CIERRE — vuelve a las dos historias, en forma de invitación ══ */}
      <section style={{ background: FOREST, padding: "80px 24px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: FONT_DISPLAY, fontStyle: "italic", fontSize: "15px", color: "rgba(239,232,218,0.6)", marginBottom: "16px" }}>
            Hecho en Bolivia, para Bolivia
          </p>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: "600", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: BONE, lineHeight: "1.3", marginBottom: "36px" }}>
            Cualquiera sea tu lado de la mesa, el siguiente paso toma un minuto.
          </h2>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => handleAcceso("candidato")} style={{ background: CLAY, color: INK, border: "none", borderRadius: "999px", padding: "13px 28px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
              Busco empleo
            </button>
            <button onClick={() => handleAcceso("empresa")} style={{ background: "transparent", color: BONE, border: `1px solid rgba(239,232,218,0.3)`, borderRadius: "999px", padding: "13px 28px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
              Busco talento
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap');

        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; min-height: auto !important; }
          .fold-line { display: none; }
          .hero-grid > div { padding: 40px 0 32px 0 !important; border: none !important; }
          .jobs-grid { grid-template-columns: 1fr !important; }
          .search-bridge { margin-top: 24px !important; padding: 0 8px; }
        }
      `}</style>
    </div>
  );
}

// ─── Story: una columna de la portada (candidato o empresa) ──────────────────
function Story({ data, onClick }) {
  return (
    <div>
      <p style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", color: data.accent, marginBottom: "18px" }}>
        {data.eyebrow}
      </p>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: "600", fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)", color: "#EFE8DA", lineHeight: "1.08", letterSpacing: "-0.5px", marginBottom: "18px" }}>
        {data.headline}
      </h1>
      <p style={{ color: "rgba(239,232,218,0.65)", fontSize: "15px", lineHeight: "1.6", marginBottom: "28px", maxWidth: "360px" }}>
        {data.body}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <button onClick={onClick} style={{ background: data.accent, color: "#0B0F0E", border: "none", borderRadius: "999px", padding: "12px 24px", fontWeight: "700", fontSize: "13.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          {data.cta} <span style={{ fontSize: "11px" }}>→</span>
        </button>
        <span style={{ fontSize: "13px", color: "rgba(239,232,218,0.45)" }}>{data.kicker}</span>
      </div>
    </div>
  );
}
