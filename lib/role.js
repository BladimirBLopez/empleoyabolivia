"use client";
import { useUser } from "@clerk/nextjs";

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
