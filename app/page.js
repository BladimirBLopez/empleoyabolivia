"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar, Footer, JobCard, Spinner, ErrorMessage, logoColor, logoLetters } from "@/lib/components";
import { getEmpleos } from "@/lib/supabase";
import HomeCandidato from "@/lib/home-candidato";
import HomeEmpresa from "@/lib/home-empresa";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const MapPinIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const TrendingIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>;
const ClockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Tecnología", icon: "💻", count: 156 },
  { name: "Ventas", icon: "📊", count: 142 },
  { name: "Administración", icon: "📋", count: 98 },
  { name: "Marketing", icon: "📱", count: 76 },
  { name: "Salud", icon: "🏥", count: 54 },
  { name: "Educación", icon: "📚", count: 43 },
  { name: "Ingeniería", icon: "⚙️", count: 89 },
  { name: "Finanzas", icon: "💰", count: 67 },
];

const DEPARTMENTS = ["La Paz","Santa Cruz","Cochabamba","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [ofertas, setOfertas] = useState([]);
  const [loadingOfertas, setLoadingOfertas] = useState(true);
  const [errorOfertas, setErrorOfertas] = useState(false);
  const role = user?.unsafeMetadata?.role || null;

  const cargarOfertas = () => {
    setLoadingOfertas(true);
    setErrorOfertas(false);
    getEmpleos({ limit: 6 })
      .then(r => setOfertas(r.data || []))
      .catch(e => { console.error(e); setErrorOfertas(true); })
      .finally(() => setLoadingOfertas(false));
  };

  useEffect(() => { cargarOfertas(); }, []);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#1a56db", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
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
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* ── DUAL ACCESS HERO ─────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1a56db 100%)", padding: "56px 20px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "20px", padding: "5px 14px", marginBottom: "20px" }}>
            <TrendingIcon />
            <span style={{ color: "#fbbf24", fontSize: "12px", fontWeight: "600" }}>+18.400 ofertas activas · Bolivia</span>
          </div>

          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "white", lineHeight: "1.15", marginBottom: "14px", letterSpacing: "-0.5px" }}>
            El trabajo que buscas<br /><span style={{ color: "#60a5fa" }}>está en Bolivia</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "16px", marginBottom: "40px" }}>
            Conectamos talento boliviano con las mejores empresas del país
          </p>

          {/* DOS ACCESOS - Como InfoJobs */}
          <div className="acceso-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", maxWidth: "600px", margin: "0 auto 36px" }}>
            <button
              onClick={() => handleAcceso("candidato")}
              style={{ background: "white", border: "3px solid transparent", borderRadius: "14px", padding: "24px 16px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#60a5fa"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🙋</div>
              <h3 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a", marginBottom: "4px" }}>Soy candidato</h3>
              <p style={{ color: "#64748b", fontSize: "12px" }}>Busco empleo</p>
            </button>

            <button
              onClick={() => handleAcceso("empresa")}
              style={{ background: "linear-gradient(135deg, #1a56db, #3b82f6)", border: "3px solid transparent", borderRadius: "14px", padding: "24px 16px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,86,219,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏢</div>
              <h3 style={{ fontWeight: "700", fontSize: "16px", color: "white", marginBottom: "4px" }}>Soy empresa</h3>
              <p style={{ color: "#bfdbfe", fontSize: "12px" }}>Busco talento</p>
            </button>
          </div>

          {/* Buscador */}
          <div style={{ background: "white", borderRadius: "14px", padding: "8px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", gap: "8px", maxWidth: "720px", margin: "0 auto", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px", display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ color: "#64748b" }}><SearchIcon /></span>
              <input type="text" placeholder="Puesto, empresa o habilidad" style={{ border: "none", background: "transparent", outline: "none", fontSize: "14px", color: "#0f172a", width: "100%" }}
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()} />
            </div>
            <div style={{ flex: "1 1 150px", display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ color: "#64748b" }}><MapPinIcon /></span>
              <select style={{ border: "none", background: "transparent", outline: "none", fontSize: "14px", color: searchLocation ? "#0f172a" : "#94a3b8", width: "100%", cursor: "pointer" }}
                value={searchLocation} onChange={e => setSearchLocation(e.target.value)}>
                <option value="">Todo Bolivia</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button onClick={handleSearch} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 28px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────────── */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0" }}>
        <div className="stats-row" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
          {[{ num: "18.400+", label: "Ofertas activas" }, { num: "2.400+", label: "Empresas" }, { num: "94.000+", label: "Candidatos" }, { num: "9", label: "Departamentos" }].map((s, i) => (
            <div key={i} style={{ padding: "18px 32px", textAlign: "center", borderRight: i < 3 ? "1px solid #e2e8f0" : "none" }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>{s.num}</p>
              <p style={{ color: "#64748b", fontSize: "12px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── OFERTAS DESTACADAS + SIDEBAR ─────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px" }}>
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px" }}>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "700", fontSize: "19px", color: "#0f172a" }}>Ofertas destacadas</h2>
                <p style={{ color: "#64748b", fontSize: "13px" }}>Actualizadas hoy</p>
              </div>
              <a href="/buscar" style={{ color: "#1a56db", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Ver todas →</a>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {loadingOfertas ? (
                <Spinner />
              ) : errorOfertas ? (
                <ErrorMessage onRetry={cargarOfertas} />
              ) : ofertas.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: "36px", marginBottom: "10px" }}>📋</p>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>Aún no hay ofertas publicadas. ¡Sé el primero en publicar una!</p>
                </div>
              ) : (
                ofertas.map(job => (
                  <JobCard key={job.id} job={job} onClick={() => router.push(`/empleos/${job.id}`)} />
                ))
              )}
            </div>
            <a href="/buscar" style={{ display: "block", textAlign: "center", marginTop: "16px", padding: "13px", background: "white", border: "2px dashed #cbd5e1", borderRadius: "12px", color: "#64748b", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}>
              Ver todas las ofertas →
            </a>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "linear-gradient(135deg, #eff4ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "24px" }}>
              <h3 style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a", marginBottom: "6px" }}>¿Ya tienes cuenta?</h3>
              <p style={{ color: "#475569", fontSize: "13px", marginBottom: "14px" }}>Inicia sesión para postular a ofertas o publicar como empresa</p>
              <button onClick={() => handleAcceso("candidato")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "8px", padding: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer", width: "100%", marginBottom: "8px" }}>
                Acceso candidatos
              </button>
              <button onClick={() => handleAcceso("empresa")} style={{ background: "white", color: "#1a56db", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer", width: "100%" }}>
                Acceso empresas
              </button>
            </div>

            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
              <h3 style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a", marginBottom: "14px" }}>Explorar por sector</h3>
              {CATEGORIES.slice(0, 7).map(cat => (
                <a href={`/buscar?categoria=${cat.name}`} key={cat.name}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#0f172a" }}>
                    <span style={{ fontSize: "15px" }}>{cat.icon}</span> {cat.name}
                  </span>
                  <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "11px", padding: "2px 7px", borderRadius: "10px" }}>{cat.count}</span>
                </a>
              ))}
            </div>

            <div style={{ background: "#0f172a", borderRadius: "14px", padding: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "28px", marginBottom: "8px" }}>🏢</p>
              <h3 style={{ fontWeight: "700", fontSize: "15px", color: "white", marginBottom: "8px" }}>¿Buscas talento?</h3>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px" }}>Publica tu oferta y llega a miles de candidatos bolivianos.</p>
              <button onClick={() => handleAcceso("empresa")} style={{ background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: "8px", padding: "10px", fontWeight: "700", fontSize: "13px", cursor: "pointer", width: "100%" }}>
                Acceso empresas
              </button>
            </div>
          </div>
        </div>

        {/* ── POR QUÉ EMPLEOYABOLIVIA ─────────────────────────────────────── */}
        <div style={{ marginTop: "64px", background: "white", borderRadius: "20px", padding: "48px 40px", border: "1px solid #e2e8f0" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span style={{ background: "#eff4ff", color: "#1a56db", fontSize: "12px", fontWeight: "600", padding: "4px 14px", borderRadius: "20px", display: "inline-block", marginBottom: "12px" }}>POR QUÉ ELEGIRNOS</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "22px", color: "#0f172a", marginBottom: "8px" }}>El portal de empleos más completo de Bolivia</h2>
          </div>
          <div className="benefits-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            {[
              ["🎯", "Ofertas verificadas", "Todas las empresas pasan por un proceso de validación antes de publicar."],
              ["⚡", "Postula en segundos", "Tu perfil queda guardado — postula con un solo toque a cualquier oferta."],
              ["📊", "Sigue tu progreso", "Ve el estado de cada postulación: revisión, entrevista o respuesta final."],
              ["🇧🇴", "100% boliviano", "Hecho para el mercado laboral local, con los 9 departamentos cubiertos."],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>{icon}</div>
                <h3 style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a", marginBottom: "6px" }}>{title}</h3>
                <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.6" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .acceso-grid { grid-template-columns: 1fr 1fr !important; }
          .main-grid { grid-template-columns: 1fr !important; }
          .benefits-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .benefits-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
