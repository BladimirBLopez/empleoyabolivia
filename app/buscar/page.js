"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar, Footer, JobCard, Spinner } from "@/lib/components";
import { getEmpleos } from "@/lib/supabase";

const CATEGORIAS = ["Tecnología","Ventas","Administración","Marketing","Salud","Educación","Ingeniería","Finanzas","Minería","Telecomunicaciones","Energía","Logística"];
const TIPOS = ["Tiempo completo","Medio tiempo","Remoto","Freelance","Prácticas"];
const DEPARTAMENTOS = ["La Paz","Santa Cruz","Cochabamba","Oruro","Potosí","Sucre","Tarija","Trinidad","Cobija"];

export default function BuscarPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get("q") || "");
  const [location, setLocation] = useState(params.get("ciudad") || "");
  const [categoria, setCategoria] = useState(params.get("categoria") || "");
  const [tipo, setTipo] = useState(params.get("tipo") || "");
  const [empleos, setEmpleos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 12;

  const fetchEmpleos = useCallback(async (reset = true) => {
    setLoading(true);
    try {
      const offset = reset ? 0 : page * PAGE_SIZE;
      const { data, count } = await getEmpleos({ search, location, categoria, tipo, limit: PAGE_SIZE, offset });
      setEmpleos(prev => reset ? (data || []) : [...prev, ...(data || [])]);
      setTotal(count || 0);
      if (reset) setPage(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, location, categoria, tipo, page]);

  useEffect(() => { fetchEmpleos(true); }, [search, location, categoria, tipo]);

  const handleSearch = (e) => { e.preventDefault(); fetchEmpleos(true); };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", padding: "32px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ color: "white", fontWeight: "700", fontSize: "22px", marginBottom: "16px" }}>
            Buscar ofertas de empleo en Bolivia
          </h1>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Puesto, empresa o habilidad..."
              style={{ flex: "1 1 220px", padding: "10px 16px", borderRadius: "8px", border: "none", fontSize: "14px", outline: "none" }}
            />
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={{ flex: "1 1 150px", padding: "10px 16px", borderRadius: "8px", border: "none", fontSize: "14px", cursor: "pointer" }}
            >
              <option value="">Todo Bolivia</option>
              {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button type="submit" style={{ background: "#1a56db", color: "white", border: "none", borderRadius: "8px", padding: "10px 24px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
              Buscar
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px", display: "grid", gridTemplateColumns: "240px 1fr", gap: "28px" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a", marginBottom: "14px" }}>Tipo de contrato</h3>
            {TIPOS.map(t => (
              <label key={t} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "8px" }}>
                <input type="radio" name="tipo" checked={tipo === t} onChange={() => setTipo(tipo === t ? "" : t)} style={{ accentColor: "#1a56db" }} />
                <span style={{ fontSize: "13px", color: "#475569" }}>{t}</span>
              </label>
            ))}
            {tipo && <button onClick={() => setTipo("")} style={{ fontSize: "12px", color: "#1a56db", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ Limpiar</button>}
          </div>

          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a", marginBottom: "14px" }}>Categoría</h3>
            {CATEGORIAS.map(c => (
              <label key={c} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "8px" }}>
                <input type="radio" name="cat" checked={categoria === c} onChange={() => setCategoria(categoria === c ? "" : c)} style={{ accentColor: "#1a56db" }} />
                <span style={{ fontSize: "13px", color: "#475569" }}>{c}</span>
              </label>
            ))}
            {categoria && <button onClick={() => setCategoria("")} style={{ fontSize: "12px", color: "#1a56db", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ Limpiar</button>}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              {loading ? "Buscando..." : <><strong style={{ color: "#0f172a" }}>{total}</strong> ofertas encontradas</>}
            </p>
          </div>

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
      </div>
      <Footer />

      <style>{`@media(max-width:700px){[style*="grid-template-columns: 240px"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
