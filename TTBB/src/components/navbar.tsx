'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { label: '소개', href: '/about' },
  { label: '클래스', href: '#classes' },
  { label: '후기', href: '#reviews' },
  { label: '문의', href: '#contact' },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-accent">
          티티빵빵
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild variant="default" className="bg-accent hover:bg-accent/90">
            <Link href="#reservation">클래스 신청</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col space-y-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium text-foreground/60 transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild variant="default" className="bg-accent hover:bg-accent/90 w-full">
                <Link href="#reservation">클래스 신청</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
