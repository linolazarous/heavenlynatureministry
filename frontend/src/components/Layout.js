import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Heart, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/sermons", label: "Sermons" },
    { path: "/events", label: "Events" },
    { path: "/childrens-ministry", label: "Children's Ministry" },
    { path: "/blog", label: "Blog" },
    { path: "/resources", label: "Resources" },
    { path: "/volunteer", label: "Volunteer" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Heavenly Nature Ministry"
                className="h-12 w-auto"
              />
              <div className="hidden md:block">
                <h1 className="text-xl font-heading font-bold text-primary tracking-tight">
                  Heavenly Nature Ministry
                </h1>
                <p className="text-xs text-muted-foreground italic">We are one</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.path
                      ? "text-primary font-semibold"
                      : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4">
              <Link to="/prayer">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Prayer
                </Button>
              </Link>
              <Link to="/donations">
                <Button className="btn-accent" size="sm">
                  Donate
                </Button>
              </Link>
              <Link to="/live">
                <Button variant="default" size="sm">
                  Watch Live
                </Button>
              </Link>
            </div>

            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <nav className="flex flex-col py-4 px-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`py-2 px-4 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary text-white"
                      : "hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/prayer" className="py-2 px-4 hover:bg-secondary rounded-lg">
                Prayer Requests
              </Link>
              <Link to="/donations" className="py-2 px-4 bg-accent text-black font-semibold rounded-lg">
                Donate Now
              </Link>
              <Link to="/live" className="py-2 px-4 bg-primary text-white font-semibold rounded-lg">
                Watch Live
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 mt-20">
        <Outlet />
      </main>

      <footer className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <img
                src="/images/logo.png"
                alt="Heavenly Nature Ministry"
                className="h-16 w-auto mb-4 bg-white p-2 rounded-lg"
              />
              <p className="text-sm text-white/80 mb-4">We are one</p>
              <p className="text-sm text-white/70">
                Empowering street children, abandoned children, and orphans to become
                self-reliant and God-fearing citizens.
              </p>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-accent">About Us</Link></li>
                <li><Link to="/sermons" className="hover:text-accent">Sermons</Link></li>
                <li><Link to="/events" className="hover:text-accent">Events</Link></li>
                <li><Link to="/blog" className="hover:text-accent">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg mb-4">Get Involved</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/donations" className="hover:text-accent">Donate</Link></li>
                <li><Link to="/volunteer" className="hover:text-accent">Volunteer</Link></li>
                <li><Link to="/prayer" className="hover:text-accent">Prayer Requests</Link></li>
                <li><Link to="/childrens-ministry" className="hover:text-accent">Children's Ministry</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <Mail className="h-4 w-4 mt-1" />
                  <a href="mailto:info@heavenlynatureministry.com" className="hover:text-accent">
                    info@heavenlynatureministry.com
                  </a>
                </li>
                <li className="flex gap-2">
                  <Phone className="h-4 w-4 mt-1" />
                  <a href="tel:+211922273334" className="hover:text-accent">
                    +211 922 273 334
                  </a>
                </li>
                <li className="text-white/70">
                  Gudele 2, Joppa Block 3, Juba, South Sudan
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
            <p>&copy; {new Date().getFullYear()} Heavenly Nature Ministry. All rights reserved.</p>
            <p className="mt-2 italic">
              "For I have given them the glory that you gave me, that they may be one as we are one" – John 17:22
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
