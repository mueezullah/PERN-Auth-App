import { useState } from "react";
import { Menu, X, Wallet, ArrowRight } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export function Navbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // If user is already authenticated and somehow reaches here, redirect them
  const role = localStorage.getItem("role");
  const defaultTarget =
    role === "admin" ? "/admin/dashboard" : role === "user" ? "/feed" : "/";

  if (isAuthenticated) {
    return <Navigate to={defaultTarget} />;
  }

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#campaigns", label: "Campaigns" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative bg-slate-900 p-2 rounded-full ring-2 ring-amber-400 ring-offset-2">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Fund<span className="text-amber-500">ME</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-1"
              >
                {link.label}
                <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-amber-400 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-900 text-sm font-semibold px-4 py-2 transition-colors rounded-full hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="bg-amber-400 text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-amber-300 transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5"
            >
              Sign up <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-slate-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-slate-900" />
            ) : (
              <Menu className="w-6 h-6 text-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-2 space-y-2 border-t border-slate-200">
              <button
                onClick={() => navigate("/login")}
                className="w-full px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 text-sm font-semibold px-4 py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5"
              >
                Sign up <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}