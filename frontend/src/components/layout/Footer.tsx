import { Link } from "react-router-dom";
import { Heart, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Heart className="h-6 w-6 text-primary" fill="currentColor" />
              <span>CareForAll</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering communities through compassionate crowdfunding.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/campaigns" className="hover:text-primary transition-smooth">Browse Campaigns</Link>
              </li>
              <li>
                <Link to="/campaigns/create" className="hover:text-primary transition-smooth">Start a Campaign</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-primary transition-smooth">How It Works</Link>
              </li>
              <li>
                <Link to="/success-stories" className="hover:text-primary transition-smooth">Success Stories</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-primary transition-smooth">Help Center</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-smooth">Contact Us</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-primary transition-smooth">Trust & Safety</Link>
              </li>
              <li>
                <Link to="/fees" className="hover:text-primary transition-smooth">Pricing & Fees</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/terms" className="hover:text-primary transition-smooth">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-smooth">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-primary transition-smooth">Cookie Policy</Link>
              </li>
              <li>
                <Link to="/guidelines" className="hover:text-primary transition-smooth">Community Guidelines</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CareForAll. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
