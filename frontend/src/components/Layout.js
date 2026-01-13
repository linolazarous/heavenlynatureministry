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
            <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
              <img
                src="https://customer-assets.emergentagent.com/job_a4af4b31-13c8-4eac-ab2c-f23147d650b0/artifacts/edlsvtlw_logo.png"
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
                    location.pathname === link.path ? "text-primary font-semibold" : "text-foreground/70"
                  }`}
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4">
              <Link to="/prayer">
                <Button variant="outline" size="sm" data-testid="prayer-button">
                  <Heart className="h-4 w-4 mr-2" />
                  Prayer
                </Button>
              </Link>
              <Link to="/donations">
                <Button className="btn-accent" size="sm" data-testid="donate-button">
                  Donate
                </Button>
              </Link>
              <Link to="/live">
                <Button variant="default" size="sm" data-testid="live-button">
                  Watch Live
                </Button>
              </Link>
            </div>

            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-button"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t" data-testid="mobile-menu">
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
                src="https://customer-assets.emergentagent.com/job_a4af4b31-13c8-4eac-ab2c-f23147d650b0/artifacts/edlsvtlw_logo.png"
                alt="Heavenly Nature Ministry"
                className="h-16 w-auto mb-4 bg-white p-2 rounded-lg"
              />
              <p className="text-sm text-white/80 mb-4">We are one</p>
              <p className="text-sm text-white/70">
                Empowering street children, abandoned children, and orphans to become self-reliant and
                God-fearing citizens.
              </p>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="hover:text-accent transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/sermons" className="hover:text-accent transition-colors">
                    Sermons
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="hover:text-accent transition-colors">
                    Events
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-accent transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg mb-4">Get Involved</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/donations" className="hover:text-accent transition-colors">
                    Donate
                  </Link>
                </li>
                <li>
                  <Link to="/volunteer" className="hover:text-accent transition-colors">
                    Volunteer
                  </Link>
                </li>
                <li>
                  <Link to="/prayer" className="hover:text-accent transition-colors">
                    Prayer Requests
                  </Link>
                </li>
                <li>
                  <Link to="/childrens-ministry" className="hover:text-accent transition-colors">
                    Children's Ministry
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="mailto:info@heavenlynatureministry.com" className="hover:text-accent">
                    info@heavenlynatureministry.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="tel:+211922273334" className="hover:text-accent">
                    +211 922 273 334
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-white/70">Gudele 2, Joppa Block 3, Juba, South Sudan</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
            <p>&copy; {new Date().getFullYear()} Heavenly Nature Ministry. All rights reserved.</p>
            <p className="mt-2 italic">"For I have given them the glory that you gave me, that they may be one as we are one" - John 17:22</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;