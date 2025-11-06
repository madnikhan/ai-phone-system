'use client'

const steps = [
  {
    number: '01',
    title: 'Forward Your Business Number',
    description: 'Connect your existing phone number to our AI system. No hardware changes needed - works with any phone system.',
    icon: '📱',
  },
  {
    number: '02',
    title: 'AI Answers Calls Professionally 24/7',
    description: 'Our AI assistant answers every call, handles inquiries, qualifies leads, and schedules appointments automatically.',
    icon: '🤖',
  },
  {
    number: '03',
    title: 'Get Qualified Leads Delivered Instantly',
    description: 'Receive instant notifications with qualified leads, appointment details, and emergency alerts delivered to your inbox.',
    icon: '📧',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes. No technical expertise required.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl p-8 text-center hover:shadow-xl transition-shadow border border-primary-100">
                  <div className="text-6xl mb-4">{step.icon}</div>
                  <div className="absolute top-4 right-4 text-6xl font-bold text-primary-200 opacity-50">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <svg className="w-8 h-8 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 bg-primary-50 rounded-lg p-6">
              <div className="text-4xl">⚡</div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-lg">Easy Setup in 5 Minutes</p>
                <p className="text-gray-600">No hardware required. Works with your existing phone system.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

