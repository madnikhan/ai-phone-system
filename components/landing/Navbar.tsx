'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            AI Phone System
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors">How It Works</a>
            <a href="#demo" className="text-gray-700 hover:text-primary-600 transition-colors">Demo</a>
            <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition-colors">Pricing</a>
            <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
            <Link
              href="/phone-demo"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Full Demo
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="#features" className="block py-2 text-gray-700 hover:text-primary-600">Features</a>
            <a href="#how-it-works" className="block py-2 text-gray-700 hover:text-primary-600">How It Works</a>
            <a href="#demo" className="block py-2 text-gray-700 hover:text-primary-600">Demo</a>
            <a href="#pricing" className="block py-2 text-gray-700 hover:text-primary-600">Pricing</a>
            <a href="#contact" className="block py-2 text-gray-700 hover:text-primary-600">Contact</a>
            <Link
              href="/phone-demo"
              className="block py-2 px-4 bg-primary-600 text-white rounded-lg font-semibold text-center"
            >
              Full Demo
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

