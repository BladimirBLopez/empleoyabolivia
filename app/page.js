"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Empresas destacadas
  const featuredCompanies = [
    { name: "Grupo Salesland", offers: 106, sector: "Ventas" },
    { name: "Entel Bolivia", offers: 45, sector: "Telecomunicaciones" },
    { name: "Banco Fie", offers: 38, sector: "Finanzas" },
    { name: "Tigo Bolivia", offers: 32, sector: "Telecomunicaciones" },
    { name: "YPFB", offers: 28, sector: "Energía" },
    { name: "Comibol", offers: 15, sector: "Minería" },
  ];

  const categories = [
    { name: "Tecnología", icon: "💻", count: 156 },
    { name: "Ventas", icon: "📊", count: 142 },
    { name: "Administración", icon: "📋", count: 98 },
    { name: "Marketing", icon: "📱", count: 76 },
    { name: "Salud", icon: "🏥", count: 54 },
    { name: "Educación", icon: "📚", count: 43 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR - Sin Clerk visible */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇧🇴</span>
              <span className="font-bold text-xl text-green-600">
                EmpleoYaBolivia
              </span>
            </div>
            <div className="flex items-center gap-4">
              {!isSignedIn ? (
                <button 
                  onClick={() => openSignIn()}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-full transition-all shadow-md hover:shadow-lg text-sm"
                >
                  Iniciar sesión
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user?.imageUrl && (
                      <img 
                        src={user.imageUrl} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full border-2 border-green-500"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user?.firstName || "Usuario"}
                    </span>
                  </div>
                  <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium text-sm hidden sm:block">
                    Mi Cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO - Buscador */}
      <section className="bg-gradient-to-r from-green-600 to-green-400 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Encuentra el trabajo ideal en Bolivia
          </h1>
          <p className="text-green-50 text-lg mb-8">
            Explora miles de ofertas de las mejores empresas del país
          </p>
          
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Puesto, empresa o palabra clave"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <input
                type="text"
                placeholder="Ciudad o departamento"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 text-gray-700"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl">
                Buscar ofertas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN: Descarga la app */}
      <section className="bg-white py-12 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📱 Descarga la app y aprovecha todas las oportunidades
          </h2>
          <p className="text-gray-600 mb-6">
            Encuentra trabajo desde tu móvil, donde quieras y cuando quieras
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-md flex items-center gap-2">
              <span className="text-xl">▶️</span> Google Play
            </button>
            <button className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-md flex items-center gap-2">
              <span className="text-xl">🍎</span> App Store
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN: Empresas líderes */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          🏢 Impulsa tu carrera trabajando en una empresa líder
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCompanies.map((company) => (
            <div key={company.name} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{company.name}</h3>
                  <p className="text-sm text-gray-500">{company.sector}</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {company.offers} ofertas
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Seleccionamos, formamos y dirigimos equipos de venta</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN: Categorías */}
      <section className="bg-white py-12 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            🔍 Explora por categoría
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-all cursor-pointer border border-gray-100">
                <span className="text-3xl block mb-2">{cat.icon}</span>
                <h4 className="font-semibold text-gray-700 text-sm">{cat.name}</h4>
                <p className="text-xs text-gray-500">{cat.count} ofertas</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© 2026 EmpleoYaBolivia. Todos los derechos reservados.</p>
          <p className="text-gray-500 text-xs mt-2">El portal de empleos más rápido de Bolivia 🇧🇴</p>
        </div>
      </footer>
    </div>
  );
}
