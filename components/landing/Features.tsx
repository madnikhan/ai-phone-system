'use client'

const features = [
  {
    icon: '📞',
    title: '24/7 Call Answering',
    description: 'Never miss a call, even after hours. Our AI answers every call professionally, 24 hours a day, 7 days a week.',
  },
  {
    icon: '🚨',
    title: 'Emergency Detection & Prioritization',
    description: 'Automatically detects emergency calls and prioritizes them for immediate response. Critical situations get handled first.',
  },
  {
    icon: '🎯',
    title: 'Automated Lead Qualification',
    description: 'Intelligently qualifies leads during the call, asking the right questions to determine urgency and service needs.',
  },
  {
    icon: '📅',
    title: 'Instant Appointment Scheduling',
    description: 'Schedule appointments directly during the call. Customers can book their preferred time slot without waiting.',
  },
  {
    icon: '📊',
    title: 'Call Recording & Analytics',
    description: 'Every call is recorded and analyzed. Get insights into call volume, lead quality, and conversion rates.',
  },
  {
    icon: '🤖',
    title: 'Natural Voice AI',
    description: 'Our AI sounds human and handles conversations naturally. Customers won\'t even know they\'re talking to AI.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features for
            <span className="text-primary-600"> Roofing Businesses</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to handle phone calls professionally, capture more leads, and never miss an emergency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

