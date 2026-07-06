'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Icons } from '@/assets/icons';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setFormData({
            name: data.user.name || '',
            image: data.user.image || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, image: localPreview }))
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      if (res.ok) {
        const result = await res.json();
        setFormData(prev => ({ ...prev, image: result.url }));
        setMessage('IMAGE READY');
      } else {
        setMessage('UPLOAD FAILED');
      }
    } catch (error) {
      setMessage('NETWORK ERROR');
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('SAVING...');

    if (formData.image.startsWith('blob:')) {
      setMessage('WAIT FOR UPLOAD');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev: any) => ({ ...prev, ...data.user }));
        setMessage('PROFILE UPDATED');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('SAVE FAILED');
      }
    } catch (error) {
      setMessage('NETWORK ERROR');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="w-full min-h-screen bg-white">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <div className="px-10 pb-10 pt-[120px] flex items-center gap-3 lg:pt-[140px]">
        <div className="w-1.5 h-1.5 bg-primary-navy animate-ping"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Loading_System_Data</span>
      </div>
    </div>
  );

  if (!user) return (
    <div className="w-full min-h-screen bg-white">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <div className="px-10 pb-10 pt-[120px] text-[10px] font-black uppercase tracking-[0.5em] text-red-500 lg:pt-[140px]">Authentication_Failure</div>
    </div>
  );

  return (
    <main className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <form onSubmit={handleUpdate} className="w-full">
        <div className="px-8 pb-8 pt-[120px] flex flex-col gap-16 lg:px-20 lg:pb-20 lg:pt-[140px]">
          <div className='flex items-center gap-3'>
            <img src={formData.image || "/logo.png"} alt="user-profile-imaeg" className='size-32 object-cover' />

            <label>
              <span className='btn btn-navy'>Upload Image</span>
              <input type="file" name="image" accept='Image/*' onChange={handleImageUpload} hidden />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12">
            <FormInput
              label="Full Display Name"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              placeholder="Enter name..."
            />

            <FormInput
              label="Authorized Email"
              value={user.email}
              disabled
              icon={<Icons.Security size={12} />}
            />

            <FormInput
              label="System Authority"
              value={user.role}
              disabled
            />

            <FormInput
              label="Associated Organization"
              value={user.organization?.name || 'Independent Node'}
              disabled
            />

            <FormInput
              label="Network Status"
              value={user.status.toUpperCase()}
              disabled
            />

            <FormInput
              label="Reference ID [0x]"
              value={user.id}
              disabled
              isMono
            />

          </div>

          {/* Bottom Action Area */}
          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <button
                type="submit"
                disabled={saving || uploading}
                className="btn btn-navy text-[11px] font-black uppercase tracking-[0.3em] px-10 py-5 transition-all hover:bg-black disabled:opacity-50"
              >
                {saving ? 'Synchronizing...' : uploading ? 'Uploading Image...' : 'Save Profile Data'}
              </button>
              {message && (
                <span className="text-[10px] font-black text-primary-navy uppercase tracking-widest animate-pulse">
                  {message}
                </span>
              )}

            </div>

            <div className="flex items-center gap-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              <span>Auth_Protocol_v2.1</span>
              <span>TLS_SECURE_NODE</span>
            </div>
          </div>

        </div>
      </form>
    </main>
  );
}

function FormInput({ label, value, onChange, disabled = false, isMono = false, placeholder = '', icon = null }: {
  label: string,
  value: string,
  onChange?: (val: string) => void,
  disabled?: boolean,
  isMono?: boolean,
  placeholder?: string,
  icon?: React.ReactNode
}) {
  return (
    <div className="space-y-3 group">
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-focus-within:text-primary-navy transition-colors">
          {label}
        </label>
        {icon}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-gray-50/50 border border-gray-100 px-5 py-4 text-sm font-bold transition-all focus:outline-none focus:border-primary-navy focus:bg-white ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800'} ${isMono ? 'font-mono text-xs' : ''}`}
      />
    </div>
  )
}
