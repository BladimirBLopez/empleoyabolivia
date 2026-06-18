"use client";
import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Navbar, Footer } from "@/lib/components";
import { crearEmpleo } from "@/lib/supabase";

const CATEGORIAS = ["Tecnología","Ventas","Administración","Marketing","Salud","Educación","Ingeniería","Finanzas","Minería","Telecomunicaciones","Energía","Logística"];
const TIPOS = ["Tiempo completo","Medio tiempo","Remoto","Freelance","Prácticas"];
const DEPARTAMENTOS = ["La Paz","Santa Cruz","Cochabamba","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"];

const STEPS = ["Información básica", "Descripción", "Requisitos y beneficios", "Confirmar"];

export default function PublicarPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    titulo: "", empresa: "", ciudad: "", categoria: "", tipo_contrato: "Tiempo completo",
    salario: "", descripcion: "", requisitos: "", beneficios: "", activo: true, destacado: false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      await crearEmpleo({ ...form, clerk_empresa_id: user.id });
      setDone(true);
    } catch (e) {
      setError("Error al publicar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return null;
  if (!isSignedIn) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</p>
        <h2 style={{ fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Inicia sesión para publicar</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Necesitas una cuenta para publicar ofertas de empleo.</p>
        <button onClick={() => openSignIn()} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 32px", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</p>
        <h2 style={{ fontWeight: "700", fontSize: "24px", color: "#0f172a", marginBottom: "8px" }}>¡Oferta publicada!</h2>
        <p style={{ color: "#64748b", marginBottom: "28px" }}>Tu oferta ya está visible para miles de candidatos en Bolivia.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/empresa")} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 28px", fontWeight: "600", cursor: "pointer" }}>
            Ver mis ofertas
          </button>
          <button onClick={() => { setDone(false); setStep(0); setForm({ titulo: "", empresa: "", ciudad: "", categoria: "", tipo_contrato: "Tiempo completo", salario: "", descripcion: "", requisitos: "", beneficios: "", activo: true, destacado: false }); }}
            style={{ background: "white", color: "#1a56db", border: "1px solid #1a56db", borderRadius: "10px", padding: "12px 28px", fontWeight: "600", cursor: "pointer" }}>
            Publicar otra oferta
          </button>
        </div>
      </div>
    </div>
  );

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontWeight: "500", fontSize: "13px", color: "#374151", marginBottom: "6px" };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontWeight: "700", fontSize: "24px", color: "#0f172a", marginBottom: "6px" }}>Publicar oferta de empleo</h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px" }}>Completa los datos para que los candidatos puedan encontrar tu oferta.</p>

        <div style={{ display: "flex", gap: "0", marginBottom: "36px" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: i <= step ? "#1a56db" : "#e2e8f0", color: i <= step ? "white" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600" }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "11px", color: i === step ? "#1a56db" : "#94a3b8", marginTop: "4px", textAlign: "center", fontWeight: i === step ? "600" : "400" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ height: "2px", flex: 1, background: i < step ? "#1a56db" : "#e2e8f0", margin: "0 4px", marginBottom: "20px" }} />}
            </div>
          ))}
        </div>

        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px" }}>
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Título del puesto *</label>
                <input style={inputStyle} value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Ej: Desarrollador Full Stack Senior" />
              </div>
              <div>
                <label style={labelStyle}>Nombre de la empresa *</label>
                <input style={inputStyle} value={form.empresa} onChange={e => set("empresa", e.target.value)} placeholder="Ej: Entel Bolivia" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Ciudad / Departamento *</label>
                  <select style={inputStyle} value={form.ciudad} onChange={e => set("ciudad", e.target.value)}>
                    <option value="">Seleccionar</option>
                    {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select style={inputStyle} value={form.categoria} onChange={e => set("categoria", e.target.value)}>
                    <option value="">Seleccionar</option>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Tipo de contrato *</label>
                  <select style={inputStyle} value={form.tipo_contrato} onChange={e => set("tipo_contrato", e.target.value)}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Salario (opcional)</label>
                  <input style={inputStyle} value={form.salario} onChange={e => set("salario", e.target.value)} placeholder="Ej: Bs. 6.000 – 8.000" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <label style={labelStyle}>Descripción del puesto *</label>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>Describe las responsabilidades, el equipo y el ambiente de trabajo.</p>
              <textarea
                style={{ ...inputStyle, minHeight: "280px", resize: "vertical" }}
                value={form.descripcion}
                onChange={e => set("descripcion", e.target.value)}
                placeholder="Buscamos un profesional dinámico para unirse a nuestro equipo..."
              />
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>{form.descripcion.length} caracteres</p>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label style={labelStyle}>Requisitos</label>
                <textarea style={{ ...inputStyle, minHeight: "160px", resize: "vertical" }} value={form.requisitos} onChange={e => set("requisitos", e.target.value)} placeholder="- Título en Ingeniería de Sistemas&#10;- 2 años de experiencia&#10;- Conocimiento en React y Node.js" />
              </div>
              <div>
                <label style={labelStyle}>Beneficios</label>
                <textarea style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} value={form.beneficios} onChange={e => set("beneficios", e.target.value)} placeholder="Seguro médico privado&#10;Bonos por desempeño&#10;Horario flexible" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ fontWeight: "600", color: "#0f172a", marginBottom: "20px" }}>Confirma tu oferta</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  ["Puesto", form.titulo], ["Empresa", form.empresa], ["Ciudad", form.ciudad],
                  ["Categoría", form.categoria], ["Tipo", form.tipo_contrato], ["Salario", form.salario || "A convenir"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#64748b", fontSize: "13px", minWidth: "100px" }}>{k}</span>
                    <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: "500" }}>{v}</span>
                  </div>
                ))}
              </div>
              {error && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "16px" }}>{error}</p>}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px" }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.4 : 1 }}>
              ← Anterior
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => { if (step === 0 && (!form.titulo || !form.empresa || !form.ciudad || !form.categoria)) { setError("Completa todos los campos obligatorios"); return; } setError(""); setStep(s => s + 1); }}
                style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "8px", padding: "10px 28px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                Siguiente →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={saving}
                style={{ background: saving ? "#93c5fd" : "#059669", color: "white", border: "none", borderRadius: "8px", padding: "10px 28px", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Publicando..." : "✓ Publicar oferta"}
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
