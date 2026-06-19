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
// (si aún no lo tiene) y redirige. Se usa dentro de /candidato-login y
// /empresa-login, donde el rol ya está implícito por la URL a la que
// la persona llegó a loguearse o registrarse.
export function AutoAssignRole({ role, redirectTo }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    const current = user.unsafeMetadata?.role;
    if (current === role) {
      router.push(redirectTo);
      return;
    }
    setRole(user, role).then(() => router.push(redirectTo));
  }, [isLoaded, isSignedIn, user, role, redirectTo, router]);

  return null;
}
