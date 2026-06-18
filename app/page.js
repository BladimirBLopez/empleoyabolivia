"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar, Footer, JobCard, Spinner, SearchIcon, MapPinIcon, BellIcon, BriefcaseIcon } from "@/lib/components";
import { getEmpleos } from "@/lib/supabase";

const CATEGORIES = [
  { name: "Tecnología", icon: "💻" },
  { name: "Ventas", icon: "📊" },
  { name: "Administración", icon: "📋" },
  { name: "Marketing", icon: "📱" },
  { name: "Salud", icon: "🏥" },
  { name: "Educación", icon: "📚" },
  { name: "Ingeniería", icon: "⚙️" },
  { name: "Finanzas", icon: "💰" },
];

const DEPARTMENTS = ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Sucre", "Tarija", "Trinidad", "Cobija"];

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmpleos({ limit: 6 })
      .then(({ data, count }) => { setJobs(data || []); setTotal(count || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (searchLocation) params.set("ciudad", searchLocation);
    router.push(`/buscar?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1a56db 100%)", padding: "64px 20px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "20px", padding: "5px 14px", marginBottom: "24px" }}>
            <span style={{ color: "#fbbf24", fontSize: "12px", fontWeight: "600" }}>
              {total > 0 ? `+${total} ofertas activas` : "Cientos de ofertas activas"} en Bolivia
            </span>
          </div>

          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "white", lineHeight: "1.15", marginBottom: "16px", letterSpacing: "-0.5px" }}>
            El trabajo que buscas<br />
            <span style={{ color: "#60a5fa" }}>está en Bolivia</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "17px", marginBottom: "36px", maxWidth: "560px", margin: "0 auto 36px" }}>
            Conectamos talento boliviano con las mejores empresas del país. Ofertas de empleo reales, publicadas por empresas reales.
          </p>

          <form onSubmit={handleSearch} style={{ background: "white", borderRadius: "14px", padding: "8px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", gap: "8px", maxWidth: "760px", margin: "0 auto", flexWrap: "wrap" }}>
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

            <button type="submit"
              style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 28px", fontWeight: "700", fontSize: "15px", cursor: "pointer", whiteSpace: "nowrap" }}>
              Buscar empleo
            </button>
          </form>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>

          {/* Jobs */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "700", fontSize: "20px", color: "#0f172a" }}>Ofertas recientes</h2>
                <p style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>Las últimas oportunidades publicadas</p>
              </div>
              <a onClick={() => router.push("/buscar")} style={{ color: "#1a56db", fontSize: "13px", fontWeight: "500", textDecoration: "none", cursor: "pointer" }}>
                Ver todas →
              </a>
            </div>

            {loading ? <Spinner /> : jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>📋</p>
                <p style={{ fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>Todavía no hay ofertas publicadas</p>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>Sé la primera empresa en publicar una oferta</p>
                <button onClick={() => router.push("/publicar")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "10px 24px", fontWeight: "600", cursor: "pointer" }}>
                  Publicar oferta
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} onClick={() => router.push(`/empleos/${job.id}`)} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "linear-gradient(135deg, #eff4ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "24px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", background: "#1a56db", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "white" }}>
                  <BellIcon />
                </div>
                <div>
                  <h3 style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a", marginBottom: "6px" }}>Busca tu próximo empleo</h3>
                  <p style={{ color: "#475569", fontSize: "13px", marginBottom: "14px" }}>Crea tu perfil y postula a las mejores ofertas de Bolivia.</p>
                  <button
                    onClick={() => router.push("/perfil")}
                    style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", fontSize: "13px", cursor: "pointer", width: "100%" }}
                  >
                    Crear mi perfil
                  </button>
                </div>
              </div>
            </div>

            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
              <h3 style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a", marginBottom: "14px" }}>Explorar por sector</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {CATEGORIES.map(cat => (
                  <div key={cat.name}
                    onClick={() => router.push(`/buscar?categoria=${encodeURIComponent(cat.name)}`)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: "8px", cursor: "pointer" }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#0f172a" }}>
                      <span style={{ fontSize: "16px" }}>{cat.icon}</span> {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#0f172a", borderRadius: "14px", padding: "24px", textAlign: "center" }}>
              <div style={{ color: "white", display: "flex", justifyContent: "center", marginBottom: "10px" }}><BriefcaseIcon size={28} /></div>
              <h3 style={{ fontWeight: "700", fontSize: "15px", color: "white", marginBottom: "8px" }}>¿Buscas talento?</h3>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px" }}>Publica tu oferta y llega a candidatos en toda Bolivia.</p>
              <button onClick={() => router.push("/publicar")} style={{ background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "700", fontSize: "13px", cursor: "pointer", width: "100%" }}>
                Publicar oferta gratis
              </button>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div style={{ marginTop: "64px", background: "white", borderRadius: "20px", padding: "48px 40px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "22px", color: "#0f172a", textAlign: "center", marginBottom: "8px" }}>
            Encuentra trabajo en 3 pasos
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", marginBottom: "40px" }}>Simple, rápido y sin complicaciones</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px" }}>
            {[
              { step: "01", title: "Crea tu perfil", desc: "Regístrate gratis y completa tu CV en minutos.", icon: "👤" },
              { step: "02", title: "Explora ofertas", desc: "Busca entre las ofertas verificadas. Filtra por sector, ciudad o tipo de contrato.", icon: "🔍" },
              { step: "03", title: "Postula y conecta", desc: "Aplica con un clic y sigue el estado de tu candidatura en tu dashboard.", icon: "🚀" },
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
            <button onClick={() => router.push("/perfil")}
              style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "14px 36px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
              Empezar ahora — es gratis
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 340px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
