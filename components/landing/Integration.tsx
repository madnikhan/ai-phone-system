'use client'

export default function Integration() {
  return (
    <section id="integration" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Works with Your Existing Phone System
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            No need to change your current setup. Our AI integrates seamlessly with any phone system.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Setup in 5 Minutes</h3>
              <p className="text-gray-600">Forward your business number to our AI. That's it. No technical expertise required.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🔌</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Hardware Required</h3>
              <p className="text-gray-600">Works entirely in the cloud. Use your existing phone, no new equipment needed.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Works with Any Phone</h3>
              <p className="text-gray-600">Compatible with landlines, mobile phones, and VoIP systems. Universal compatibility.</p>
            </div>
          </div>

          <div className="bg-primary-600 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg mb-6 text-primary-100">
              Set up your AI phone system in minutes. Start capturing more leads today.
            </p>
            <a
              href="#demo"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Try Free Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

