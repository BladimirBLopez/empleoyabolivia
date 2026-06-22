"use client";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Navbar, Footer, Spinner, ErrorMessage, EstadoBadge, MapPinIcon, BriefcaseIcon, logoLetters, logoColor, timeAgo } from "@/lib/components";
import { getPostulacionesCandidato } from "@/lib/supabase";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const role = user?.unsafeMetadata?.role;

  const cargarPostulaciones = () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(false);
    getPostulacionesCandidato(user.id)
      .then(setPostulaciones)
      .catch(e => { console.error(e); setError(true); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarPostulaciones(); }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!role) { router.push("/elegir-rol"); return; }
    if (role === "empresa") router.push("/empresa");
  }, [isLoaded, isSignedIn, role, router]);

  if (!isLoaded) return null;
  if (!isSignedIn) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</p>
        <h2 style={{ fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Accede a tu dashboard</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Inicia sesión para ver tus postulaciones y gestionar tu perfil.</p>
        <button onClick={() => router.push("/candidato-login")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 32px", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
  if (role !== "candidato") return null;

  const stats = {
    total: postulaciones.length,
    pendiente: postulaciones.filter(p => p.estado === "pendiente").length,
    revisando: postulaciones.filter(p => p.estado === "revisando").length,
    entrevista: postulaciones.filter(p => p.estado === "entrevista").length,
    aceptado: postulaciones.filter(p => p.estado === "aceptado").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", padding: "36px 20px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
          {user?.imageUrl
            ? <img src={user.imageUrl} alt="Avatar" style={{ width: "60px", height: "60px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.2)" }} />
            : <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#1a56db", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "22px" }}>{user?.firstName?.[0] || "?"}</div>
          }
          <div>
            <h1 style={{ color: "white", fontWeight: "700", fontSize: "22px", marginBottom: "2px" }}>Hola, {user?.firstName || "candidato"} 👋</h1>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>{user?.emailAddresses?.[0]?.emailAddress}</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/perfil")} style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>
              ✏️ Mi perfil / CV
            </button>
            <button onClick={() => router.push("/buscar")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>
              🔍 Buscar empleos
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "32px" }}>
          {[
            { label: "Total postuladas", value: stats.total, color: "#1a56db", bg: "#eff4ff" },
            { label: "Pendientes", value: stats.pendiente, color: "#b45309", bg: "#fef9c3" },
            { label: "En revisión", value: stats.revisando, color: "#1e40af", bg: "#dbeafe" },
            { label: "Entrevistas", value: stats.entrevista, color: "#065f46", bg: "#d1fae5" },
            { label: "Aceptadas", value: stats.aceptado, color: "#059669", bg: "#ecfdf5" },
          ].map(s => (
            <div key={s.label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", textAlign: "center" }}>
              <p style={{ fontSize: "28px", fontWeight: "800", color: s.color }}>{s.value}</p>
              <p style={{ fontSize: "12px", color: "#64748b" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* POSTULACIONES */}
        <h2 style={{ fontWeight: "700", fontSize: "18px", color: "#0f172a", marginBottom: "16px" }}>Mis postulaciones</h2>

        {loading ? <Spinner /> : error ? <ErrorMessage onRetry={cargarPostulaciones} /> : postulaciones.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "48px", marginBottom: "12px" }}>📭</p>
            <p style={{ fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>Aún no has postulado a ninguna oferta</p>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Explora miles de oportunidades en Bolivia</p>
            <button onClick={() => router.push("/buscar")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "10px 28px", fontWeight: "600", cursor: "pointer" }}>
              Ver ofertas
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {postulaciones.map(p => {
              const job = p.empleos;
              if (!job) return null;
              const color = logoColor(job.empresa);
              return (
                <div key={p.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "12px", flexShrink: 0 }}>
                    {logoLetters(job.empresa)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>{job.titulo}</p>
                    <p style={{ color: "#475569", fontSize: "13px" }}>{job.empresa}</p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}><MapPinIcon size={12} />{job.ciudad}</span>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>Postulado {timeAgo(p.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <EstadoBadge estado={p.estado} />
                    <button onClick={() => router.push(`/empleos/${job.id}`)} style={{ fontSize: "12px", color: "#1a56db", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: "500" }}>
                      Ver oferta →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
      <style>{`@media(max-width:600px){[style*="flex-direction: row"]{flex-direction:column!important}}`}</style>
    </div>
  );
}
