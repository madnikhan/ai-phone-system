'use client'

import { useState } from 'react'
import CompactPhoneDemo from './CompactPhoneDemo'

export default function PhoneDemoSection() {
  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Try Our AI Phone System
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Test our AI with these common scenarios. See how it handles emergency calls, qualifies leads, and schedules appointments.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <CompactPhoneDemo />
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want to see the full demo? <a href="/phone-demo" className="text-primary-600 font-semibold hover:underline">View Full Demo Page</a>
          </p>
        </div>
      </div>
    </section>
  )
}

