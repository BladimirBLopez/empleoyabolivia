"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Lee el rol actual del usuario desde Clerk (unsafeMetadata, editable desde el cliente)
export function useRole() {
  const { user, isLoaded } = useUser();
  const role = user?.unsafeMetadata?.role || null; // "candidato" | "empresa" | null
  return { role, isLoaded, user };
}

// Guarda el rol elegido en el perfil de Clerk del usuario
export async function setRole(user, role) {
  if (!user) return;
  await user.update({
    unsafeMetadata: { ...user.unsafeMetadata, role },
  });
}

// Componente: en cuanto detecta una sesión activa, asigna el rol indicado
// (si aún no lo tenía) y redirige. Se usa dentro de /candidato-login y
// /empresa-login, donde el rol ya está implícito por la URL a la que
// la persona llegó a loguearse o registrarse.
//
// firstTimeRedirectTo: a dónde mandar si es la PRIMERA vez que se le asigna
//   este rol (registro nuevo) — útil para mandar a un onboarding.
// redirectTo: a dónde mandar si YA tenía este rol (alguien que vuelve a
//   loguearse) — el panel normal.
export function AutoAssignRole({ role, redirectTo, firstTimeRedirectTo }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    const current = user.unsafeMetadata?.role;
    if (current === role) {
      router.push(redirectTo);
      return;
    }
    setRole(user, role).then(() => router.push(firstTimeRedirectTo || redirectTo));
  }, [isLoaded, isSignedIn, user, role, redirectTo, firstTimeRedirectTo, router]);

  return null;
}

// Componente: protege una página exigiendo un rol específico. Si el usuario
// no está logueado, lo manda a login; si está logueado pero sin el rol
// correcto, lo redirige a su panel correspondiente. Esta verificación corre
// en el cliente (vía useUser), que sí ve el unsafeMetadata actualizado —
// a diferencia del middleware, que solo ve el JWT de sesión.
export function RequireRole({ role, children }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push(role === "empresa" ? "/empresa-login" : "/candidato-login");
      return;
    }
    const current = user?.unsafeMetadata?.role;
    if (!current) {
      router.push("/elegir-rol");
      return;
    }
    if (current !== role) {
      router.push(current === "empresa" ? "/empresa" : "/dashboard");
    }
  }, [isLoaded, isSignedIn, user, role, router]);

  if (!isLoaded || !isSignedIn || user?.unsafeMetadata?.role !== role) {
    return null;
  }
  return children;
}
