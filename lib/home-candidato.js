"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Navbar, Footer, JobCard, Spinner } from "@/lib/components";
import { getEmpleos, getPostulacionesCandidato } from "@/lib/supabase";

const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const MapPinIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

const CATEGORIES = [
  { name: "Tecnología", icon: "💻" }, { name: "Ventas", icon: "📊" },
  { name: "Administración", icon: "📋" }, { name: "Marketing", icon: "📱" },
  { name: "Salud", icon: "🏥" }, { name: "Educación", icon: "📚" },
  { name: "Ingeniería", icon: "⚙️" }, { name: "Finanzas", icon: "💰" },
];

const DEPARTMENTS = ["La Paz","Santa Cruz","Cochabamba","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"];

const ESTADO_LABEL = {
  pendiente: { text: "Pendiente", color: "#b45309", bg: "#fef9c3" },
  revisando: { text: "En revisión", color: "#1e40af", bg: "#dbeafe" },
  entrevista: { text: "Entrevista", color: "#065f46", bg: "#d1fae5" },
  rechazado: { text: "Rechazado", color: "#dc2626", bg: "#fee2e2" },
  aceptado: { text: "Aceptado", color: "#059669", bg: "#ecfdf5" },
};

export default function HomeCandidato() {
  const { user } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [ofertas, setOfertas] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getEmpleos({ limit: 6 }).then(r => r.data),
      getPostulacionesCandidato(user.id),
    ]).then(([emp, post]) => {
      setOfertas(emp || []);
      setPostulaciones((post || []).slice(0, 3));
    }).catch(console.error).finally(() => setLoading(false));
  }, [user?.id]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (searchLocation) params.set("ciudad", searchLocation);
    router.push(`/buscar?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* SALUDO + BUSCADOR */}
      <section style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f, #1a56db)", padding: "40px 20px 56px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ color: "white", fontWeight: "800", fontSize: "24px", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Hola, {user?.firstName || "candidato"} 👋
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "28px" }}>¿Qué tipo de trabajo buscas hoy?</p>

          <div style={{ background: "white", borderRadius: "14px", padding: "8px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px", display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ color: "#64748b" }}><SearchIcon /></span>
              <input type="text" placeholder="Puesto, empresa o habilidad" style={{ border: "none", background: "transparent", outline: "none", fontSize: "14px", color: "#0f172a", width: "100%" }}
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
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

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px" }}>

          {/* OFERTAS RECOMENDADAS */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "700", fontSize: "19px", color: "#0f172a" }}>Ofertas para ti</h2>
              <a href="/buscar" style={{ color: "#1a56db", fontSize: "13px", fontWeight: "500", textDecoration: "none" }}>Ver todas →</a>
            </div>

            {loading ? <Spinner /> : ofertas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</p>
                <p style={{ color: "#64748b", fontSize: "14px" }}>Aún no hay ofertas publicadas. Vuelve pronto.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {ofertas.map(job => <JobCard key={job.id} job={job} onClick={() => router.push(`/empleos/${job.id}`)} />)}
              </div>
            )}
          </div>

          {/* SIDEBAR: MIS POSTULACIONES + CATEGORÍAS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>Mis postulaciones</h3>
                <a href="/dashboard" style={{ fontSize: "12px", color: "#1a56db", textDecoration: "none" }}>Ver todas</a>
              </div>

              {loading ? null : postulaciones.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "13px" }}>Aún no postulaste a ninguna oferta.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {postulaciones.map(p => {
                    const estado = ESTADO_LABEL[p.estado] || ESTADO_LABEL.pendiente;
                    return (
                      <div key={p.id} onClick={() => router.push("/dashboard")} style={{ cursor: "pointer", padding: "10px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>{p.empleos?.titulo}</p>
                        <span style={{ fontSize: "11px", fontWeight: "600", color: estado.color, background: estado.bg, padding: "2px 8px", borderRadius: "20px" }}>{estado.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
              <h3 style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a", marginBottom: "14px" }}>Explorar por sector</h3>
              {CATEGORIES.map(cat => (
                <a href={`/buscar?categoria=${cat.name}`} key={cat.name}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", color: "#0f172a", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: "15px" }}>{cat.icon}</span> {cat.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <style>{`@media(max-width:768px){[style*="grid-template-columns: 1fr 320px"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
