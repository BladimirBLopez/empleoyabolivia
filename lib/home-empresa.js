"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Navbar, Footer, Spinner, logoColor, logoLetters } from "@/lib/components";
import { getEmpleosPorEmpresa, getCandidatosPorEmpresa } from "@/lib/supabase";

export default function HomeEmpresa() {
  const { user } = useUser();
  const router = useRouter();
  const [ofertas, setOfertas] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getEmpleosPorEmpresa(user.id),
      getCandidatosPorEmpresa(user.id),
    ]).then(([emp, cand]) => {
      setOfertas(emp || []);
      setCandidatos((cand || []).slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, [user?.id]);

  const ofertasActivas = ofertas.filter(o => o.activo);
  const totalPostulaciones = ofertas.reduce((sum, o) => sum + (o.postulaciones?.[0]?.count || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* SALUDO + CTA */}
      <section style={{ background: "linear-gradient(135deg, #1a56db, #0f3d9e)", padding: "40px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h1 style={{ color: "white", fontWeight: "800", fontSize: "22px", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Hola, {user?.firstName || "empresa"} 👋
            </h1>
            <p style={{ color: "#bfdbfe", fontSize: "14px" }}>Aquí está el resumen de tu actividad de reclutamiento.</p>
          </div>
          <button onClick={() => router.push("/publicar")} style={{ background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: "10px", padding: "13px 28px", fontWeight: "700", fontSize: "15px", cursor: "pointer", whiteSpace: "nowrap" }}>
            + Publicar nueva oferta
          </button>
        </div>
      </section>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" }}>

        {/* ESTADÍSTICAS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Ofertas activas", value: ofertasActivas.length, icon: "📋", color: "#1a56db" },
            { label: "Ofertas totales", value: ofertas.length, icon: "🗂️", color: "#7c3aed" },
            { label: "Postulaciones", value: totalPostulaciones, icon: "👥", color: "#059669" },
          ].map(s => (
            <div key={s.label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "20px" }}>{s.icon}</span>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>{s.label}</span>
              </div>
              <p style={{ fontSize: "28px", fontWeight: "800", color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{loading ? "—" : s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* MIS OFERTAS */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>Mis ofertas activas</h2>
              <a href="/empresa" style={{ color: "#1a56db", fontSize: "13px", textDecoration: "none" }}>Ver todas →</a>
            </div>

            {loading ? <Spinner /> : ofertasActivas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "32px", marginBottom: "8px" }}>📋</p>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "14px" }}>Aún no tienes ofertas activas.</p>
                <button onClick={() => router.push("/publicar")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "8px", padding: "9px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  Publicar mi primera oferta
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {ofertasActivas.slice(0, 5).map(o => (
                  <div key={o.id} onClick={() => router.push("/empresa")} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.titulo}</p>
                      <p style={{ fontSize: "12px", color: "#64748b" }}>{o.ciudad} · {o.tipo_contrato}</p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#1a56db", background: "#eff4ff", padding: "3px 10px", borderRadius: "20px", flexShrink: 0 }}>
                      {o.postulaciones?.[0]?.count || 0} postulantes
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CANDIDATOS RECIENTES */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>Candidatos recientes</h2>
              <a href="/empresa/candidatos" style={{ color: "#1a56db", fontSize: "13px", textDecoration: "none" }}>Ver todos →</a>
            </div>

            {loading ? <Spinner /> : candidatos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "32px", marginBottom: "8px" }}>👥</p>
                <p style={{ color: "#64748b", fontSize: "13px" }}>Aún no tienes candidatos. Publica una oferta para empezar a recibir postulaciones.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {candidatos.map(c => (
                  <div key={c.id} onClick={() => router.push("/empresa/candidatos")} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1a56db", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
                      {(c.perfiles?.nombre || "?").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{c.perfiles?.nombre || "Candidato"}</p>
                      <p style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Postuló a {c.empleos?.titulo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <style>{`@media(max-width:768px){[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
