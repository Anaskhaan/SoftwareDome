import Link from 'next/link';
import { Icons } from '@/assets/icons';

export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'Categories', href: '/categories' },
      { name: 'Top Rated', href: '/top-software' },
      { name: 'Deals', href: '/deals' },
      { name: 'Submit Product', href: '/submit' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Mission', href: '/mission' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ]
  };

  return (
    <footer className="bg-primary-navy text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Brand Info */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="SoftwareDome Logo"
                className="h-14 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              The industry's most trusted verification layer for SaaS tools. We audit, compare, and verify so you don't have to.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Icons.Modular size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Icons.Trending size={18} />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Icons.Security size={18} />
              </Link>
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-bold uppercase  mb-6 text-blue-400">Directory</h4>
              <ul className="flex flex-col gap-4">
                {footerLinks.product.map(link => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-zinc-400 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase  mb-6 text-blue-400">Organization</h4>
              <ul className="flex flex-col gap-4">
                {footerLinks.company.map(link => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-zinc-400 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase  mb-6 text-blue-400">Legal</h4>
              <ul className="flex flex-col gap-4">
                {footerLinks.legal.map(link => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-zinc-400 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-xs">
            © {new Date().getFullYear()} SoftwareDome Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-zinc-500 text-xs font-semibold">
            <span>Verified Registry</span>
            <span>Status: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
