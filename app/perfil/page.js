"use client";
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Navbar, Footer, Spinner } from "@/lib/components";
import { getPerfil, upsertPerfil } from "@/lib/supabase";

const CATEGORIAS = ["Tecnología","Ventas","Administración","Marketing","Salud","Educación","Ingeniería","Finanzas","Minería","Telecomunicaciones","Energía","Logística"];
const DEPARTAMENTOS = ["La Paz","Santa Cruz","Cochabamba","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"];

export default function PerfilPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      await upsertPerfil({ ...form, clerk_user_id: user.id });
      setSaved(true);
    } catch (e) {
      setError("Error al guardar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return null;
  if (!isSignedIn) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: "48px", marginBottom: "16px" }}>👤</p>
        <h2 style={{ fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Tu perfil profesional</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Inicia sesión para crear y gestionar tu CV.</p>
        <button onClick={() => openSignIn()} style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 32px", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontWeight: "500", fontSize: "13px", color: "#374151", marginBottom: "6px" };
  const sectionStyle = { background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" };

  const completeness = [form.nombre, form.titulo, form.ciudad, form.resumen, form.experiencia, form.educacion, form.habilidades].filter(Boolean).length;
  const pct = Math.round((completeness / 7) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontWeight: "700", fontSize: "22px", color: "#0f172a", marginBottom: "4px" }}>Mi perfil profesional</h1>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Esta información se compartirá con las empresas cuando postules.</p>
          </div>
          <button onClick={() => router.push("/dashboard")} style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>
            ← Mi dashboard
          </button>
        </div>

        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 24px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Perfil completado</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: pct === 100 ? "#059669" : "#1a56db" }}>{pct}%</span>
            </div>
            <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#059669" : "#1a56db", borderRadius: "4px", transition: "width 0.3s" }} />
            </div>
          </div>
          {pct < 100 && <span style={{ fontSize: "12px", color: "#64748b", flexShrink: 0 }}>Completa tu perfil para destacar</span>}
          {pct === 100 && <span style={{ fontSize: "18px" }}>⭐</span>}
        </div>

        {loading ? <Spinner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={sectionStyle}>
              <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>👤 Datos personales</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Nombre completo *</label>
                  <input style={inputStyle} value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Juan Pérez" />
                </div>
                <div>
                  <label style={labelStyle}>Título profesional</label>
                  <input style={inputStyle} value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Ej: Desarrollador Full Stack" />
                </div>
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
                <div>
                  <label style={labelStyle}>LinkedIn (URL)</label>
                  <input style={inputStyle} value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/tu-perfil" />
                </div>
                <div>
                  <label style={labelStyle}>Disponibilidad</label>
                  <select style={inputStyle} value={form.disponibilidad} onChange={e => set("disponibilidad", e.target.value)}>
                    {["Inmediata","2 semanas","1 mes","A negociar"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Área de interés</label>
                <select style={inputStyle} value={form.categoria_interes} onChange={e => set("categoria_interes", e.target.value)}>
                  <option value="">Seleccionar</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>📝 Resumen profesional</h2>
              <div>
                <label style={labelStyle}>Cuéntanos sobre ti</label>
                <textarea style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} value={form.resumen} onChange={e => set("resumen", e.target.value)} placeholder="Profesional con X años de experiencia en... Apasionado por..." />
                <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>{form.resumen.length} / 600 caracteres recomendados</p>
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>💼 Experiencia laboral</h2>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "-10px" }}>Describe tu trayectoria laboral. Puedes usar formato libre.</p>
              <textarea style={{ ...inputStyle, minHeight: "180px", resize: "vertical" }} value={form.experiencia} onChange={e => set("experiencia", e.target.value)}
                placeholder="2022 - Actual | Desarrollador Senior | Empresa XYZ&#10;- Responsabilidad 1&#10;- Responsabilidad 2&#10;&#10;2019 - 2022 | Desarrollador Junior | Empresa ABC&#10;- ..." />
            </div>

            <div style={sectionStyle}>
              <h2 style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>🎓 Educación</h2>
              <textarea style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} value={form.educacion} onChange={e => set("educacion", e.target.value)}
                placeholder="2018 - 2022 | Licenciatura en Ingeniería de Sistemas | UMSA&#10;2023 | Certificación en React | Udemy" />
            </div>

            <div style={sectionStyle}>
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
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "14px" }}>
              {saved && <span style={{ color: "#059669", fontSize: "14px", fontWeight: "500" }}>✓ Guardado correctamente</span>}
              {error && <span style={{ color: "#dc2626", fontSize: "13px" }}>{error}</span>}
              <button onClick={handleSave} disabled={saving}
                style={{ background: saving ? "#93c5fd" : "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 32px", fontWeight: "600", fontSize: "15px", cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Guardando..." : "💾 Guardar perfil"}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <style>{`@media(max-width:600px){[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
