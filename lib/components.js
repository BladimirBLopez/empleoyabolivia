"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ─── ICONOS ────────────────────────────────────────────────────────────────
export const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
export const MapPinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
export const BriefcaseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
export const ClockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
  </svg>
);
export const BellIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
export const UserIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

// ─── HELPERS ───────────────────────────────────────────────────────────────
const PALETTE = ["#0066cc", "#e31f26", "#1a6b3c", "#c8a400", "#7c3aed", "#ea580c", "#1a56db", "#059669", "#b45309", "#475569"];

export function logoColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function logoLetters(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("") || "??";
}

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 2592000) return `hace ${Math.floor(diff / 86400)} d`;
  return new Date(dateStr).toLocaleDateString("es-BO");
}

const ESTADOS = {
  pendiente: { label: "Pendiente", bg: "#fef9c3", color: "#b45309" },
  revisando: { label: "En revisión", bg: "#dbeafe", color: "#1e40af" },
  entrevista: { label: "Entrevista", bg: "#d1fae5", color: "#065f46" },
  rechazado: { label: "Rechazado", bg: "#fee2e2", color: "#dc2626" },
  aceptado: { label: "Aceptado", bg: "#ecfdf5", color: "#059669" },
};

export function EstadoBadge({ estado }) {
  const e = ESTADOS[estado] || ESTADOS.pendiente;
  return (
    <span style={{ background: e.bg, color: e.color, fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap" }}>
      {e.label}
    </span>
  );
}

export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid #e2e8f0", borderTopColor: "#1a56db", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── NAVBAR ────────────────────────────────────────────────────────────────
export function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div style={{ background: "#0f172a", padding: "6px 0", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: "12px" }}>
            🇧🇴 <strong style={{ color: "#e2e8f0" }}>+2.400 empresas</strong> confían en EmpleoYaBolivia
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <a onClick={() => router.push("/empresa")} style={{ color: "#94a3b8", fontSize: "12px", textDecoration: "none", cursor: "pointer" }}>Para Empresas</a>
          </div>
        </div>
      </div>

      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => router.push("/")}>
            <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #1a56db, #3b82f6)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <BriefcaseIcon />
            </div>
            <div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "17px", color: "#0f172a", letterSpacing: "-0.3px" }}>EmpleoYa</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "17px", color: "#1a56db", letterSpacing: "-0.3px" }}>Bolivia</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "4px", alignItems: "center" }} className="nav-desktop">
            <a onClick={() => router.push("/buscar")} style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px", cursor: "pointer" }}>Ofertas</a>
            <a onClick={() => router.push("/empresa")} style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px", cursor: "pointer" }}>Empresas</a>
            {isSignedIn && <a onClick={() => router.push("/dashboard")} style={{ padding: "6px 12px", color: "#475569", fontSize: "14px", fontWeight: "500", textDecoration: "none", borderRadius: "6px", cursor: "pointer" }}>Mi Dashboard</a>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {!isLoaded ? null : !isSignedIn ? (
              <>
                <button onClick={() => openSignIn()} style={{ background: "transparent", border: "none", color: "#475569", fontSize: "14px", fontWeight: "500", cursor: "pointer", padding: "6px 12px", borderRadius: "6px" }}>
                  Iniciar sesión
                </button>
                <button onClick={() => router.push("/publicar")} style={{ background: "#1a56db", border: "none", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", padding: "8px 18px", borderRadius: "8px" }}>
                  Publicar oferta
                </button>
              </>
            ) : (
              <div style={{ position: "relative" }}>
                <div onClick={() => setMenuOpen(m => !m)} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "4px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  {user?.imageUrl
                    ? <img src={user.imageUrl} alt="Avatar" style={{ width: "28px", height: "28px", borderRadius: "50%" }} />
                    : <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1a56db", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><UserIcon size={14} /></div>
                  }
                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#0f172a" }}>{user?.firstName || "Mi cuenta"}</span>
                </div>
                {menuOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: "180px", overflow: "hidden", zIndex: 60 }}>
                    {[
                      ["Mi dashboard", "/dashboard"],
                      ["Mi perfil / CV", "/perfil"],
                      ["Panel de empresa", "/empresa"],
                      ["Publicar oferta", "/publicar"],
                    ].map(([label, href]) => (
                      <div key={href} onClick={() => { setMenuOpen(false); router.push(href); }}
                        style={{ padding: "10px 16px", fontSize: "13px", color: "#374151", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "white"}>
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      <style>{`@media (max-width: 900px) { .nav-desktop { display: none !important; } }`}</style>
    </>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer style={{ background: "#0f172a", color: "white", padding: "48px 20px 24px", marginTop: "64px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ color: "#475569", fontSize: "12px" }}>© 2026 EmpleoYaBolivia · Todos los derechos reservados 🇧🇴</p>
          <p style={{ color: "#334155", fontSize: "12px" }}>Hecho con ❤️ en Bolivia para Bolivia</p>
        </div>
      </div>
    </footer>
  );
}

// ─── JOB CARD ──────────────────────────────────────────────────────────────
export function JobCard({ job, onClick }) {
  const color = logoColor(job.empresa);
  return (
    <div onClick={onClick} className="job-card" style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", cursor: "pointer", position: "relative" }}>
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
          {logoLetters(job.empresa)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
            <h3 style={{ fontWeight: "600", fontSize: "15px", color: "#0f172a", lineHeight: "1.3" }}>{job.titulo}</h3>
            {job.destacado && (
              <span style={{ background: "#fef3c7", color: "#b45309", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", flexShrink: 0 }}>
                Destacado
              </span>
            )}
          </div>
          <p style={{ color: "#475569", fontSize: "13px", marginBottom: "10px" }}>{job.empresa}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}><MapPinIcon size={14} /> {job.ciudad}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}><BriefcaseIcon size={14} /> {job.tipo_contrato}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}><ClockIcon /> {timeAgo(job.created_at)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "600", fontSize: "13px", color: "#059669" }}>{job.salario || "Salario a convenir"}</span>
            <span style={{ fontSize: "12px", color: "#1a56db", fontWeight: "500" }}>Ver oferta →</span>
          </div>
        </div>
      </div>
      <style>{`.job-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-color: #cbd5e1; }`}</style>
    </div>
  );
}
