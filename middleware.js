import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/buscar(.*)",
  "/empleos(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/elegir-rol",
  "/candidato-login(.*)",
  "/empresa-login(.*)",
]);

// El middleware corre en el Edge y solo ve el JWT de sesión, que por defecto
// NO incluye unsafeMetadata. Por eso aquí solo verificamos que haya sesión
// activa (protección básica). La lógica fina de rol (candidato vs empresa)
// se valida dentro de cada página con useUser(), que sí tiene acceso completo
// al perfil actualizado del usuario.
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl;

  if (isPublicRoute(req)) return NextResponse.next();

  if (!userId) {
    const signInUrl = new URL("/candidato-login", url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
