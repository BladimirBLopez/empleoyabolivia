"use client";
import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar, Footer, Spinner, ErrorMessage } from "@/lib/components";
import { getPerfil, upsertPerfil } from "@/lib/supabase";

const CATEGORIAS = ["Tecnología","Ventas","Administración","Marketing","Salud","Educación","Ingeniería","Finanzas","Minería","Telecomunicaciones","Energía","Logística"];
const DEPARTAMENTOS = ["La Paz","Santa Cruz","Cochabamba","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"];
const STEPS = ["Datos personales", "Resumen profesional", "Experiencia y educación", "Habilidades"];

const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.15s" };
const labelStyle = { display: "block", fontWeight: "500", fontSize: "13px", color: "#374151", marginBottom: "6px" };

const EMPTY_FORM = {
  nombre: "", titulo: "", ciudad: "", telefono: "", linkedin: "",
  resumen: "", experiencia: "", educacion: "", habilidades: "",
  disponibilidad: "Inmediata", categoria_interes: "",
};

// ─── SECCIÓN EDITABLE — tarjeta independiente con su propio modo edición ──────
// Cada sección guarda solo su(s) propio(s) campo(s) al tocar Guardar, sin
// afectar al resto del perfil. Esto es lo que imita el patrón de InfoJobs:
// "Experiencia laboral" se edita aparte de "Datos personales".
function SeccionEditable({ titulo, icon, vacio, resumenVista, children, editando, onEditar, onCancelar, onGuardar, guardando }) {
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "22px", marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: editando ? "18px" : "10px" }}>
        <h2 style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{icon}</span> {titulo}
        </h2>
        {!editando && (
          <button onClick={onEditar} style={{ background: "none", border: "none", color: "#1a56db", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            {vacio ? "+ Añadir" : "Editar"}
          </button>
        )}
      </div>

      {editando ? (
        <div>
          {children}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
            <button onClick={onCancelar} disabled={guardando} style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={onGuardar} disabled={guardando} style={{ background: guardando ? "#93c5fd" : "#1a56db", color: "white", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", cursor: guardando ? "not-allowed" : "pointer" }}>
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      ) : vacio ? (
        <p style={{ color: "#94a3b8", fontSize: "13px" }}>No has añadido esta información todavía.</p>
      ) : (
        resumenVista
      )}
    </div>
  );
}

function PerfilContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const role = user?.unsafeMetadata?.role;
  const isOnboarding = params.get("onboarding") === "1";

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // form: lo que está guardado en Supabase. draft: lo que se edita antes de confirmar.
  const [form, setForm] = useState(EMPTY_FORM);
  const [draft, setDraft] = useState(EMPTY_FORM);
  const [seccionActiva, setSeccionActiva] = useState(null); // 'personales' | 'resumen' | 'experiencia' | 'habilidades' | null
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // ── Onboarding (wizard de 4 pasos, solo la primera vez) ──────────────────
  const [step, setStep] = useState(0);
  const [savingStep, setSavingStep] = useState(false);

  const cargarPerfil = () => {
    if (!isSignedIn) return;
    setLoading(true);
    setLoadError(false);
    getPerfil(user.id).then(data => {
      if (data) { setForm(f => ({ ...f, ...data })); setDraft(f => ({ ...f, ...data })); }
    }).catch(e => { console.error(e); setLoadError(true); }).finally(() => setLoading(false));
  };

  useEffect(() => { cargarPerfil(); }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!role) { router.push("/elegir-rol"); return; }
    if (role === "empresa") router.push("/empresa");
  }, [isLoaded, isSignedIn, role, router]);

  // Guarda solo los campos relevantes a la sección activa, partiendo de form
  // (lo ya guardado) + lo editado en draft para esa sección.
  const guardarSeccion = async (campos) => {
    setGuardando(true);
    setError("");
    try {
      const actualizado = { ...form };
      campos.forEach(c => { actualizado[c] = draft[c]; });
      await upsertPerfil({ ...actualizado, clerk_user_id: user.id });
      setForm(actualizado);
      setSeccionActiva(null);
    } catch (e) {
      setError("Error al guardar: " + e.message);
    } finally {
      setGuardando(false);
    }
  };

  const editar = (seccion) => { setDraft(form); setSeccionActiva(seccion); setError(""); };
  const cancelar = () => { setDraft(form); setSeccionActiva(null); setError(""); };
  const setDraftField = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  // ── Lógica del wizard de onboarding ──────────────────────────────────────
  const guardarPasoOnboarding = async () => {
    setSavingStep(true); setError("");
    try {
      await upsertPerfil({ ...draft, clerk_user_id: user.id });
      setForm(draft);
      return true;
    } catch (e) {
      setError("Error al guardar: " + e.message);
      return false;
    } finally {
      setSavingStep(false);
    }
  };

  const handleNextOnboarding = async () => {
    const ok = await guardarPasoOnboarding();
    if (!ok) return;
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else router.push("/dashboard");
  };

  const handleBackOnboarding = () => {
    if (step > 0) setStep(s => s - 1);
    else router.push("/dashboard");
  };

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

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <Spinner />
    </div>
  );
  if (loadError) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 20px" }}>
        <ErrorMessage onRetry={cargarPerfil} />
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ONBOARDING: wizard de 4 pasos, solo la primera vez (?onboarding=1)
  // ═══════════════════════════════════════════════════════════════════════
  if (isOnboarding) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 20px 60px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontWeight: "800", fontSize: "21px", color: "#0f172a", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Completa tu perfil
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Esto ayuda a las empresas a conocerte mejor. Toma menos de 3 minutos.</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>Paso {step + 1}/{STEPS.length} — {STEPS[step]}</p>
            <div style={{ display: "flex", gap: "6px" }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: "6px", borderRadius: "3px", background: i <= step ? "#1a56db" : "#e2e8f0", transition: "background 0.2s" }} />
              ))}
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px" }}>
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>👤 Datos personales</h2>
                <div>
                  <label style={labelStyle}>Nombre completo *</label>
                  <input style={inputStyle} value={draft.nombre} onChange={e => setDraftField("nombre", e.target.value)} placeholder="Juan Pérez" />
                </div>
                <div>
                  <label style={labelStyle}>Título profesional</label>
                  <input style={inputStyle} value={draft.titulo} onChange={e => setDraftField("titulo", e.target.value)} placeholder="Ej: Desarrollador Full Stack" />
                </div>
                <div className="onboarding-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Ciudad</label>
                    <select style={inputStyle} value={draft.ciudad} onChange={e => setDraftField("ciudad", e.target.value)}>
                      <option value="">Seleccionar</option>
                      {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input style={inputStyle} value={draft.telefono} onChange={e => setDraftField("telefono", e.target.value)} placeholder="+591 7XXXXXXX" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>LinkedIn (URL)</label>
                  <input style={inputStyle} value={draft.linkedin} onChange={e => setDraftField("linkedin", e.target.value)} placeholder="https://linkedin.com/in/tu-perfil" />
                </div>
                <div className="onboarding-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Disponibilidad</label>
                    <select style={inputStyle} value={draft.disponibilidad} onChange={e => setDraftField("disponibilidad", e.target.value)}>
                      {["Inmediata","2 semanas","1 mes","A negociar"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Área de interés</label>
                    <select style={inputStyle} value={draft.categoria_interes} onChange={e => setDraftField("categoria_interes", e.target.value)}>
                      <option value="">Seleccionar</option>
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>📝 Resumen profesional</h2>
                <p style={{ fontSize: "13px", color: "#64748b", marginTop: "-8px" }}>Una breve presentación que las empresas verán primero.</p>
                <div>
                  <label style={labelStyle}>Cuéntanos sobre ti</label>
                  <textarea style={{ ...inputStyle, minHeight: "160px", resize: "vertical" }} value={draft.resumen} onChange={e => setDraftField("resumen", e.target.value)} placeholder="Profesional con X años de experiencia en... Apasionado por..." />
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a", marginBottom: "6px" }}>💼 Experiencia laboral</h2>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>Describe tu trayectoria laboral, formato libre.</p>
                  <textarea style={{ ...inputStyle, minHeight: "140px", resize: "vertical" }} value={draft.experiencia} onChange={e => setDraftField("experiencia", e.target.value)}
                    placeholder={"2022 - Actual | Desarrollador Senior | Empresa XYZ\n- Responsabilidad 1\n- Responsabilidad 2"} />
                </div>
                <div>
                  <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a", marginBottom: "6px" }}>🎓 Educación</h2>
                  <textarea style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }} value={draft.educacion} onChange={e => setDraftField("educacion", e.target.value)}
                    placeholder={"2018 - 2022 | Licenciatura en Ingeniería de Sistemas | UMSA"} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>⚡ Habilidades</h2>
                <div>
                  <label style={labelStyle}>Habilidades técnicas y blandas (separadas por coma)</label>
                  <input style={inputStyle} value={draft.habilidades} onChange={e => setDraftField("habilidades", e.target.value)} placeholder="JavaScript, React, Node.js, Trabajo en equipo, Liderazgo" />
                </div>
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "14px 16px", marginTop: "8px" }}>
                  <p style={{ color: "#065f46", fontSize: "13px" }}>✓ ¡Último paso! Al guardar, tu perfil quedará listo para que las empresas te encuentren.</p>
                </div>
              </div>
            )}

            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "16px" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "28px", gap: "12px" }}>
              <button onClick={handleBackOnboarding} disabled={savingStep} style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "10px", padding: "11px 22px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
                {step === 0 ? "Cancelar" : "← Atrás"}
              </button>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {step === 0 && (
                  <button onClick={() => router.push("/dashboard")} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "13px", cursor: "pointer", fontWeight: "500" }}>
                    Hacerlo después
                  </button>
                )}
                <button onClick={handleNextOnboarding} disabled={savingStep}
                  style={{ background: savingStep ? "#93c5fd" : "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "11px 28px", fontWeight: "700", fontSize: "14px", cursor: savingStep ? "not-allowed" : "pointer" }}>
                  {savingStep ? "Guardando..." : step === STEPS.length - 1 ? "Finalizar ✓" : "Siguiente →"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <style>{`@media(max-width:600px){.onboarding-grid{grid-template-columns:1fr!important}}`}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VISTA NORMAL: secciones independientes, estilo InfoJobs
  // ═══════════════════════════════════════════════════════════════════════
  const completeness = [form.nombre, form.titulo, form.ciudad, form.resumen, form.experiencia, form.educacion, form.habilidades].filter(Boolean).length;
  const pct = Math.round((completeness / 7) * 100);
  const habilidadesLista = (form.habilidades || "").split(",").map(h => h.trim()).filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* HEADER tipo InfoJobs: nombre grande + datos de contacto */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#1a56db", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "22px", flexShrink: 0 }}>
                {(form.nombre || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontWeight: "700", fontSize: "19px", color: "#0f172a" }}>{form.nombre || "Sin nombre"}</h1>
                <p style={{ color: "#64748b", fontSize: "13px" }}>{form.titulo || "Sin título profesional"}</p>
              </div>
            </div>
            <button onClick={() => router.push("/dashboard")} style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}>
              ← Mi dashboard
            </button>
          </div>

          {/* Barra de completitud */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "18px" }}>
            <div style={{ flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#059669" : "#1a56db", borderRadius: "3px", transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: pct === 100 ? "#059669" : "#1a56db", flexShrink: 0 }}>{pct}% completo</span>
          </div>
        </div>

        {/* SECCIÓN: Datos personales */}
        <SeccionEditable
          titulo="Datos personales" icon="👤"
          vacio={!form.ciudad && !form.telefono && !form.linkedin}
          editando={seccionActiva === "personales"}
          guardando={guardando}
          onEditar={() => editar("personales")}
          onCancelar={cancelar}
          onGuardar={() => guardarSeccion(["nombre", "titulo", "ciudad", "telefono", "linkedin", "disponibilidad", "categoria_interes"])}
          resumenVista={
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <p style={{ fontSize: "13px", color: "#374151" }}><strong>Ciudad:</strong> {form.ciudad || "—"}</p>
              <p style={{ fontSize: "13px", color: "#374151" }}><strong>Teléfono:</strong> {form.telefono || "—"}</p>
              <p style={{ fontSize: "13px", color: "#374151" }}><strong>Disponibilidad:</strong> {form.disponibilidad || "—"}</p>
              <p style={{ fontSize: "13px", color: "#374151" }}><strong>Área de interés:</strong> {form.categoria_interes || "—"}</p>
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Nombre completo *</label>
              <input style={inputStyle} value={draft.nombre} onChange={e => setDraftField("nombre", e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div>
              <label style={labelStyle}>Título profesional</label>
              <input style={inputStyle} value={draft.titulo} onChange={e => setDraftField("titulo", e.target.value)} placeholder="Ej: Desarrollador Full Stack" />
            </div>
            <div className="perfil-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Ciudad</label>
                <select style={inputStyle} value={draft.ciudad} onChange={e => setDraftField("ciudad", e.target.value)}>
                  <option value="">Seleccionar</option>
                  {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input style={inputStyle} value={draft.telefono} onChange={e => setDraftField("telefono", e.target.value)} placeholder="+591 7XXXXXXX" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>LinkedIn (URL)</label>
              <input style={inputStyle} value={draft.linkedin} onChange={e => setDraftField("linkedin", e.target.value)} placeholder="https://linkedin.com/in/tu-perfil" />
            </div>
            <div className="perfil-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Disponibilidad</label>
                <select style={inputStyle} value={draft.disponibilidad} onChange={e => setDraftField("disponibilidad", e.target.value)}>
                  {["Inmediata","2 semanas","1 mes","A negociar"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Área de interés</label>
                <select style={inputStyle} value={draft.categoria_interes} onChange={e => setDraftField("categoria_interes", e.target.value)}>
                  <option value="">Seleccionar</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </SeccionEditable>

        {/* SECCIÓN: Resumen profesional */}
        <SeccionEditable
          titulo="Resumen profesional" icon="📝"
          vacio={!form.resumen}
          editando={seccionActiva === "resumen"}
          guardando={guardando}
          onEditar={() => editar("resumen")}
          onCancelar={cancelar}
          onGuardar={() => guardarSeccion(["resumen"])}
          resumenVista={<p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", whiteSpace: "pre-line" }}>{form.resumen}</p>}
        >
          <textarea style={{ ...inputStyle, minHeight: "160px", resize: "vertical" }} value={draft.resumen} onChange={e => setDraftField("resumen", e.target.value)} placeholder="Profesional con X años de experiencia en... Apasionado por..." />
        </SeccionEditable>

        {/* SECCIÓN: Experiencia laboral */}
        <SeccionEditable
          titulo="Experiencia laboral" icon="💼"
          vacio={!form.experiencia}
          editando={seccionActiva === "experiencia"}
          guardando={guardando}
          onEditar={() => editar("experiencia")}
          onCancelar={cancelar}
          onGuardar={() => guardarSeccion(["experiencia"])}
          resumenVista={<p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", whiteSpace: "pre-line" }}>{form.experiencia}</p>}
        >
          <textarea style={{ ...inputStyle, minHeight: "140px", resize: "vertical" }} value={draft.experiencia} onChange={e => setDraftField("experiencia", e.target.value)}
            placeholder={"2022 - Actual | Desarrollador Senior | Empresa XYZ\n- Responsabilidad 1\n- Responsabilidad 2"} />
        </SeccionEditable>

        {/* SECCIÓN: Educación */}
        <SeccionEditable
          titulo="Educación" icon="🎓"
          vacio={!form.educacion}
          editando={seccionActiva === "educacion"}
          guardando={guardando}
          onEditar={() => editar("educacion")}
          onCancelar={cancelar}
          onGuardar={() => guardarSeccion(["educacion"])}
          resumenVista={<p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", whiteSpace: "pre-line" }}>{form.educacion}</p>}
        >
          <textarea style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }} value={draft.educacion} onChange={e => setDraftField("educacion", e.target.value)}
            placeholder={"2018 - 2022 | Licenciatura en Ingeniería de Sistemas | UMSA"} />
        </SeccionEditable>

        {/* SECCIÓN: Habilidades */}
        <SeccionEditable
          titulo="Habilidades" icon="⚡"
          vacio={habilidadesLista.length === 0}
          editando={seccionActiva === "habilidades"}
          guardando={guardando}
          onEditar={() => editar("habilidades")}
          onCancelar={cancelar}
          onGuardar={() => guardarSeccion(["habilidades"])}
          resumenVista={
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {habilidadesLista.map(h => (
                <span key={h} style={{ background: "#eff4ff", color: "#1a56db", fontSize: "12px", padding: "4px 12px", borderRadius: "20px", fontWeight: "500" }}>{h}</span>
              ))}
            </div>
          }
        >
          <label style={labelStyle}>Habilidades técnicas y blandas (separadas por coma)</label>
          <input style={inputStyle} value={draft.habilidades} onChange={e => setDraftField("habilidades", e.target.value)} placeholder="JavaScript, React, Node.js, Trabajo en equipo, Liderazgo" />
        </SeccionEditable>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", marginTop: "8px" }}>
            <p style={{ color: "#dc2626", fontSize: "13px" }}>{error}</p>
          </div>
        )}
      </div>
      <Footer />
      <style>{`@media(max-width:600px){.perfil-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f8fafc" }} />}>
      <PerfilContent />
    </Suspense>
  );
}
