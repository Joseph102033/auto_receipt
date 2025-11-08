import Link from 'next/link';
import { Instagram, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-accent">티티빵빵</h3>
            <p className="text-sm text-muted-foreground">
              울산에서 가장 따뜻한 홈베이킹 클래스
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">바로가기</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                홈
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                소개
              </Link>
              <Link
                href="/classes"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                클래스
              </Link>
              <Link
                href="/reviews"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                후기
              </Link>
              <Link
                href="/reservation"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                예약
              </Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="font-semibold">연락처</h4>
            <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>울산광역시</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:contact@ttbbang.com"
                  className="hover:text-foreground transition-colors"
                >
                  contact@ttbbang.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <a
                  href="https://instagram.com/ttbbang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  @ttbbang
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2024 티티빵빵. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-foreground transition-colors">
                이용약관
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
