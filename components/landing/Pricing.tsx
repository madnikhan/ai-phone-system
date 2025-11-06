'use client'

const plans = [
  {
    name: 'Basic',
    price: '$297',
    period: '/month',
    calls: '500 calls',
    features: [
      '24/7 AI Call Answering',
      'Basic Lead Qualification',
      'Appointment Scheduling',
      'Call Recording',
      'Email Notifications',
      'Basic Analytics',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    price: '$497',
    period: '/month',
    calls: '1,500 calls',
    features: [
      'Everything in Basic',
      'Emergency Detection & Prioritization',
      'Advanced Lead Qualification',
      'Priority Support',
      'Advanced Analytics',
      'Custom Greetings',
      'Multi-Number Support',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$797',
    period: '/month',
    calls: 'Unlimited',
    features: [
      'Everything in Pro',
      'Unlimited Calls',
      'Custom AI Training',
      'Dedicated Account Manager',
      'API Access',
      'White-Label Options',
      'Custom Integrations',
      '24/7 Phone Support',
    ],
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include 24/7 AI call answering.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 border-2 ${
                  plan.popular
                    ? 'border-primary-500 shadow-2xl scale-105'
                    : 'border-gray-200 shadow-lg'
                } hover:shadow-xl transition-shadow`}
              >
                {plan.popular && (
                  <div className="bg-primary-600 text-white text-center py-2 rounded-full mb-4 -mt-4">
                    <span className="text-sm font-bold">MOST POPULAR</span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.calls}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-gray-50 rounded-xl p-6">
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">30-Day Money-Back Guarantee</span> - Try risk-free
            </p>
            <p className="text-sm text-gray-500">
              No setup fees. Cancel anytime. All plans include 24/7 support.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

