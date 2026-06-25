import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, FileText, Camera, Clock, CheckCircle2 } from "lucide-react";
import { Navbar } from "../Feed/components/Navbar";
import { Sidebar } from "../Feed/components/Sidebar";

export default function KYCVerification() {
  const navigate = useNavigate();

  const steps = [
    { icon: FileText, title: "Submit Documents", desc: "Provide a valid government-issued ID" },
    { icon: Camera, title: "Face Verification", desc: "Take a quick selfie to match your ID" },
    { icon: Clock, title: "Review Process", desc: "Our team reviews within 24–48 hours" },
    { icon: CheckCircle2, title: "Get Approved", desc: "Start creating campaigns right away" },
  ];

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      <Navbar />

      <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
        {/* Left Sidebar */}
        <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Back Button - Near left sidebar */}
          <div className="w-full pt-8 px-8 lg:px-12">
            <button
              onClick={() => navigate("/feed")}
              className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors group w-fit"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back to Feed</span>
            </button>
          </div>

          <div className="w-full max-w-225 mx-auto flex flex-col flex-1 py-8 px-8">

            {/* KYC Card - Centered Below */}
            <div className="w-full flex-1 flex items-center justify-center pb-20">
              <div className="w-full max-w-140">
                {/* Shield Icon */}
                <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center border-4 border-white shadow-lg">
                    <ShieldCheck className="w-12 h-12 text-amber-500" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center">
                    <span className="text-red-500 text-xs font-black">!</span>
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  KYC Verification Required
                </h1>
                <p className="text-slate-500 text-[15px] leading-relaxed max-w-105 mx-auto">
                  To protect our community and ensure trust, you need to verify your identity before creating fundraising campaigns.
                </p>
              </div>

              {/* Steps */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Verification Steps</p>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                        <step.icon className="w-4 h-4 text-indigo-500" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                      </div>
                      <div className="ml-auto shrink-0">
                        <span className="text-[11px] font-bold text-slate-300">0{i + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-amber-50 border border-amber-200/60 rounded-2xl px-5 py-4 mb-6 flex items-start space-x-3">
                <ShieldCheck className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[13px] text-amber-800 leading-relaxed">
                  Your data is encrypted and stored securely. We never share your information with third parties. Verification typically takes <strong>24–48 hours</strong>.
                </p>
              </div>

              {/* CTA Button */}
              <button
                id="kyc-verify-btn"
                onClick={() => {
                  // Placeholder — KYC system to be implemented
                  alert("KYC verification flow coming soon! Our team will reach out to guide you through the process.");
                }}
                className="w-full py-4 bg-linear-to-r from-indigo-600 to-violet-600 text-white text-[15px] font-bold rounded-2xl hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200 flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Verify My Identity</span>
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                Already submitted?{" "}
                <button className="text-indigo-500 hover:underline font-semibold">Check your status →</button>
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
