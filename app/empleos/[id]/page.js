"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Navbar, Footer, Spinner, MapPinIcon, BriefcaseIcon, ClockIcon, logoColor, logoLetters, timeAgo } from "@/lib/components";
import { getEmpleo, postular, yaPostulo } from "@/lib/supabase";

export default function DetalleEmpleoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const { openSignIn } = useClerk();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postulando, setPostulando] = useState(false);
  const [postulado, setPostulado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getEmpleo(id).then(setJob).catch(() => setError("No se encontró esta oferta")).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (isSignedIn && job) {
      yaPostulo(job.id, user.id).then(setPostulado);
    }
  }, [isSignedIn, job, user?.id]);

  const handlePostular = async () => {
    if (!isSignedIn) { openSignIn(); return; }
    setPostulando(true);
    setError("");
    try {
      const res = await postular(job.id, user.id);
      if (res.yaPostulo) setError("Ya habías postulado a esta oferta anteriormente.");
      setPostulado(true);
    } catch (e) {
      setError("Error al postular: " + e.message);
    } finally {
      setPostulando(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <Spinner />
    </div>
  );

  if (!job) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "48px", marginBottom: "16px" }}>😕</p>
        <h2 style={{ fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Oferta no encontrada</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Esta oferta pudo haber sido eliminada o pausada.</p>
        <button onClick={() => router.push("/buscar")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 32px", fontWeight: "600", cursor: "pointer" }}>
          Ver otras ofertas
        </button>
      </div>
      <Footer />
    </div>
  );

  const color = logoColor(job.empresa);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", padding: "40px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "14px", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "20px", flexShrink: 0 }}>
            {logoLetters(job.empresa)}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h1 style={{ color: "white", fontWeight: "700", fontSize: "24px", marginBottom: "6px" }}>{job.titulo}</h1>
            <p style={{ color: "#94a3b8", fontSize: "15px", marginBottom: "12px" }}>{job.empresa}</p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#cbd5e1" }}><MapPinIcon size={14} /> {job.ciudad}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#cbd5e1" }}><BriefcaseIcon size={14} /> {job.tipo_contrato}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#cbd5e1" }}><ClockIcon /> Publicada {timeAgo(job.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 20px", display: "grid", gridTemplateColumns: "1fr 280px", gap: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "28px" }}>
            <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a", marginBottom: "12px" }}>Descripción del puesto</h2>
            <p style={{ color: "#374151", fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{job.descripcion}</p>
          </div>

          {job.requisitos && (
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "28px" }}>
              <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a", marginBottom: "12px" }}>Requisitos</h2>
              <p style={{ color: "#374151", fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{job.requisitos}</p>
            </div>
          )}

          {job.beneficios && (
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "28px" }}>
              <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a", marginBottom: "12px" }}>Beneficios</h2>
              <p style={{ color: "#374151", fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{job.beneficios}</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "22px", position: "sticky", top: "84px" }}>
            <div style={{ marginBottom: "16px" }}>
              <p style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", marginBottom: "3px" }}>Salario</p>
              <p style={{ fontWeight: "700", fontSize: "17px", color: "#059669" }}>{job.salario || "A convenir"}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: "13px" }}>Categoría</span>
                <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: "500" }}>{job.categoria}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: "13px" }}>Modalidad</span>
                <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: "500" }}>{job.tipo_contrato}</span>
              </div>
              {job.experiencia_minima && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>Experiencia</span>
                  <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: "500" }}>{job.experiencia_minima}</span>
                </div>
              )}
              {job.estudio_minimo && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: "13px" }}>Estudios mínimos</span>
                  <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: "500" }}>{job.estudio_minimo}</span>
                </div>
              )}
            </div>

            {postulado ? (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <p style={{ color: "#059669", fontWeight: "600", fontSize: "14px" }}>✓ Ya postulaste</p>
                <p style={{ color: "#065f46", fontSize: "12px", marginTop: "4px" }}>Revisa el estado en tu dashboard</p>
              </div>
            ) : (
              <button onClick={handlePostular} disabled={postulando}
                style={{ width: "100%", background: postulando ? "#93c5fd" : "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px", fontWeight: "700", fontSize: "14px", cursor: postulando ? "not-allowed" : "pointer" }}>
                {postulando ? "Enviando..." : "Postular ahora"}
              </button>
            )}
            {error && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "10px" }}>{error}</p>}

            {!isSignedIn && <p style={{ color: "#94a3b8", fontSize: "11px", marginTop: "10px", textAlign: "center" }}>Necesitas iniciar sesión para postular</p>}
          </div>
        </div>
      </div>
      <Footer />

      <style>{`@media(max-width:700px){[style*="grid-template-columns: 1fr 280px"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
