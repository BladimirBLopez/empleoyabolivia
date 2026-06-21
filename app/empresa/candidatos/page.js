"use client";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Navbar, Footer, Spinner, EstadoBadge } from "@/lib/components";
import { getCandidatosPorEmpresa, actualizarEstadoPostulacion } from "@/lib/supabase";

export default function CandidatosPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const role = user?.unsafeMetadata?.role;

  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroOferta, setFiltroOferta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    if (!isSignedIn) return;
    getCandidatosPorEmpresa(user.id).then(setPostulaciones).catch(console.error).finally(() => setLoading(false));
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!role) { router.push("/elegir-rol"); return; }
    if (role === "candidato") router.push("/dashboard");
  }, [isLoaded, isSignedIn, role, router]);

  const ofertas = useMemo(() => {
    const map = new Map();
    postulaciones.forEach(p => { if (p.empleos) map.set(p.empleos.id, p.empleos.titulo); });
    return Array.from(map.entries());
  }, [postulaciones]);

  const filtradas = useMemo(() => {
    return postulaciones.filter(p => {
      if (filtroOferta && p.empleos?.id !== filtroOferta) return false;
      if (filtroEstado && p.estado !== filtroEstado) return false;
      return true;
    });
  }, [postulaciones, filtroOferta, filtroEstado]);

  const cambiarEstado = async (postId, estado) => {
    await actualizarEstadoPostulacion(postId, estado);
    setPostulaciones(prev => prev.map(p => p.id === postId ? { ...p, estado } : p));
  };

  if (!isLoaded) return null;
  if (!isSignedIn) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "48px", marginBottom: "16px" }}>👥</p>
        <h2 style={{ fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Candidatos</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Inicia sesión para ver tus candidatos.</p>
        <button onClick={() => router.push("/empresa-login")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 32px", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
  if (role !== "empresa") return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 20px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontWeight: "700", fontSize: "20px", color: "#0f172a", marginBottom: "4px" }}>Candidatos</h1>
            <p style={{ color: "#64748b", fontSize: "13px" }}>Todos los postulantes de tus ofertas, en un solo lugar.</p>
          </div>
          <button onClick={() => router.push("/empresa")} style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>
            ← Mis ofertas
          </button>
        </div>

        {/* FILTROS */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <select value={filtroOferta} onChange={e => setFiltroOferta(e.target.value)}
            style={{ padding: "9px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", background: "white", cursor: "pointer" }}>
            <option value="">Todas las ofertas</option>
            {ofertas.map(([id, titulo]) => <option key={id} value={id}>{titulo}</option>)}
          </select>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
            style={{ padding: "9px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", background: "white", cursor: "pointer" }}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="revisando">En revisión</option>
            <option value="entrevista">Entrevista</option>
            <option value="rechazado">Rechazado</option>
            <option value="aceptado">Aceptado</option>
          </select>
          {(filtroOferta || filtroEstado) && (
            <button onClick={() => { setFiltroOferta(""); setFiltroEstado(""); }}
              style={{ padding: "9px 14px", borderRadius: "8px", border: "none", background: "transparent", color: "#1a56db", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {loading ? <Spinner /> : filtradas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>👥</p>
            <p style={{ fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>
              {postulaciones.length === 0 ? "Aún no tienes candidatos" : "No hay candidatos con estos filtros"}
            </p>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              {postulaciones.length === 0 ? "Cuando alguien postule a tus ofertas, aparecerá aquí." : "Intenta cambiar los filtros."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>{filtradas.length} candidato{filtradas.length === 1 ? "" : "s"}</p>
            {filtradas.map(post => {
              const perfil = post.perfiles;
              const isOpen = expandido === post.id;
              return (
                <div key={post.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                  <div onClick={() => setExpandido(isOpen ? null : post.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "16px 20px", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1a56db", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "15px", flexShrink: 0 }}>
                        {(perfil?.nombre || "?").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>{perfil?.nombre || "Candidato sin nombre"}</p>
                        <p style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {perfil?.titulo || "Sin título profesional"} · Postuló a <strong>{post.empleos?.titulo}</strong>
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                      <EstadoBadge estado={post.estado} />
                      <span style={{ fontSize: "12px", color: "#94a3b8", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ borderTop: "1px solid #f1f5f9", padding: "20px", background: "#f8fafc" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div>
                          <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Ciudad</p>
                          <p style={{ fontSize: "13px", color: "#0f172a" }}>{perfil?.ciudad || "No especificado"}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Teléfono</p>
                          <p style={{ fontSize: "13px", color: "#0f172a" }}>{perfil?.telefono || "No especificado"}</p>
                        </div>
                      </div>

                      {perfil?.resumen && (
                        <div style={{ marginBottom: "16px" }}>
                          <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Resumen</p>
                          <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>{perfil.resumen}</p>
                        </div>
                      )}

                      {perfil?.experiencia && (
                        <div style={{ marginBottom: "16px" }}>
                          <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Experiencia</p>
                          <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", whiteSpace: "pre-line" }}>{perfil.experiencia}</p>
                        </div>
                      )}

                      {perfil?.habilidades && (
                        <div style={{ marginBottom: "16px" }}>
                          <p style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "6px" }}>Habilidades</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {perfil.habilidades.split(",").map(h => h.trim()).filter(Boolean).map(h => (
                              <span key={h} style={{ background: "#eff4ff", color: "#1a56db", fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "500" }}>{h}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
                        {["pendiente", "revisando", "entrevista", "aceptado", "rechazado"].map(e => (
                          <button key={e} onClick={() => cambiarEstado(post.id, e)}
                            style={{ padding: "7px 14px", borderRadius: "8px", border: post.estado === e ? "none" : "1px solid #e2e8f0", background: post.estado === e ? "#1a56db" : "white", color: post.estado === e ? "white" : "#475569", fontSize: "12px", fontWeight: "600", cursor: "pointer", textTransform: "capitalize" }}>
                            {e === "revisando" ? "En revisión" : e}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
      <style>{`@media(max-width:600px){[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
