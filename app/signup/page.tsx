'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    role: 'USER',
    companyName: '',
    companyEmail: '',
    companyAddress: '',
    companyPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'companyName') {
      setFormData(prev => ({ ...prev, companyName: value, organizationName: value }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Request OTP
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, type: 'signup' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      // 2. Store details in sessionStorage to persist through redirect
      sessionStorage.setItem('pending_signup', JSON.stringify(formData));

      // 3. Redirect to verification page
      router.push('/verify-otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-primary-navy p-4 text-center text-white">
          <h1 className="text-3xl font-bold ">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label htmlFor="role" className="text-xs font-bold text-gray-500 uppercase ">
              Account Type
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all bg-white"
              required
            >
              <option value="USER">General User</option>
              <option value="VENDOR">Vendor</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase ">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                required
              />
            </div>
            {formData.role !== 'VENDOR' ? (
              <div className="space-y-1">
                <label htmlFor="organizationName" className="text-xs font-bold text-gray-500 uppercase ">
                  Company Name
                </label>
                <input
                  id="organizationName"
                  type="text"
                  placeholder="Acme Corp"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                  required
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label htmlFor="companyName" className="text-xs font-bold text-gray-500 uppercase ">
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  placeholder="Acme Corp"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                  required
                />
              </div>
            )}
          </div>

          {formData.role === 'VENDOR' && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <p className="text-xs font-black text-primary-navy uppercase tracking-wider">Company Details</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="companyEmail" className="text-xs font-bold text-gray-500 uppercase ">
                    Company Email
                  </label>
                  <input
                    id="companyEmail"
                    type="email"
                    placeholder="contact@company.com"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="companyPhone" className="text-xs font-bold text-gray-500 uppercase ">
                    Company Phone
                  </label>
                  <input
                    id="companyPhone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="companyAddress" className="text-xs font-bold text-gray-500 uppercase ">
                  Company Address
                </label>
                <input
                  id="companyAddress"
                  type="text"
                  placeholder="123 Corporate Blvd, Suite 100"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase ">
              Business Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase ">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-navy text-white rounded-lg font-bold text-sm hover:bg-accent-blue transition-all disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
          >
            {loading ? 'Verifying Email...' : 'Continue to Verification'}
          </button>
        </form>

        <div className="px-8 pb-8 text-center border-t border-gray-50 pt-6 bg-gray-50/50">
          <p className="text-sm text-gray-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-navy font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
