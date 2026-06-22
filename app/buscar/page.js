"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar, Footer, JobCard, Spinner } from "@/lib/components";
import { getEmpleos } from "@/lib/supabase";

const CATEGORIAS = ["Tecnología","Ventas","Administración","Marketing","Salud","Educación","Ingeniería","Finanzas","Minería","Telecomunicaciones","Energía","Logística"];
const TIPOS = ["Tiempo completo","Medio tiempo","Remoto","Freelance","Prácticas"];
const DEPARTAMENTOS = ["La Paz","Santa Cruz","Cochabamba","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"];
const EXPERIENCIAS = ["Sin experiencia","Menos de 1 año","1-2 años","3-5 años","Más de 5 años"];
const ESTUDIOS = ["Sin estudios","Secundaria","Técnico","Licenciatura","Postgrado"];

const FilterIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="6" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="7" cy="18" r="1.5" fill="currentColor"/></svg>;

// ─── Una sección de filtro reutilizable (radio buttons) ──────────────────────
function FilterSection({ title, options, value, onChange }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h3 style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a", marginBottom: "12px" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {options.map(opt => (
          <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input type="radio" checked={value === opt} onChange={() => onChange(value === opt ? "" : opt)} style={{ accentColor: "#1a56db", width: "16px", height: "16px" }} />
            <span style={{ fontSize: "14px", color: "#374151" }}>{opt}</span>
          </label>
        ))}
      </div>
      {value && (
        <button onClick={() => onChange("")} style={{ fontSize: "12px", color: "#1a56db", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "8px", fontWeight: "500" }}>
          ✕ Limpiar
        </button>
      )}
    </div>
  );
}

function BuscarContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("q") || "");
  const [location, setLocation] = useState(params.get("ciudad") || "");
  const [categoria, setCategoria] = useState(params.get("categoria") || "");
  const [tipo, setTipo] = useState(params.get("tipo") || "");
  const [experiencia, setExperiencia] = useState(params.get("experiencia") || "");
  const [estudio, setEstudio] = useState(params.get("estudio") || "");
  const [empleos, setEmpleos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const PAGE_SIZE = 12;

  const fetchEmpleos = useCallback(async (reset = true) => {
    setLoading(true);
    try {
      const offset = reset ? 0 : page * PAGE_SIZE;
      const { data, count } = await getEmpleos({ search, location, categoria, tipo, experiencia, estudio, limit: PAGE_SIZE, offset });
      setEmpleos(prev => reset ? (data || []) : [...prev, ...(data || [])]);
      setTotal(count || 0);
      if (reset) setPage(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, location, categoria, tipo, experiencia, estudio, page]);

  useEffect(() => { fetchEmpleos(true); }, [search, location, categoria, tipo, experiencia, estudio]);

  // Bloquea el scroll del fondo mientras el panel de filtros está abierto
  useEffect(() => {
    document.body.style.overflow = filtrosAbiertos ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filtrosAbiertos]);

  const handleSearch = (e) => { e.preventDefault(); fetchEmpleos(true); };

  const filtrosActivos = [location, categoria, tipo, experiencia, estudio].filter(Boolean).length;

  const limpiarTodo = () => { setLocation(""); setCategoria(""); setTipo(""); setExperiencia(""); setEstudio(""); };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* SEARCH HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", padding: "28px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ color: "white", fontWeight: "700", fontSize: "20px", marginBottom: "14px" }}>
            Buscar ofertas de empleo en Bolivia
          </h1>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Puesto, palabra clave, empresa..."
              style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", border: "none", fontSize: "14px", outline: "none" }}
            />
            <button type="submit" style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "10px", padding: "12px 22px", fontWeight: "600", fontSize: "14px", cursor: "pointer", flexShrink: 0 }}>
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 20px 32px" }}>

        {/* CONTADOR + FILTRAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ color: "#0f172a", fontSize: "15px", fontWeight: "600" }}>
            {loading ? "Buscando..." : `${total.toLocaleString("es-BO")} oferta${total === 1 ? "" : "s"}`}
            <span style={{ color: "#64748b", fontWeight: "400" }}> en {location || "todo Bolivia"}</span>
          </p>

          <button onClick={() => setFiltrosAbiertos(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", borderRadius: "20px", border: filtrosActivos > 0 ? "1px solid #1a56db" : "1px solid #cbd5e1", background: filtrosActivos > 0 ? "#eff4ff" : "white", color: filtrosActivos > 0 ? "#1a56db" : "#374151", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            <FilterIcon /> Filtrar {filtrosActivos > 0 && `(${filtrosActivos})`}
          </button>
        </div>

        {/* RESULTS */}
        {loading && empleos.length === 0 ? (
          <Spinner />
        ) : empleos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</p>
            <p style={{ fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>No encontramos ofertas</p>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Intenta con otros términos o elimina algunos filtros</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {empleos.map(job => (
              <JobCard key={job.id} job={job} onClick={() => router.push(`/empleos/${job.id}`)} />
            ))}
            {empleos.length < total && (
              <button
                onClick={() => { setPage(p => p + 1); fetchEmpleos(false); }}
                disabled={loading}
                style={{ padding: "12px", background: "white", border: "2px dashed #cbd5e1", borderRadius: "12px", color: "#64748b", fontSize: "14px", cursor: "pointer", fontWeight: "500" }}
              >
                {loading ? "Cargando..." : `Cargar más (${total - empleos.length} restantes)`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* PANEL DE FILTROS — modal de pantalla completa en móvil, panel lateral en desktop */}
      {filtrosAbiertos && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={() => setFiltrosAbiertos(false)} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.5)" }} />

          <div style={{ position: "relative", background: "white", width: "100%", maxWidth: "420px", height: "100%", overflowY: "auto", boxShadow: "-8px 0 30px rgba(0,0,0,0.15)" }}>
            {/* Header del panel, fijo arriba */}
            <div style={{ position: "sticky", top: 0, background: "white", borderBottom: "1px solid #e2e8f0", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
              <h2 style={{ fontWeight: "700", fontSize: "17px", color: "#0f172a" }}>Filtros</h2>
              <button onClick={() => setFiltrosAbiertos(false)} style={{ background: "none", border: "none", fontSize: "22px", color: "#94a3b8", cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ padding: "20px" }}>
              <FilterSection title="Departamento" options={DEPARTAMENTOS} value={location} onChange={setLocation} />
              <FilterSection title="Categoría" options={CATEGORIAS} value={categoria} onChange={setCategoria} />
              <FilterSection title="Tipo de contrato" options={TIPOS} value={tipo} onChange={setTipo} />
              <FilterSection title="Experiencia" options={EXPERIENCIAS} value={experiencia} onChange={setExperiencia} />
              <FilterSection title="Estudios mínimos" options={ESTUDIOS} value={estudio} onChange={setEstudio} />
            </div>

            {/* Footer del panel, fijo abajo */}
            <div style={{ position: "sticky", bottom: 0, background: "white", borderTop: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", gap: "10px" }}>
              <button onClick={limpiarTodo} disabled={filtrosActivos === 0}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", color: filtrosActivos === 0 ? "#cbd5e1" : "#475569", fontWeight: "600", fontSize: "14px", cursor: filtrosActivos === 0 ? "default" : "pointer" }}>
                Limpiar todo
              </button>
              <button onClick={() => setFiltrosAbiertos(false)}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#1a56db", color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
                Ver {loading ? "..." : total} resultado{total === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f8fafc" }} />}>
      <BuscarContent />
    </Suspense>
  );
}
