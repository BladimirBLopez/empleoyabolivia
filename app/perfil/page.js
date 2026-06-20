"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar, Footer, Spinner } from "@/lib/components";
import { getPerfil, upsertPerfil } from "@/lib/supabase";
import { Suspense } from "react";

const CATEGORIAS = ["Tecnología","Ventas","Administración","Marketing","Salud","Educación","Ingeniería","Finanzas","Minería","Telecomunicaciones","Energía","Logística"];
const DEPARTAMENTOS = ["La Paz","Santa Cruz","Cochabamba","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"];

const STEPS = ["Datos personales", "Resumen profesional", "Experiencia y educación", "Habilidades"];

const inputStyle = { width: "100%", padding: "11px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.15s" };
const labelStyle = { display: "block", fontWeight: "500", fontSize: "13px", color: "#374151", marginBottom: "6px" };

function PerfilWizardContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const role = user?.unsafeMetadata?.role;
  const isOnboarding = params.get("onboarding") === "1";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    nombre: "", titulo: "", ciudad: "", telefono: "", linkedin: "",
    resumen: "", experiencia: "", educacion: "", habilidades: "",
    disponibilidad: "Inmediata", categoria_interes: "",
  });

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  useEffect(() => {
    if (!isSignedIn) return;
    getPerfil(user.id).then(data => {
      if (data) setForm(f => ({ ...f, ...data }));
    }).catch(console.error).finally(() => setLoading(false));
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!role) { router.push("/elegir-rol"); return; }
    if (role === "empresa") router.push("/empresa");
  }, [isLoaded, isSignedIn, role, router]);

  const guardarProgreso = async () => {
    setSaving(true); setError("");
    try {
      await upsertPerfil({ ...form, clerk_user_id: user.id });
      setSaved(true);
      return true;
    } catch (e) {
      setError("Error al guardar: " + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const ok = await guardarProgreso();
    if (!ok) return;
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      setSaved(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else router.push("/dashboard");
  };

  const handleSkipOnboarding = () => router.push("/dashboard");

  if (!isLoaded) return null;
  if (!isSignedIn) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "48px", marginBottom: "16px" }}>👤</p>
        <h2 style={{ fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Tu perfil profesional</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Inicia sesión para crear y gestionar tu CV.</p>
        <button onClick={() => router.push("/candidato-login")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 32px", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
  if (role !== "candidato") return null;

  const completeness = [form.nombre, form.titulo, form.ciudad, form.resumen, form.experiencia, form.educacion, form.habilidades].filter(Boolean).length;
  const pct = Math.round((completeness / 7) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "24px" }}>
          {isOnboarding ? (
            <>
              <h1 style={{ fontWeight: "800", fontSize: "21px", color: "#0f172a", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Completa tu perfil
              </h1>
              <p style={{ color: "#64748b", fontSize: "14px" }}>Esto ayuda a las empresas a conocerte mejor. Toma menos de 3 minutos.</p>
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h1 style={{ fontWeight: "700", fontSize: "20px", color: "#0f172a", marginBottom: "4px" }}>Mi perfil profesional</h1>
                <p style={{ color: "#64748b", fontSize: "13px" }}>Esta información se comparte con las empresas al postular.</p>
              </div>
              <button onClick={() => router.push("/dashboard")} style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>
                ← Mi dashboard
              </button>
            </div>
          )}
        </div>

        {/* STEP PROGRESS - estilo InfoJobs */}
        <div style={{ marginBottom: "8px" }}>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>Paso {step + 1}/{STEPS.length} — {STEPS[step]}</p>
          <div style={{ display: "flex", gap: "6px" }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: "6px", borderRadius: "3px", background: i <= step ? "#1a56db" : "#e2e8f0", transition: "background 0.2s" }} />
            ))}
          </div>
        </div>

        {!isOnboarding && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0 24px" }}>
            <div style={{ flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#059669" : "#1a56db", borderRadius: "3px", transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: pct === 100 ? "#059669" : "#1a56db", flexShrink: 0 }}>{pct}% completo</span>
          </div>
        )}

        {loading ? <Spinner /> : (
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px", marginTop: isOnboarding ? "20px" : 0 }}>

            {/* PASO 0 — Datos personales */}
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>👤 Datos personales</h2>
                <div>
                  <label style={labelStyle}>Nombre completo *</label>
                  <input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Juan Pérez" />
                </div>
                <div>
                  <label style={labelStyle}>Título profesional</label>
                  <input style={inputStyle} value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Ej: Desarrollador Full Stack" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Ciudad</label>
                    <select style={inputStyle} value={form.ciudad} onChange={e => set("ciudad", e.target.value)}>
                      <option value="">Seleccionar</option>
                      {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input style={inputStyle} value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="+591 7XXXXXXX" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>LinkedIn (URL)</label>
                  <input style={inputStyle} value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/tu-perfil" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Disponibilidad</label>
                    <select style={inputStyle} value={form.disponibilidad} onChange={e => set("disponibilidad", e.target.value)}>
                      {["Inmediata","2 semanas","1 mes","A negociar"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Área de interés</label>
                    <select style={inputStyle} value={form.categoria_interes} onChange={e => set("categoria_interes", e.target.value)}>
                      <option value="">Seleccionar</option>
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 1 — Resumen */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>📝 Resumen profesional</h2>
                <p style={{ fontSize: "13px", color: "#64748b", marginTop: "-8px" }}>Una breve presentación que las empresas verán primero.</p>
                <div>
                  <label style={labelStyle}>Cuéntanos sobre ti</label>
                  <textarea style={{ ...inputStyle, minHeight: "160px", resize: "vertical" }} value={form.resumen} onChange={e => set("resumen", e.target.value)} placeholder="Profesional con X años de experiencia en... Apasionado por..." />
                  <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>{form.resumen.length} / 600 caracteres recomendados</p>
                </div>
              </div>
            )}

            {/* PASO 2 — Experiencia y educación */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a", marginBottom: "6px" }}>💼 Experiencia laboral</h2>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>Describe tu trayectoria laboral, formato libre.</p>
                  <textarea style={{ ...inputStyle, minHeight: "140px", resize: "vertical" }} value={form.experiencia} onChange={e => set("experiencia", e.target.value)}
                    placeholder={"2022 - Actual | Desarrollador Senior | Empresa XYZ\n- Responsabilidad 1\n- Responsabilidad 2"} />
                </div>
                <div>
                  <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a", marginBottom: "6px" }}>🎓 Educación</h2>
                  <textarea style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }} value={form.educacion} onChange={e => set("educacion", e.target.value)}
                    placeholder={"2018 - 2022 | Licenciatura en Ingeniería de Sistemas | UMSA"} />
                </div>
              </div>
            )}

            {/* PASO 3 — Habilidades */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>⚡ Habilidades</h2>
                <div>
                  <label style={labelStyle}>Habilidades técnicas y blandas (separadas por coma)</label>
                  <input style={inputStyle} value={form.habilidades} onChange={e => set("habilidades", e.target.value)} placeholder="JavaScript, React, Node.js, Trabajo en equipo, Liderazgo" />
                </div>
                {form.habilidades && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {form.habilidades.split(",").map(h => h.trim()).filter(Boolean).map(h => (
                      <span key={h} style={{ background: "#eff4ff", color: "#1a56db", fontSize: "12px", padding: "4px 12px", borderRadius: "20px", fontWeight: "500" }}>{h}</span>
                    ))}
                  </div>
                )}
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "14px 16px", marginTop: "8px" }}>
                  <p style={{ color: "#065f46", fontSize: "13px" }}>✓ ¡Último paso! Al guardar, tu perfil quedará listo para que las empresas te encuentren.</p>
                </div>
              </div>
            )}

            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "16px" }}>{error}</p>}

            {/* NAV BUTTONS */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "28px", gap: "12px" }}>
              <button onClick={handleBack} disabled={saving} style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "10px", padding: "11px 22px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
                {step === 0 ? "Cancelar" : "← Atrás"}
              </button>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {isOnboarding && step === 0 && (
                  <button onClick={handleSkipOnboarding} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>
                    Hacerlo después
                  </button>
                )}
                <button onClick={handleNext} disabled={saving}
                  style={{ background: saving ? "#93c5fd" : "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "11px 28px", fontWeight: "700", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Guardando..." : step === STEPS.length - 1 ? "Finalizar ✓" : "Siguiente →"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <style>{`@media(max-width:600px){[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f8fafc" }} />}>
      <PerfilWizardContent />
    </Suspense>
  );
}
