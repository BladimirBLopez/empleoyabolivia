import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-500 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">🇧🇴 EmpleoYaBolivia</h1>
        <p className="text-green-50 mt-2">Inicia sesión para encontrar tu próximo trabajo</p>
      </div>
      <SignIn 
        appearance={{
          elements: {
            card: "shadow-2xl rounded-2xl max-w-md w-full",
            headerTitle: "text-2xl font-bold text-gray-800",
            headerSubtitle: "text-gray-600",
            socialButtonsBlockButton: "border-2 border-gray-200 hover:border-green-500 transition-all",
            formButtonPrimary: "bg-green-500 hover:bg-green-600 text-white",
            footer: "hidden",           // Oculta el footer completo
            logoBox: "hidden",          // Oculta el logo de Clerk
            logoImage: "hidden",        // Oculta la imagen del logo
            identityPreview: "hidden",  // Oculta la vista previa de identidad
            footerAction: "hidden",     // Oculta el texto de "Secured by"
            footerActionText: "hidden", // Oculta el texto del footer
            footerActionLink: "hidden", // Oculta el enlace del footer
            rootBox: "w-full max-w-md mx-auto",
            formField: "w-full",
            formFieldInput: "w-full border-2 border-gray-200 focus:border-green-500 rounded-lg",
          }
        }}
      />
    </div>
  );
}
