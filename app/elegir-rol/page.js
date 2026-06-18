"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { setRole } from "@/lib/role";
import { Spinner } from "@/lib/components";

export default function ElegirRolPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const elegir = async (role) => {
    setSaving(true);
    await setRole(user, role);
    router.push(role === "empresa" ? "/empresa" : "/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a, #1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "640px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ color: "white", fontWeight: "800", fontSize: "26px", marginBottom: "8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ¡Bienvenido a EmpleoYaBolivia! 🇧🇴
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "15px" }}>Cuéntanos qué buscas para mostrarte lo que necesitas</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <button
            disabled={saving}
            onClick={() => elegir("candidato")}
            style={{ background: "white", border: "none", borderRadius: "16px", padding: "32px 20px", cursor: saving ? "default" : "pointer", textAlign: "center", transition: "transform 0.15s", opacity: saving ? 0.6 : 1 }}
            onMouseEnter={e => !saving && (e.currentTarget.style.transform = "translateY(-4px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "none")}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🙋</div>
            <h3 style={{ fontWeight: "700", fontSize: "17px", color: "#0f172a", marginBottom: "6px" }}>Busco empleo</h3>
            <p style={{ color: "#64748b", fontSize: "13px" }}>Quiero crear mi perfil y postular a ofertas</p>
          </button>

          <button
            disabled={saving}
            onClick={() => elegir("empresa")}
            style={{ background: "white", border: "none", borderRadius: "16px", padding: "32px 20px", cursor: saving ? "default" : "pointer", textAlign: "center", transition: "transform 0.15s", opacity: saving ? 0.6 : 1 }}
            onMouseEnter={e => !saving && (e.currentTarget.style.transform = "translateY(-4px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "none")}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏢</div>
            <h3 style={{ fontWeight: "700", fontSize: "17px", color: "#0f172a", marginBottom: "6px" }}>Busco talento</h3>
            <p style={{ color: "#64748b", fontSize: "13px" }}>Quiero publicar ofertas y encontrar candidatos</p>
          </button>
        </div>

        {saving && <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", marginTop: "20px" }}>Guardando...</p>}
      </div>
    </div>
  );
}
