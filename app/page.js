"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar, Footer, JobCard, Spinner, logoColor, logoLetters } from "@/lib/components";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const MapPinIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const TrendingIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>;
const StarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>;
const ClockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FEATURED_JOBS = [
  { id: 1, titulo: "Desarrollador Full Stack", empresa: "Entel Bolivia", ciudad: "La Paz", salario: "Bs. 8.000 – 12.000", tipo_contrato: "Tiempo completo", created_at: new Date(Date.now()-7200000).toISOString(), destacado: true },
  { id: 2, titulo: "Analista de Marketing Digital", empresa: "Tigo Bolivia", ciudad: "Santa Cruz", salario: "Bs. 5.500 – 7.000", tipo_contrato: "Tiempo completo", created_at: new Date(Date.now()-18000000).toISOString(), destacado: true },
  { id: 3, titulo: "Contador General", empresa: "Banco Fie", ciudad: "Cochabamba", salario: "Bs. 6.000 – 8.500", tipo_contrato: "Tiempo completo", created_at: new Date(Date.now()-86400000).toISOString(), destacado: false },
  { id: 4, titulo: "Ingeniero de Sistemas", empresa: "YPFB", ciudad: "La Paz", salario: "Bs. 9.000 – 14.000", tipo_contrato: "Tiempo completo", created_at: new Date(Date.now()-86400000).toISOString(), destacado: false },
  { id: 5, titulo: "Jefe de Recursos Humanos", empresa: "Comibol", ciudad: "Oruro", salario: "Bs. 7.500 – 10.000", tipo_contrato: "Tiempo completo", created_at: new Date(Date.now()-172800000).toISOString(), destacado: false },
  { id: 6, titulo: "Ejecutivo de Ventas Senior", empresa: "Grupo Salesland", ciudad: "Santa Cruz", salario: "Bs. 4.500 + comisiones", tipo_contrato: "Tiempo completo", created_at: new Date(Date.now()-172800000).toISOString(), destacado: false },
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

const DEPARTMENTS = ["La Paz","Santa Cruz","Cochabamba","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"];

const BENEFITS_EMPRESA = [
  { icon: "🎯", title: "Candidatos verificados", desc: "Accede a miles de perfiles de profesionales bolivianos activos en búsqueda de empleo." },
  { icon: "⚡", title: "Publicación inmediata", desc: "Tu oferta aparece en el portal en minutos, con filtros de categoría, ciudad y tipo de contrato." },
  { icon: "📊", title: "Gestión sencilla", desc: "Revisa postulaciones, cambia estados y comunícate con candidatos desde un panel intuitivo." },
  { icon: "🇧🇴", title: "Alcance nacional", desc: "Llega a candidatos en los 9 departamentos de Bolivia. El portal más completo del país." },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const role = user?.unsafeMetadata?.role || null;

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#1a56db", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (searchLocation) params.set("ciudad", searchLocation);
    router.push(`/buscar?${params.toString()}`);
  };

  const handleAcceso = (tipo) => {
    if (!isSignedIn) { openSignIn(); return; }
    if (!role) { router.push("/elegir-rol"); return; }
    router.push(tipo === "empresa" ? "/empresa" : "/dashboard");
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", maxWidth: "600px", margin: "0 auto 36px" }}>
            <button
              onClick={() => handleAcceso("candidato")}
              style={{ background: "white", border: "3px solid transparent", borderRadius: "14px", padding: "24px 16px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#60a5fa"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🙋</div>
              <h3 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a", marginBottom: "4px" }}>Soy candidato</h3>
              <p style={{ color: "#64748b", fontSize: "12px" }}>Busco empleo</p>
              {role === "candidato" && <span style={{ display: "inline-block", marginTop: "8px", background: "#ecfdf5", color: "#059669", fontSize: "11px", fontWeight: "600", padding: "2px 10px", borderRadius: "20px" }}>Tu acceso ✓</span>}
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
              {role === "empresa" && <span style={{ display: "inline-block", marginTop: "8px", background: "rgba(255,255,255,0.2)", color: "white", fontSize: "11px", fontWeight: "600", padding: "2px 10px", borderRadius: "20px" }}>Tu acceso ✓</span>}
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
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
          {[{ num: "18.400+", label: "Ofertas activas" }, { num: "2.400+", label: "Empresas" }, { num: "94.000+", label: "Candidatos" }, { num: "9", label: "Departamentos" }].map((s, i) => (
            <div key={i} style={{ padding: "18px 32px", textAlign: "center", borderRight: i < 3 ? "1px solid #e2e8f0" : "none" }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>{s.num}</p>
              <p style={{ color: "#64748b", fontSize: "12px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENIDO SEGÚN ROL ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px" }}>

        {/* Si es empresa logueada → CTA directa a su panel */}
        {role === "empresa" && (
          <div style={{ background: "linear-gradient(135deg, #1a56db, #3b82f6)", borderRadius: "16px", padding: "32px 36px", marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ color: "white", fontWeight: "700", fontSize: "20px", marginBottom: "6px" }}>Hola, {user?.firstName || "empresa"} 👋</h2>
              <p style={{ color: "#bfdbfe", fontSize: "14px" }}>Gestiona tus ofertas y revisa las postulaciones recibidas</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => router.push("/publicar")} style={{ background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: "8px", padding: "10px 22px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
                + Publicar oferta
              </button>
              <button onClick={() => router.push("/empresa")} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "10px 22px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
                Mis ofertas
              </button>
            </div>
          </div>
        )}

        {/* Si es candidato logueado → CTA a su dashboard */}
        {role === "candidato" && (
          <div style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "1px solid #a7f3d0", borderRadius: "16px", padding: "24px 32px", marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ color: "#065f46", fontWeight: "700", fontSize: "18px", marginBottom: "4px" }}>Hola, {user?.firstName || "candidato"} 👋</h2>
              <p style={{ color: "#047857", fontSize: "13px" }}>Revisa el estado de tus postulaciones o actualiza tu perfil</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => router.push("/dashboard")} style={{ background: "#059669", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                Mis postulaciones
              </button>
              <button onClick={() => router.push("/perfil")} style={{ background: "white", color: "#065f46", border: "1px solid #a7f3d0", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                Mi perfil / CV
              </button>
            </div>
          </div>
        )}

        {/* OFERTAS + SIDEBAR */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "700", fontSize: "19px", color: "#0f172a" }}>Ofertas destacadas</h2>
                <p style={{ color: "#64748b", fontSize: "13px" }}>Actualizadas hoy</p>
              </div>
              <a href="/buscar" style={{ color: "#1a56db", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Ver todas →</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {FEATURED_JOBS.map(job => (
                <JobCard key={job.id} job={job} onClick={() => router.push(`/empleos/${job.id}`)} />
              ))}
            </div>
            <a href="/buscar" style={{ display: "block", textAlign: "center", marginTop: "16px", padding: "13px", background: "white", border: "2px dashed #cbd5e1", borderRadius: "12px", color: "#64748b", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}>
              Ver todas las ofertas →
            </a>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {!isSignedIn ? (
              <div style={{ background: "linear-gradient(135deg, #eff4ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "24px" }}>
                <h3 style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a", marginBottom: "6px" }}>¿Ya tienes cuenta?</h3>
                <p style={{ color: "#475569", fontSize: "13px", marginBottom: "14px" }}>Inicia sesión para postular a ofertas o publicar como empresa</p>
                <button onClick={() => openSignIn()} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "8px", padding: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer", width: "100%", marginBottom: "8px" }}>
                  Iniciar sesión
                </button>
                <button onClick={() => openSignIn()} style={{ background: "white", color: "#1a56db", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer", width: "100%" }}>
                  Registrarme gratis
                </button>
              </div>
            ) : !role ? (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "14px", padding: "24px" }}>
                <h3 style={{ fontWeight: "700", fontSize: "15px", color: "#92400e", marginBottom: "6px" }}>⚠️ Falta un paso</h3>
                <p style={{ color: "#78350f", fontSize: "13px", marginBottom: "14px" }}>Elige si buscas empleo o quieres contratar para ver tu panel.</p>
                <button onClick={() => router.push("/elegir-rol")} style={{ background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: "8px", padding: "10px", fontWeight: "700", fontSize: "13px", cursor: "pointer", width: "100%" }}>
                  Completar registro
                </button>
              </div>
            ) : null}

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
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "11px", padding: "2px 7px", borderRadius: "10px" }}>{cat.count}</span>
                    <span style={{ fontSize: "11px", color: "#059669", fontWeight: "600" }}>{cat.growth}</span>
                  </div>
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

        {/* SECCIÓN PARA EMPRESAS */}
        <div style={{ marginTop: "64px", background: "white", borderRadius: "20px", padding: "48px 40px", border: "1px solid #e2e8f0" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span style={{ background: "#eff4ff", color: "#1a56db", fontSize: "12px", fontWeight: "600", padding: "4px 14px", borderRadius: "20px", display: "inline-block", marginBottom: "12px" }}>PARA EMPRESAS</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "22px", color: "#0f172a", marginBottom: "8px" }}>¿Por qué publicar en EmpleoYaBolivia?</h2>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Todo lo que necesitas para encontrar el candidato ideal</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "36px" }}>
            {BENEFITS_EMPRESA.map(b => (
              <div key={b.title} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>{b.icon}</div>
                <h3 style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a", marginBottom: "6px" }}>{b.title}</h3>
                <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.6" }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => handleAcceso("empresa")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "13px 36px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
              Publicar oferta gratis →
            </button>
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div style={{ marginTop: "48px" }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "700", fontSize: "19px", color: "#0f172a", marginBottom: "20px" }}>Explorar por categoría</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
            {CATEGORIES.map(cat => (
              <a href={`/buscar?categoria=${cat.name}`} key={cat.name}
                style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", textAlign: "center", cursor: "pointer", textDecoration: "none", transition: "all 0.2s", display: "block" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a56db"; e.currentTarget.style.background = "#eff4ff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "none"; }}
              >
                <span style={{ fontSize: "26px", display: "block", marginBottom: "7px" }}>{cat.icon}</span>
                <h4 style={{ fontWeight: "600", fontSize: "12px", color: "#0f172a", marginBottom: "3px" }}>{cat.name}</h4>
                <p style={{ fontSize: "11px", color: "#059669", fontWeight: "600" }}>{cat.growth}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <style>{`@media(max-width:768px){[style*="grid-template-columns: 1fr 320px"]{grid-template-columns:1fr!important}[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr 1fr!important}}`}</style>
    </div>
  );
}
