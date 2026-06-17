"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

// ─── ICONS (inline SVG para no añadir dependencias) ───────────────────────────
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const TrendingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FEATURED_JOBS = [
  { id: 1, title: "Desarrollador Full Stack", company: "Entel Bolivia", location: "La Paz", salary: "Bs. 8.000 – 12.000", type: "Tiempo completo", posted: "hace 2 horas", logo: "EN", color: "#0066cc", hot: true },
  { id: 2, title: "Analista de Marketing Digital", company: "Tigo Bolivia", location: "Santa Cruz", salary: "Bs. 5.500 – 7.000", type: "Tiempo completo", posted: "hace 5 horas", logo: "TG", color: "#e31f26", hot: true },
  { id: 3, title: "Contador General", company: "Banco Fie", location: "Cochabamba", salary: "Bs. 6.000 – 8.500", type: "Tiempo completo", posted: "hace 1 día", logo: "BF", color: "#1a6b3c", hot: false },
  { id: 4, title: "Ingeniero de Sistemas", company: "YPFB", location: "La Paz", salary: "Bs. 9.000 – 14.000", type: "Tiempo completo", posted: "hace 1 día", logo: "YP", color: "#c8a400", hot: false },
  { id: 5, title: "Jefe de Recursos Humanos", company: "Comibol", location: "Oruro", salary: "Bs. 7.500 – 10.000", type: "Tiempo completo", posted: "hace 2 días", logo: "CM", color: "#7c3aed", hot: false },
  { id: 6, title: "Ejecutivo de Ventas Senior", company: "Grupo Salesland", location: "Santa Cruz", salary: "Bs. 4.500 + comisiones", type: "Tiempo completo", posted: "hace 2 días", logo: "GS", color: "#ea580c", hot: false },
];

const CATEGORIES = [
  { name: "Tecnología", icon: "💻", count: 156, growth: "+24%" },
  { name: "Ventas", icon: "📊", count: 142, growth: "+18%" },
  { name: "Administración", icon: "📋", count: 98, growth: "+12%" },
  { name: "Marketing", icon: "📱", count: 76, growth: "+31%" },
  { name: "Salud", icon: "🏥", count: 54, growth: "+9%" },
  { name: "Educación", icon: "📚", count: 43, growth: "+7%" },
  { name: "Ingeniería", icon: "⚙️", count: 89, growth: "+15%" },
  { name: "Finanzas", icon: "💰", count: 67, growth: "+20%" },
];

const COMPANIES = [
  { name: "Entel Bolivia", sector: "Telecomunicaciones", offers: 45, rating: 4.2, logo: "EN", color: "#0066cc" },
  { name: "Tigo Bolivia", sector: "Telecomunicaciones", offers: 32, rating: 4.0, logo: "TG", color: "#e31f26" },
  { name: "Banco Fie", sector: "Finanzas", offers: 38, rating: 4.4, logo: "BF", color: "#1a6b3c" },
  { name: "YPFB", sector: "Energía", offers: 28, rating: 3.9, logo: "YP", color: "#c8a400" },
  { name: "Grupo Salesland", sector: "Ventas", offers: 106, rating: 3.7, logo: "GS", color: "#ea580c" },
  { name: "Comibol", sector: "Minería", offers: 15, rating: 4.1, logo: "CM", color: "#7c3aed" },
];

const DEPARTMENTS = ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Sucre", "Tarija", "Trinidad", "Cobija"];

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────
function JobCard({ job }) {
  return (
    <div className="job-card group" style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", cursor: "pointer", transition: "all 0.2s ease", position: "relative", overflow: "hidden" }}>
      {/* Hover accent */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "#1a56db", opacity: 0, transition: "opacity 0.2s" }} className="card-accent" />

      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        {/* Logo */}
        <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: job.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
          {job.logo}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
            <h3 style={{ fontWeight: "600", fontSize: "15px", color: "#0f172a", lineHeight: "1.3" }}>{job.title}</h3>
            {job.hot && (
              <span style={{ background: "#fef3c7", color: "#b45309", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", flexShrink: 0, display: "flex", alignItems: "center", gap: "3px" }}>
                <TrendingIcon /> Destacado
              </span>
            )}
          </div>
          <p style={{ color: "#475569", fontSize: "13px", marginBottom: "10px" }}>{job.company}</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
              <MapPinIcon /> {job.location}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
              <BriefcaseIcon /> {job.type}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
              <ClockIcon /> {job.posted}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "600", fontSize: "13px", color: "#059669" }}>{job.salary}</span>
            <span style={{ fontSize: "12px", color: "#1a56db", fontWeight: "500" }}>Ver oferta →</span>
          </div>
        </div>
      </div>

      <style>{`.job-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-1px); border-color: #cbd5e1; } .job-card:hover .card-accent { opacity: 1 !important; }`}</style>
    </div>
  );
}

function CompanyCard({ company }) {
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", cursor: "pointer", transition: "all 0.2s ease", textAlign: "center" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
      <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: company.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "16px", margin: "0 auto 12px" }}>
        {company.logo}
      </div>
      <h3 style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a", marginBottom: "2px" }}>{company.name}</h3>
      <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "8px" }}>{company.sector}</p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "2px", color: "#f59e0b", fontSize: "12px" }}>
          <StarIcon /> {company.rating}
        </span>
        <span style={{ color: "#e2e8f0" }}>•</span>
        <span style={{ fontSize: "12px", color: "#1a56db", fontWeight: "500" }}>{company.offers} ofertas</span>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#1a56db", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOPBAR ──────────────────────────────────────────────────────────── */}
      <div style={{ background: "#0f172a", padding: "6px 0", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "12px" }}>
            🇧🇴 <strong style={{ color: "#e2e8f0" }}>+2.400 empresas</strong> confían en EmpleoYaBolivia
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="#" style={{ color: "#94a3b8", fontSize: "12px", textDecoration: "none" }}>Para Empresas</a>
            <a href="#" style={{ color: "#94a3b8", fontSize: "12px", textDecoration: "none" }}>Ayuda</a>
          </div>
        </div>
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #1a56db, #3b82f6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BriefcaseIcon />
            </div>
            <div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "17px", color: "#0f172a", letterSpacing: "-0.3px" }}>EmpleoYa</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "17px", color: "#1a56db", letterSpacing: "-0.3px" }}>Bolivia</span>
            </div>
          </div>

          {/* Nav links — desktop */}
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }} className="nav-desktop">
            <a href="#" style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.background = "#f1f5f9"; e.target.style.color = "#0f172a"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#475569"; }}>
              Ofertas
            </a>
            <a href="#" style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.background = "#f1f5f9"; e.target.style.color = "#0f172a"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#475569"; }}>
              Empresas
            </a>
            <a href="#" style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.background = "#f1f5f9"; e.target.style.color = "#0f172a"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#475569"; }}>
              Salarios
            </a>
          </div>

          {/* Auth */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {!isSignedIn ? (
              <>
                <button onClick={() => openSignIn()}
                  style={{ background: "transparent", border: "none", color: "#475569", fontSize: "14px", fontWeight: "500", cursor: "pointer", padding: "6px 12px", borderRadius: "6px" }}>
                  Iniciar sesión
                </button>
                <button onClick={() => openSignIn()}
                  style={{ background: "#1a56db", border: "none", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", padding: "8px 18px", borderRadius: "8px", transition: "background 0.15s" }}
                  onMouseEnter={e => e.target.style.background = "#0f3d9e"}
                  onMouseLeave={e => e.target.style.background = "#1a56db"}>
                  Publicar oferta
                </button>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button style={{ background: "transparent", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: "#64748b" }}>
                  <BellIcon />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "4px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Avatar" style={{ width: "28px", height: "28px", borderRadius: "50%" }} />
                  ) : (
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1a56db", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UserIcon />
                    </div>
                  )}
                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#0f172a" }}>{user?.firstName || "Mi cuenta"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1a56db 100%)", padding: "64px 20px 80px", position: "relative", overflow: "hidden" }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "20px", padding: "5px 14px", marginBottom: "24px" }}>
            <TrendingIcon />
            <span style={{ color: "#fbbf24", fontSize: "12px", fontWeight: "600" }}>+18.400 ofertas activas esta semana</span>
          </div>

          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "white", lineHeight: "1.15", marginBottom: "16px", letterSpacing: "-0.5px" }}>
            El trabajo que buscas<br />
            <span style={{ color: "#60a5fa" }}>está en Bolivia</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "17px", marginBottom: "36px", maxWidth: "560px", margin: "0 auto 36px" }}>
            Conectamos talento boliviano con las mejores empresas del país. Miles de oportunidades laborales, todas verificadas.
          </p>

          {/* Search box */}
          <div style={{ background: "white", borderRadius: "14px", padding: "8px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", gap: "8px", maxWidth: "760px", margin: "0 auto", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px", display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ color: "#64748b" }}><SearchIcon /></span>
              <input
                type="text"
                placeholder="Puesto, empresa o habilidad"
                style={{ border: "none", background: "transparent", outline: "none", fontSize: "14px", color: "#0f172a", width: "100%" }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ flex: "1 1 160px", display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ color: "#64748b" }}><MapPinIcon /></span>
              <select
                style={{ border: "none", background: "transparent", outline: "none", fontSize: "14px", color: searchLocation ? "#0f172a" : "#94a3b8", width: "100%", cursor: "pointer" }}
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
              >
                <option value="">Todo Bolivia</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <button
              style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 28px", fontWeight: "700", fontSize: "15px", cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.15s" }}
              onMouseEnter={e => e.target.style.background = "#0f3d9e"}
              onMouseLeave={e => e.target.style.background = "#1a56db"}
            >
              Buscar empleo
            </button>
          </div>

          {/* Quick filters */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
            {["Desarrollador", "Contador", "Ventas", "Marketing", "Ingeniería"].map(tag => (
              <button key={tag}
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#cbd5e1", fontSize: "12px", padding: "5px 14px", borderRadius: "20px", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.15)"; e.target.style.color = "white"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.08)"; e.target.style.color = "#cbd5e1"; }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────────── */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "center", gap: "0", flexWrap: "wrap" }}>
          {[
            { num: "18.400+", label: "Ofertas activas" },
            { num: "2.400+", label: "Empresas registradas" },
            { num: "94.000+", label: "Candidatos" },
            { num: "9", label: "Departamentos" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "18px 36px", textAlign: "center", borderRight: i < 3 ? "1px solid #e2e8f0" : "none" }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "22px", color: "#0f172a", letterSpacing: "-0.5px" }}>{s.num}</p>
              <p style={{ color: "#64748b", fontSize: "12px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px" }}>

        {/* JOBS + SIDEBAR LAYOUT */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>

          {/* Left: Jobs */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "700", fontSize: "20px", color: "#0f172a" }}>Ofertas destacadas</h2>
                <p style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>Actualizadas hoy · ordenadas por relevancia</p>
              </div>
              <a href="#" style={{ color: "#1a56db", fontSize: "13px", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                Ver todas <ChevronRightIcon />
              </a>
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {["Todos", "Tiempo completo", "Medio tiempo", "Remoto", "Prácticas"].map((f, i) => (
                <button key={f}
                  style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "500", cursor: "pointer", border: i === 0 ? "none" : "1px solid #e2e8f0", background: i === 0 ? "#1a56db" : "white", color: i === 0 ? "white" : "#475569", transition: "all 0.15s" }}
                  onMouseEnter={e => { if (i !== 0) { e.target.style.borderColor = "#1a56db"; e.target.style.color = "#1a56db"; } }}
                  onMouseLeave={e => { if (i !== 0) { e.target.style.borderColor = "#e2e8f0"; e.target.style.color = "#475569"; } }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {FEATURED_JOBS.map(job => <JobCard key={job.id} job={job} />)}
            </div>

            <button style={{ width: "100%", marginTop: "20px", padding: "14px", background: "white", border: "2px dashed #cbd5e1", borderRadius: "12px", color: "#64748b", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.borderColor = "#1a56db"; e.target.style.color = "#1a56db"; e.target.style.background = "#eff4ff"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#cbd5e1"; e.target.style.color = "#64748b"; e.target.style.background = "white"; }}>
              Cargar más ofertas →
            </button>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Alerta de empleo */}
            <div style={{ background: "linear-gradient(135deg, #eff4ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "24px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", background: "#1a56db", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BellIcon />
                </div>
                <div>
                  <h3 style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a", marginBottom: "6px" }}>Crea tu alerta de empleo</h3>
                  <p style={{ color: "#475569", fontSize: "13px", marginBottom: "14px" }}>Recibe en tu correo las ofertas que se ajusten a tu perfil.</p>
                  <button
                    onClick={() => openSignIn()}
                    style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", fontSize: "13px", cursor: "pointer", width: "100%", transition: "background 0.15s" }}
                    onMouseEnter={e => e.target.style.background = "#0f3d9e"}
                    onMouseLeave={e => e.target.style.background = "#1a56db"}
                  >
                    Activar alertas
                  </button>
                </div>
              </div>
            </div>

            {/* Explorar por categoría */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
              <h3 style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a", marginBottom: "14px" }}>Explorar por sector</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {CATEGORIES.slice(0, 6).map(cat => (
                  <div key={cat.name}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#0f172a" }}>
                      <span style={{ fontSize: "16px" }}>{cat.icon}</span> {cat.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "11px", padding: "2px 8px", borderRadius: "10px" }}>{cat.count}</span>
                      <span style={{ fontSize: "11px", color: "#059669", fontWeight: "600" }}>{cat.growth}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Publicar empleo CTA */}
            <div style={{ background: "#0f172a", borderRadius: "14px", padding: "24px", textAlign: "center" }}>
              <BuildingIcon />
              <h3 style={{ fontWeight: "700", fontSize: "15px", color: "white", margin: "10px 0 8px" }}>¿Buscas talento?</h3>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px" }}>Publica tu oferta y llega a miles de candidatos calificados en Bolivia.</p>
              <button style={{ background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "700", fontSize: "13px", cursor: "pointer", width: "100%" }}>
                Publicar oferta gratis
              </button>
            </div>
          </div>
        </div>

        {/* ── COMPANIES ──────────────────────────────────────────────────────── */}
        <div style={{ marginTop: "64px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "700", fontSize: "20px", color: "#0f172a" }}>Empresas que contratan ahora</h2>
              <p style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>Las mejores compañías de Bolivia buscan candidatos</p>
            </div>
            <a href="#" style={{ color: "#1a56db", fontSize: "13px", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              Ver directorio <ChevronRightIcon />
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "14px" }}>
            {COMPANIES.map(company => <CompanyCard key={company.name} company={company} />)}
          </div>
        </div>

        {/* ── CATEGORIES GRID ─────────────────────────────────────────────── */}
        <div style={{ marginTop: "64px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "700", fontSize: "20px", color: "#0f172a" }}>Explorar por categoría</h2>
            <a href="#" style={{ color: "#1a56db", fontSize: "13px", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              Ver todas <ChevronRightIcon />
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
            {CATEGORIES.map(cat => (
              <div key={cat.name}
                style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a56db"; e.currentTarget.style.background = "#eff4ff"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(26,86,219,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <span style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}>{cat.icon}</span>
                <h4 style={{ fontWeight: "600", fontSize: "13px", color: "#0f172a", marginBottom: "4px" }}>{cat.name}</h4>
                <p style={{ fontSize: "11px", color: "#64748b" }}>{cat.count} ofertas</p>
                <p style={{ fontSize: "11px", color: "#059669", fontWeight: "600", marginTop: "2px" }}>{cat.growth}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <div style={{ marginTop: "64px", background: "white", borderRadius: "20px", padding: "48px 40px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "22px", color: "#0f172a", textAlign: "center", marginBottom: "8px" }}>
            Encuentra trabajo en 3 pasos
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", marginBottom: "40px" }}>Simple, rápido y sin complicaciones</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px" }}>
            {[
              { step: "01", title: "Crea tu perfil", desc: "Regístrate gratis y completa tu CV en minutos. Destaca tus habilidades y experiencia.", icon: "👤" },
              { step: "02", title: "Explora ofertas", desc: "Busca entre miles de empleos verificados. Filtra por sector, ciudad o tipo de contrato.", icon: "🔍" },
              { step: "03", title: "Postula y conecta", desc: "Aplica con un clic y sigue el estado de tu candidatura en tiempo real.", icon: "🚀" },
            ].map(s => (
              <div key={s.step} style={{ textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", background: "#eff4ff", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px" }}>
                  {s.icon}
                </div>
                <div style={{ display: "inline-block", background: "#1a56db", color: "white", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", marginBottom: "10px" }}>PASO {s.step}</div>
                <h3 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a", marginBottom: "8px" }}>{s.title}</h3>
                <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.6" }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "36px" }}>
            <button onClick={() => openSignIn()}
              style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "14px 36px", fontWeight: "700", fontSize: "15px", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => e.target.style.background = "#0f3d9e"}
              onMouseLeave={e => e.target.style.background = "#1a56db"}
            >
              Empezar ahora — es gratis
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#0f172a", color: "white", padding: "48px 20px 24px", marginTop: "64px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #1a56db, #3b82f6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BriefcaseIcon />
                </div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "16px" }}>EmpleoYaBolivia</span>
              </div>
              <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.7", maxWidth: "280px" }}>
                El portal de empleos más completo de Bolivia. Conectamos talento con oportunidades reales en todo el país.
              </p>
            </div>
            {[
              { title: "Para candidatos", links: ["Buscar empleo", "Crear CV", "Alertas de empleo", "Empresas"] },
              { title: "Para empresas", links: ["Publicar oferta", "Base de CVs", "Planes y precios", "Contacto"] },
              { title: "EmpleoYa", links: ["Sobre nosotros", "Blog", "Privacidad", "Términos"] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontWeight: "600", fontSize: "13px", color: "#e2e8f0", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{col.title}</h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {col.links.map(l => (
                    <li key={l}><a href="#" style={{ color: "#64748b", fontSize: "13px", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => e.target.style.color = "#94a3b8"}
                      onMouseLeave={e => e.target.style.color = "#64748b"}>{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ color: "#475569", fontSize: "12px" }}>© 2026 EmpleoYaBolivia · Todos los derechos reservados 🇧🇴</p>
            <p style={{ color: "#334155", fontSize: "12px" }}>Hecho con ❤️ en Bolivia para Bolivia</p>
          </div>
        </div>
      </footer>

      {/* ── RESPONSIVE ──────────────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
        }
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
          [style*="grid-template-columns: 2fr 1fr 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          [style*="grid-template-columns: 2fr 1fr 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
