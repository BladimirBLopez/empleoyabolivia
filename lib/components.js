"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

// ─── ICONOS SVG (sin dependencias externas) ───────────────────────────────
export const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
export const MapPinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
export const BriefcaseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
export const BellIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);
export const ClockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);
export const TrendingIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/>
  </svg>
);
export const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

// ─── HELPERS ────────────────────────────────────────────────────────────────

export function logoColor(name = "") {
  const colors = ["#1a56db", "#e31f26", "#1a6b3c", "#c8a400", "#7c3aed", "#ea580c", "#0891b2", "#be185d", "#4d7c0f"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function logoLetters(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hora${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} día${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months === 1 ? "" : "es"}`;
}

// ─── BADGE DE ESTADO (para postulaciones) ─────────────────────────────────
const ESTADO_STYLES = {
  pendiente:  { bg: "#fef9c3", color: "#b45309", label: "Pendiente" },
  revisando:  { bg: "#dbeafe", color: "#1e40af", label: "En revisión" },
  entrevista: { bg: "#d1fae5", color: "#065f46", label: "Entrevista" },
  rechazado:  { bg: "#fee2e2", color: "#dc2626", label: "Rechazado" },
  aceptado:   { bg: "#ecfdf5", color: "#059669", label: "Aceptado" },
};

export function EstadoBadge({ estado }) {
  const s = ESTADO_STYLES[estado] || ESTADO_STYLES.pendiente;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

// ─── SPINNER ────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid #e2e8f0", borderTopColor: "#1a56db", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── MENSAJE DE ERROR (cuando falla una consulta a la base de datos) ──────
export function ErrorMessage({ onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px" }}>
      <p style={{ fontSize: "32px", marginBottom: "10px" }}>⚠️</p>
      <p style={{ fontWeight: "600", color: "#991b1b", marginBottom: "6px" }}>No pudimos cargar la información</p>
      <p style={{ color: "#b91c1c", fontSize: "13px", marginBottom: onRetry ? "16px" : 0 }}>Revisa tu conexión a internet e intenta de nuevo.</p>
      {onRetry && (
        <button onClick={onRetry} style={{ background: "#dc2626", color: "white", border: "none", borderRadius: "8px", padding: "9px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          Reintentar
        </button>
      )}
    </div>
  );
}

// ─── JOB CARD (usada en buscar, home, etc.) ───────────────────────────────
export function JobCard({ job, onClick }) {
  const color = logoColor(job.empresa);
  return (
    <div onClick={onClick} className="job-card-shared" style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", cursor: "pointer", transition: "all 0.2s ease", position: "relative" }}>
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
          {logoLetters(job.empresa)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
            <h3 style={{ fontWeight: "600", fontSize: "15px", color: "#0f172a", lineHeight: "1.3" }}>{job.titulo}</h3>
            {job.destacado && (
              <span style={{ background: "#fef3c7", color: "#b45309", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", flexShrink: 0, display: "flex", alignItems: "center", gap: "3px" }}>
                <TrendingIcon size={12} /> Destacado
              </span>
            )}
          </div>
          <p style={{ color: "#475569", fontSize: "13px", marginBottom: "10px" }}>{job.empresa}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
              <MapPinIcon size={14} /> {job.ciudad}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
              <BriefcaseIcon size={14} /> {job.tipo_contrato}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
              <ClockIcon size={14} /> {timeAgo(job.created_at)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "600", fontSize: "13px", color: "#059669" }}>{job.salario || "Salario a convenir"}</span>
            <span style={{ fontSize: "12px", color: "#1a56db", fontWeight: "500" }}>Ver oferta →</span>
          </div>
        </div>
      </div>
      <style>{`.job-card-shared:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-1px); border-color: #cbd5e1; }`}</style>
    </div>
  );
}

// ─── NAVBAR ─────────────────────────────────────────────────────────────────
export function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const role = user?.unsafeMetadata?.role || null;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const CANDIDATO_MENU = [
    { label: "Empleos", icon: "🔍", href: "/buscar" },
    { label: "Mis postulaciones", icon: "📋", href: "/dashboard" },
    { label: "CV / Mi perfil", icon: "📄", href: "/perfil" },
    { label: "Quién me ve", icon: "👁️", soon: true },
    { divider: true },
    { label: "Buscar empresas", icon: "🏢", soon: true },
    { label: "Salarios", icon: "💰", soon: true },
    { label: "Consejos", icon: "💡", soon: true },
    { divider: true },
    { label: "Ajustes", icon: "⚙️", soon: true },
  ];

  const EMPRESA_MENU = [
    { label: "Ofertas publicadas", icon: "📋", href: "/empresa" },
    { label: "Crear oferta", icon: "➕", href: "/publicar" },
    { label: "Candidatos", icon: "👥", href: "/empresa/candidatos" },
    { divider: true },
    { label: "Planes y precios", icon: "💳", soon: true },
    { divider: true },
    { label: "Ajustes", icon: "⚙️", soon: true },
  ];

  const activeMenu = role === "empresa" ? EMPRESA_MENU : CANDIDATO_MENU;

  return (
    <>
      <div style={{ background: "#0f172a", padding: "6px 0", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "12px" }}>
            🇧🇴 <strong style={{ color: "#e2e8f0" }}>+2.400 empresas</strong> confían en EmpleoYaBolivia
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href={isSignedIn && role === "empresa" ? "/empresa" : "/empresa-login"} style={{ color: "#94a3b8", fontSize: "12px", textDecoration: "none" }}>Para Empresas</a>
          </div>
        </div>
      </div>

      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #1a56db, #3b82f6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <BriefcaseIcon size={18} />
            </div>
            <div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "17px", color: "#0f172a", letterSpacing: "-0.3px" }}>EmpleoYa</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "17px", color: "#1a56db", letterSpacing: "-0.3px" }}>Bolivia</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "4px", alignItems: "center" }} className="nav-desktop">
            <a href="/buscar" style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px" }}>Ofertas</a>
            {role === "empresa" ? (
              <>
                <a href="/empresa" style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px" }}>Mis ofertas</a>
                <a href="/publicar" style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px" }}>Publicar</a>
              </>
            ) : role === "candidato" ? (
              <>
                <a href="/dashboard" style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px" }}>Mis postulaciones</a>
                <a href="/perfil" style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px" }}>Mi perfil</a>
              </>
            ) : (
              <a href="/empresa" style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px" }}>Empresas</a>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {!isLoaded ? null : !isSignedIn ? (
              <>
                <button onClick={() => router.push("/empresa-login")} style={{ background: "white", border: "1px solid #1a56db", color: "#1a56db", fontSize: "13px", fontWeight: "600", cursor: "pointer", padding: "8px 16px", borderRadius: "8px" }}>
                  Acceso empresas
                </button>
                <button onClick={() => router.push("/candidato-login")} style={{ background: "#1a56db", border: "none", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", padding: "8px 16px", borderRadius: "8px" }}>
                  Acceso candidatos
                </button>
              </>
            ) : !role ? (
              <button onClick={() => router.push("/elegir-rol")} style={{ background: "#1a56db", border: "none", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", padding: "8px 18px", borderRadius: "8px" }}>
                Completar registro
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }} ref={menuRef}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: role === "empresa" ? "#1a56db" : "#059669", background: role === "empresa" ? "#eff4ff" : "#ecfdf5", padding: "3px 10px", borderRadius: "20px" }}>
                  {role === "empresa" ? "🏢 Empresa" : "🙋 Candidato"}
                </span>

                <div style={{ position: "relative" }}>
                  <div onClick={() => setMenuOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "4px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Avatar" style={{ width: "28px", height: "28px", borderRadius: "50%" }} />
                    ) : (
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1a56db" }} />
                    )}
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#0f172a" }}>{user?.firstName || "Mi cuenta"}</span>
                    <span style={{ fontSize: "10px", color: "#94a3b8", transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
                  </div>

                  {menuOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "white", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0", minWidth: "230px", overflow: "hidden", zIndex: 100 }}>
                      {activeMenu.map((item, i) =>
                        item.divider ? (
                          <div key={i} style={{ borderTop: "1px solid #f1f5f9", margin: "4px 0" }} />
                        ) : (
                          <div
                            key={item.label}
                            onClick={() => { if (item.href) { router.push(item.href); setMenuOpen(false); } }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "11px 16px", cursor: item.soon ? "default" : "pointer", opacity: item.soon ? 0.5 : 1, transition: "background 0.15s" }}
                            onMouseEnter={e => { if (!item.soon) e.currentTarget.style.background = "#f8fafc"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#0f172a", fontWeight: "500" }}>
                              <span style={{ fontSize: "16px" }}>{item.icon}</span> {item.label}
                            </span>
                            {item.soon && <span style={{ fontSize: "10px", color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px" }}>Pronto</span>}
                          </div>
                        )
                      )}
                      <div style={{ borderTop: "1px solid #f1f5f9", margin: "4px 0" }} />
                      <div
                        onClick={() => { signOut(); setMenuOpen(false); }}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", cursor: "pointer", color: "#dc2626", fontSize: "14px", fontWeight: "500" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ fontSize: "16px" }}>🚪</span> Cerrar sesión
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <style>{`@media (max-width: 900px) { .nav-desktop { display: none !important; } }`}</style>
    </>
  );
}

// ─── FOOTER ─────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer style={{ background: "#0f172a", color: "white", padding: "48px 20px 24px", marginTop: "64px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #1a56db, #3b82f6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BriefcaseIcon size={16} />
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "16px" }}>EmpleoYaBolivia</span>
            </div>
            <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.7", maxWidth: "280px" }}>
              El portal de empleos más completo de Bolivia. Conectamos talento con oportunidades reales en todo el país.
            </p>
          </div>
          {[
            { title: "Para candidatos", links: [["Buscar empleo", "/buscar"], ["Mi perfil", "/perfil"], ["Mi dashboard", "/dashboard"]] },
            { title: "Para empresas", links: [["Publicar oferta", "/publicar"], ["Panel de empresa", "/empresa"]] },
            { title: "EmpleoYa", links: [["Inicio", "/"]] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontWeight: "600", fontSize: "13px", color: "#e2e8f0", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{col.title}</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {col.links.map(([label, href]) => (
                  <li key={label}><a href={href} style={{ color: "#64748b", fontSize: "13px", textDecoration: "none" }}>{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ color: "#475569", fontSize: "12px" }}>© 2026 EmpleoYaBolivia · Todos los derechos reservados 🇧🇴</p>
          <p style={{ color: "#334155", fontSize: "12px" }}>Hecho con ❤️ en Bolivia para Bolivia</p>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { footer [style*="grid-template-columns: 2fr 1fr 1fr 1fr"] { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 480px) { footer [style*="grid-template-columns: 2fr 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </footer>
  );
}
