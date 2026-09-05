import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100">
      <nav className="border-b border-obsidian-800 px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span className="font-bold tracking-wider uppercase text-slate-100">CapitalGuard</span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-slate-400 space-y-6 text-sm leading-relaxed">
          <p className="text-slate-300 text-base">Last updated: September 2026</p>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">1. Overview</h2>
            <p>CapitalGuard is a financial decision-support and simulation platform developed for demonstration purposes. This policy describes how we handle information when you use the platform.</p>
          </section>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">2. Information We Collect</h2>
            <p>When you create an account, we collect your email address, full name, and optionally your organization and job role. This information is stored securely in Supabase and is used solely to provide platform access.</p>
          </section>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">3. Data Storage</h2>
            <p>Your portfolio data, alerts, decisions, and settings are stored in a Supabase PostgreSQL database with Row Level Security (RLS) enforced. Only you can access your own data.</p>
          </section>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">4. Authentication</h2>
            <p>We use Supabase Authentication. We do not store passwords. All authentication is handled through industry-standard secure token mechanisms.</p>
          </section>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">5. Data Sharing</h2>
            <p>We do not sell, trade, or transfer your information to third parties. Your data is used solely to provide the CapitalGuard service.</p>
          </section>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">6. Disclaimer</h2>
            <p>CapitalGuard is a simulation and decision-support platform. It does not execute real financial transactions, provide licensed financial advice, or manage real funds.</p>
          </section>
        </div>
        <div className="mt-12">
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100">
      <nav className="border-b border-obsidian-800 px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span className="font-bold tracking-wider uppercase text-slate-100">CapitalGuard</span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none text-slate-400 space-y-6 text-sm leading-relaxed">
          <p className="text-slate-300 text-base">Last updated: September 2026</p>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">1. Acceptance</h2>
            <p>By using CapitalGuard, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">2. Platform Purpose</h2>
            <p>CapitalGuard is a financial decision-support and simulation platform built for educational and demonstration purposes. It does not constitute financial advice, and no information provided should be relied upon for real investment decisions.</p>
          </section>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">3. No Real Transactions</h2>
            <p>CapitalGuard does not execute real-world financial transactions. All portfolio operations are simulated. Any results shown are illustrative only.</p>
          </section>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">4. Account Responsibility</h2>
            <p>You are responsible for maintaining the security of your account credentials. You must not share your account with others or use the platform for any unlawful purpose.</p>
          </section>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">5. Limitation of Liability</h2>
            <p>CapitalGuard is provided "as is" without warranty of any kind. The platform developers are not liable for any investment decisions made based on information from this platform.</p>
          </section>
          <section>
            <h2 className="text-slate-200 text-lg font-semibold mb-2">6. Changes</h2>
            <p>We may update these terms at any time. Continued use of the platform after updates constitutes acceptance of the revised terms.</p>
          </section>
        </div>
        <div className="mt-12">
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
