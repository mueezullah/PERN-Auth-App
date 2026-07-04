import { Target, Shield, Zap, Heart, BadgeCheck, Lock, ShieldCheck } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Goal-Oriented',
      description: 'Set clear funding goals and track your progress in real-time with our intuitive dashboard.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Trusted',
      description: 'Bank-level security ensures your funds and data are always protected and encrypted.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Fast Processing',
      description: 'Lightning-fast fund transfers and instant campaign approvals to get you started quickly.',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Community First',
      description: 'Join a supportive community of creators and backers who believe in making dreams happen.',
    }
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 text-sm font-medium uppercase tracking-wider">
            About FundME
          </span>
          <h2 className="text-4xl lg:text-5xl mt-3 mb-6 font-extrabold text-slate-900">
            Empowering Creators, <span className="text-amber-500">One Campaign at a Time</span>
          </h2>
          <p className="text-xl text-slate-600">
            We're revolutionizing the way ideas get funded. Our platform connects verified creators with passionate backers, making it easier than ever to bring innovative projects to life.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Trust panel — replaces stock photo */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-amber-200 rounded-3xl blur-3xl opacity-30"></div>

            <div className="relative bg-slate-900 rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-amber-400 p-2.5 rounded-full">
                  <ShieldCheck className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <p className="text-white font-semibold leading-tight">Verified Trust Layer</p>
                  <p className="text-slate-400 text-xs">Every campaign, checked</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Identity-verified creators</p>
                    <p className="text-slate-400 text-sm">Only KYC-approved users can launch a campaign.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Encrypted transactions</p>
                    <p className="text-slate-400 text-sm">Payments are processed securely end-to-end via Stripe.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Transparent fund tracking</p>
                    <p className="text-slate-400 text-sm">See exactly where every dollar raised is going.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-extrabold text-white">100%</p>
                  <p className="text-xs text-slate-400">Verified creators</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">24/7</p>
                  <p className="text-xs text-slate-400">Fraud monitoring</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">256-bit</p>
                  <p className="text-xs text-slate-400">Encryption</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-3xl font-bold text-slate-900">Why Choose FundME?</h3>
            <p className="text-lg text-slate-600">
              Since our founding, we've been committed to democratizing access to funding. Whether you're launching a tech startup, creative project, or social enterprise, we provide the tools and community support you need to succeed.
            </p>
            <p className="text-lg text-slate-600">
              Our transparent fee structure, powerful analytics, and dedicated support team ensure that you can focus on what matters most — bringing your vision to life.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="inline-flex p-3 rounded-full bg-slate-900 text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h4>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}