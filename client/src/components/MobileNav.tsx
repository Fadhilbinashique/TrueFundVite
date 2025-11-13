import { Home, Search, PlusCircle, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/", testId: "nav-home" },
    { icon: Search, label: "Explore", href: "/explore", testId: "nav-explore" },
    { icon: PlusCircle, label: "Start", href: "/start-campaign", testId: "nav-start" },
    { icon: User, label: "Profile", href: "/profile", testId: "nav-profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col h-14 gap-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                data-testid={item.testId}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
