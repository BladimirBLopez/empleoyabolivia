"use client";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { AutoAssignRole } from "@/lib/role";

export default function CandidatoLoginPage() {
  const { isSignedIn } = useUser();
  const [mode, setMode] = useState("sign-in"); // "sign-in" | "sign-up"

  const appearance = {
    elements: {
      card: "shadow-2xl rounded-2xl max-w-md w-full",
      headerTitle: "text-2xl font-bold text-gray-800",
      headerSubtitle: "text-gray-600",
      socialButtonsBlockButton: "border-2 border-gray-200 hover:border-blue-500 transition-all",
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
      formFieldInput: "w-full border-2 border-gray-200 focus:border-blue-500 rounded-lg",
    },
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a, #1e3a5f, #1a56db)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: "'Inter', sans-serif" }}>
      {isSignedIn && <AutoAssignRole role="candidato" redirectTo="/dashboard" firstTimeRedirectTo="/perfil?onboarding=1" />}

      <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px", textDecoration: "none" }}>
        <div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #1a56db, #3b82f6)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: "800", fontSize: "19px", color: "white" }}>EmpleoYa<span style={{ color: "#60a5fa" }}>Bolivia</span></span>
      </a>

      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "32px", marginBottom: "6px" }}>🙋</div>
        <h1 style={{ color: "white", fontWeight: "700", fontSize: "21px", marginBottom: "4px" }}>Acceso candidatos</h1>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>Encuentra tu próximo trabajo en Bolivia</p>
      </div>

      <div style={{ display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "4px", marginBottom: "24px" }}>
        <button onClick={() => setMode("sign-in")} style={{ padding: "8px 24px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: mode === "sign-in" ? "white" : "transparent", color: mode === "sign-in" ? "#0f172a" : "#cbd5e1" }}>
          Iniciar sesión
        </button>
        <button onClick={() => setMode("sign-up")} style={{ padding: "8px 24px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: mode === "sign-up" ? "white" : "transparent", color: mode === "sign-up" ? "#0f172a" : "#cbd5e1" }}>
          Crear cuenta
        </button>
      </div>

      {mode === "sign-in" ? (
        <SignIn key="sign-in" appearance={appearance} routing="virtual" forceRedirectUrl="/candidato-login" />
      ) : (
        <SignUp key="sign-up" appearance={appearance} routing="virtual" forceRedirectUrl="/candidato-login" />
      )}

      <p style={{ color: "#64748b", fontSize: "12px", marginTop: "24px", textAlign: "center" }}>
        ¿Eres una empresa? <a href="/empresa-login" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: "600" }}>Accede aquí</a>
      </p>
    </div>
  );
}
