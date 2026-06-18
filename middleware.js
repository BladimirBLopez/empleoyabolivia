import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/buscar(.*)", "/empleos(.*)", "/sign-in(.*)", "/sign-up(.*)", "/elegir-rol"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const url = req.nextUrl;

  // Rutas públicas — sin restricción
  if (isPublicRoute(req)) return NextResponse.next();

  // Sin sesión → login
  if (!userId) {
    const signInUrl = new URL("/sign-in", url);
    signInUrl.searchParams.set("redirect_url", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Con sesión pero sin rol → elegir rol
  const role = sessionClaims?.unsafeMetadata?.role;
  if (!role) {
    return NextResponse.redirect(new URL("/elegir-rol", url));
  }

  // Candidato intentando entrar a rutas de empresa
  const empresaRoutes = ["/empresa", "/publicar"];
  if (role === "candidato" && empresaRoutes.some(r => url.pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  // Empresa intentando entrar a rutas de candidato
  const candidatoRoutes = ["/dashboard", "/perfil"];
  if (role === "empresa" && candidatoRoutes.some(r => url.pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/empresa", url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
