import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, User, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export function Header() {
  const [location] = useLocation();

  const { data: session } = useQuery({
    queryKey: ['/api/auth/session'],
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/explore" },
    { label: "How It Works", href: "/how-it-works" },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-bold">TrueFund</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "default" : "ghost"}
                size="sm"
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/start-campaign">
            <Button data-testid="button-start-campaign">
              Start a Campaign
            </Button>
          </Link>
          
          {session ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" size="icon" data-testid="button-profile">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut} data-testid="button-signout">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button variant="outline" data-testid="button-signin">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
