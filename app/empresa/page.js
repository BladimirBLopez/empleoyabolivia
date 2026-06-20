"use client";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Navbar, Footer, Spinner, EstadoBadge, timeAgo, logoLetters, logoColor } from "@/lib/components";
import { getEmpleosPorEmpresa, toggleEmpleo, eliminarEmpleo, getPostulacionesEmpleo, actualizarEstadoPostulacion } from "@/lib/supabase";

export default function EmpresaPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const role = user?.unsafeMetadata?.role;
  const [empleos, setEmpleos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaEmpleo, setVistaEmpleo] = useState(null); // id de empleo con postulaciones abiertas
  const [postulaciones, setPostulaciones] = useState([]);
  const [loadingPost, setLoadingPost] = useState(false);
  const [tab, setTab] = useState("ofertas"); // 'ofertas' | 'postulaciones'

  const fetchEmpleos = async () => {
    setLoading(true);
    try {
      const data = await getEmpleosPorEmpresa(user.id);
      setEmpleos(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isSignedIn) fetchEmpleos(); }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!role) { router.push("/elegir-rol"); return; }
    if (role === "candidato") router.push("/dashboard");
  }, [isLoaded, isSignedIn, role, router]);

  const handleToggle = async (id, activo) => {
    await toggleEmpleo(id, !activo);
    fetchEmpleos();
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar esta oferta? Esta acción no se puede deshacer.")) return;
    await eliminarEmpleo(id);
    fetchEmpleos();
  };

  const verPostulaciones = async (empleo) => {
    setVistaEmpleo(empleo);
    setTab("postulaciones");
    setLoadingPost(true);
    try {
      const data = await getPostulacionesEmpleo(empleo.id);
      setPostulaciones(data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingPost(false); }
  };

  const cambiarEstado = async (postId, estado) => {
    await actualizarEstadoPostulacion(postId, estado);
    setPostulaciones(prev => prev.map(p => p.id === postId ? { ...p, estado } : p));
  };

  if (!isLoaded) return null;
  if (!isSignedIn) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "48px", marginBottom: "16px" }}>🏢</p>
        <h2 style={{ fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Panel de empresa</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Inicia sesión para gestionar tus ofertas y candidatos.</p>
        <button onClick={() => router.push("/empresa-login")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 32px", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
  if (role !== "empresa") return null;

  const totalPostulaciones = empleos.reduce((a, e) => a + (e.postulaciones?.[0]?.count || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", padding: "36px 20px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ color: "white", fontWeight: "700", fontSize: "22px", marginBottom: "2px" }}>Panel de Empresa</h1>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>{user?.emailAddresses?.[0]?.emailAddress}</p>
          </div>
          <button onClick={() => router.push("/publicar")} style={{ background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: "8px", padding: "10px 22px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
            + Publicar nueva oferta
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", marginBottom: "28px" }}>
          {[
            { label: "Ofertas activas", value: empleos.filter(e => e.activo).length, icon: "📋" },
            { label: "Total publicadas", value: empleos.length, icon: "📊" },
            { label: "Candidatos recibidos", value: totalPostulaciones, icon: "👥" },
          ].map(s => (
            <div key={s.label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
              <p style={{ fontSize: "28px", marginBottom: "4px" }}>{s.icon}</p>
              <p style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>{s.value}</p>
              <p style={{ fontSize: "12px", color: "#64748b" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "0", borderBottom: "2px solid #e2e8f0", marginBottom: "24px" }}>
          {[["ofertas", "📋 Mis ofertas"], ["postulaciones", `👥 Candidatos${vistaEmpleo ? ` — ${vistaEmpleo.titulo}` : ""}`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: tab === key ? "2px solid #1a56db" : "2px solid transparent", color: tab === key ? "#1a56db" : "#64748b", fontWeight: tab === key ? "600" : "400", fontSize: "14px", cursor: "pointer", marginBottom: "-2px" }}>
              {label}
            </button>
          ))}
        </div>

        {/* OFERTAS */}
        {tab === "ofertas" && (
          loading ? <Spinner /> : empleos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: "48px", marginBottom: "12px" }}>📋</p>
              <p style={{ fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>No tienes ofertas publicadas</p>
              <button onClick={() => router.push("/publicar")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "10px 28px", fontWeight: "600", cursor: "pointer", marginTop: "12px" }}>
                Publicar mi primera oferta
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {empleos.map(emp => (
                <div key={emp.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: logoColor(emp.empresa), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "12px", flexShrink: 0 }}>
                    {logoLetters(emp.empresa)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <p style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>{emp.titulo}</p>
                      <span style={{ background: emp.activo ? "#d1fae5" : "#f1f5f9", color: emp.activo ? "#065f46" : "#64748b", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px" }}>
                        {emp.activo ? "Activa" : "Pausada"}
                      </span>
                    </div>
                    <p style={{ color: "#64748b", fontSize: "12px", marginTop: "3px" }}>
                      {emp.ciudad} · {emp.tipo_contrato} · publicada {timeAgo(emp.created_at)}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <button onClick={() => verPostulaciones(emp)} style={{ background: "#eff4ff", color: "#1a56db", border: "none", borderRadius: "7px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
                      👥 {emp.postulaciones?.[0]?.count || 0} candidatos
                    </button>
                    <button onClick={() => handleToggle(emp.id, emp.activo)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "7px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
                      {emp.activo ? "Pausar" : "Activar"}
                    </button>
                    <button onClick={() => handleEliminar(emp.id)} style={{ background: "#fee2e2", border: "none", color: "#dc2626", borderRadius: "7px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* POSTULACIONES */}
        {tab === "postulaciones" && (
          !vistaEmpleo ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: "40px", marginBottom: "12px" }}>👆</p>
              <p style={{ color: "#64748b" }}>Selecciona una oferta en la pestaña "Mis ofertas" para ver sus candidatos</p>
              <button onClick={() => setTab("ofertas")} style={{ marginTop: "12px", background: "#1a56db", color: "white", border: "none", borderRadius: "8px", padding: "8px 20px", cursor: "pointer", fontSize: "13px" }}>Ver mis ofertas</button>
            </div>
          ) : loadingPost ? <Spinner /> : postulaciones.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: "40px", marginBottom: "12px" }}>📭</p>
              <p style={{ color: "#64748b" }}>Aún no hay candidatos para esta oferta</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {postulaciones.map(p => {
                const perfil = p.perfiles;
                return (
                  <div key={p.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", display: "flex", gap: "14px", alignItems: "center" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#1a56db", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>
                      {perfil?.nombre?.[0] || "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>{perfil?.nombre || "Candidato"}</p>
                      <p style={{ color: "#64748b", fontSize: "12px" }}>{perfil?.titulo || "Sin título"} · {perfil?.ciudad || ""}</p>
                      <p style={{ color: "#94a3b8", fontSize: "11px", marginTop: "2px" }}>Postulado {timeAgo(p.created_at)}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                      <EstadoBadge estado={p.estado} />
                      <select
                        value={p.estado}
                        onChange={e => cambiarEstado(p.id, e.target.value)}
                        style={{ padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
                      >
                        {["pendiente","revisando","entrevista","rechazado","aceptado"].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  );
}
