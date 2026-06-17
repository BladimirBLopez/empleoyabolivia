import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "EmpleoYaBolivia 🇧🇴",
  description: "El portal de empleos más rápido de Bolivia",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        // Ocultar todo el branding de Clerk
        baseTheme: undefined,
        elements: {
          card: "shadow-2xl rounded-2xl",
          headerTitle: "text-2xl font-bold text-gray-800",
          headerSubtitle: "text-gray-600",
          socialButtonsBlockButton: "border-2 border-gray-200 hover:border-green-500 transition-all",
          socialButtonsBlockButtonText: "font-semibold text-gray-700",
          formButtonPrimary: "bg-green-500 hover:bg-green-600 text-white font-semibold",
          formFieldInput: "border-2 border-gray-200 focus:border-green-500 rounded-lg",
          footer: "hidden",           // Oculta el footer
          footerAction: "hidden",     // Oculta el texto "Secured by"
          footerActionText: "hidden",
          footerActionLink: "hidden",
          logoBox: "hidden",          // Oculta el logo
          logoImage: "hidden",
          identityPreview: "hidden",  // Oculta la identidad
        },
        layout: {
          unsafe_disableDevelopmentModeWarnings: true, // ¡ESTA ES LA CLAVE!
        },
      }}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
