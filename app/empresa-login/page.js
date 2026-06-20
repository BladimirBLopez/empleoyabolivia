"use client";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { AutoAssignRole } from "@/lib/role";

export default function EmpresaLoginPage() {
  const { isSignedIn } = useUser();
  const [mode, setMode] = useState("sign-in");

  const appearance = {
    elements: {
      card: "shadow-2xl rounded-2xl max-w-md w-full",
      headerTitle: "text-2xl font-bold text-gray-800",
      headerSubtitle: "text-gray-600",
      socialButtonsBlockButton: "border-2 border-gray-200 hover:border-amber-500 transition-all",
      formButtonPrimary: "bg-[#1a56db] hover:bg-[#0f3d9e] text-white",
      footer: "hidden",
      logoBox: "hidden",
      logoImage: "hidden",
      identityPreview: "hidden",
      footerAction: "hidden",
      footerActionText: "hidden",
      footerActionLink: "hidden",
      rootBox: "w-full max-w-md mx-auto",
      formField: "w-full",
      formFieldInput: "w-full border-2 border-gray-200 focus:border-amber-500 rounded-lg",
    },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", fontFamily: "'Inter', sans-serif" }}>
      {isSignedIn && <AutoAssignRole role="empresa" redirectTo="/empresa" />}

      {/* Panel izquierdo — beneficios (solo desktop) */}
      <div className="empresa-side-panel" style={{ flex: "1", background: "linear-gradient(135deg, #1a56db, #0f3d9e)", padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px", textDecoration: "none" }}>
          <div style={{ width: "38px", height: "38px", background: "rgba(255,255,255,0.15)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "19px", color: "white" }}>EmpleoYaBolivia</span>
        </a>

        <span style={{ background: "rgba(245,158,11,0.2)", color: "#fbbf24", fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", width: "fit-content", marginBottom: "16px" }}>PARA EMPRESAS</span>
        <h1 style={{ color: "white", fontWeight: "800", fontSize: "30px", lineHeight: "1.2", marginBottom: "16px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Encuentra el talento que tu empresa necesita
        </h1>
        <p style={{ color: "#bfdbfe", fontSize: "15px", marginBottom: "36px" }}>
          Publica ofertas, gestiona candidatos y haz crecer tu equipo con el portal de empleos más completo de Bolivia.
        </p>

        {[
          ["🎯", "Candidatos verificados en toda Bolivia"],
          ["⚡", "Publica tu oferta en minutos"],
          ["📊", "Panel de gestión de postulaciones"],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <span style={{ fontSize: "20px" }}>{icon}</span>
            <span style={{ color: "#dbeafe", fontSize: "14px" }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Panel derecho — formulario */}
      <div style={{ flex: "1", background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "30px", marginBottom: "6px" }}>🏢</div>
          <h2 style={{ color: "#0f172a", fontWeight: "700", fontSize: "20px", marginBottom: "4px" }}>Acceso empresas</h2>
          <p style={{ color: "#64748b", fontSize: "13px" }}>Gestiona tus ofertas y candidatos</p>
        </div>

        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "10px", padding: "4px", marginBottom: "24px" }}>
          <button onClick={() => setMode("sign-in")} style={{ padding: "8px 24px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: mode === "sign-in" ? "white" : "transparent", color: mode === "sign-in" ? "#0f172a" : "#64748b", boxShadow: mode === "sign-in" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            Iniciar sesión
          </button>
          <button onClick={() => setMode("sign-up")} style={{ padding: "8px 24px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: mode === "sign-up" ? "white" : "transparent", color: mode === "sign-up" ? "#0f172a" : "#64748b", boxShadow: mode === "sign-up" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            Crear cuenta empresa
          </button>
        </div>

        {mode === "sign-in" ? (
          <SignIn key="sign-in" appearance={appearance} routing="virtual" forceRedirectUrl="/empresa-login" />
        ) : (
          <SignUp key="sign-up" appearance={appearance} routing="virtual" forceRedirectUrl="/empresa-login" />
        )}

        <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "24px", textAlign: "center" }}>
          ¿Buscas empleo? <a href="/candidato-login" style={{ color: "#1a56db", textDecoration: "none", fontWeight: "600" }}>Accede aquí</a>
        </p>
      </div>

      <style>{`@media (max-width: 900px) { .empresa-side-panel { display: none !important; } }`}</style>
    </div>
  );
}
