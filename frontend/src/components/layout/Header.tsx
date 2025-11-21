import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, Search, User } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = false; // TODO: Connect to auth state

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CareForAll
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/campaigns" className="text-sm font-medium hover:text-primary transition-smooth">
            Browse Campaigns
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium hover:text-primary transition-smooth">
            How It Works
          </Link>
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
              <Button asChild className="gradient_hero text-white">
                <Link to="/campaigns/create">Start a Campaign</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="gradient_hero text-white">
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4">
          <nav className="flex flex-col gap-4">
            <Link
              to="/campaigns"
              className="text-sm font-medium hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Campaigns
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-medium hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t">
              {isLoggedIn ? (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button asChild className="gradient_hero text-white">
                    <Link to="/campaigns/create">Start a Campaign</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="gradient_hero text-white">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
