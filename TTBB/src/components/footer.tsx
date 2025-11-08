import Link from 'next/link';
import { Instagram, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-accent">티티빵빵</h3>
            <p className="text-sm text-muted-foreground">
              울산에서 가장 따뜻한 베이킹 클래스
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  소개
                </Link>
              </li>
              <li>
                <Link href="/#classes" className="hover:text-foreground transition-colors">
                  클래스
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="hover:text-foreground transition-colors">
                  후기
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-semibold">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/ttbb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://pf.kakao.com/ttbb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2024 티티빵빵. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
