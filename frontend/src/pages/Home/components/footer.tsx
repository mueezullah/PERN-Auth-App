import { Wallet, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-slate-800 p-2 rounded-full ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900">
                <Wallet className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Fund<span className="text-amber-500">ME</span>
              </span>
            </div>
            <p className="text-slate-400">
              Empowering creators and entrepreneurs to turn their dreams into reality through transparent, trust-based crowdfunding.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-amber-400 hover:text-slate-900 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-amber-400 hover:text-slate-900 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-amber-400 hover:text-slate-900 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-slate-800 hover:bg-amber-400 hover:text-slate-900 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a  className="hover:text-amber-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#campaigns" className="hover:text-amber-400 transition-colors">
                  Browse Campaigns
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Trust & Safety
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                <span>123 Innovation Street, Silicon Valley, CA 94025</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                <a href="mailto:hello@fundme.com" className="hover:text-amber-400 transition-colors">
                  hello@fundme.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                <a href="tel:+1234567890" className="hover:text-amber-400 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} FundME. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-amber-400 transition-colors">
                Accessibility
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                Sitemap
              </a>
              <a href="#" className="hover:text-amber-400 transition-colors">
                Partners
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}