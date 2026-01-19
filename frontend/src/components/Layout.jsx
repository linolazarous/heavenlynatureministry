import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Heart, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle header scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu and scroll to top on route change
  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

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
      {/* ================= Header ================= */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md"
            : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Heavenly Nature Ministry"
                className="h-12 w-auto"
                loading="eager"
              />
              <div className="hidden md:block">
                <h1 className="font-heading text-xl font-bold text-primary tracking-tight">
                  Heavenly Nature Ministry
                </h1>
                <p className="text-xs italic text-muted-foreground">
                  We are one
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === path
                      ? "text-primary font-semibold"
                      : "text-foreground/70"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Link to="/prayer">
                <Button variant="outline" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  Prayer
                </Button>
              </Link>
              <Link to="/donations">
                <Button className="btn-accent" size="sm">
                  Donate
                </Button>
              </Link>
              <Link to="/live">
                <Button size="sm">Watch Live</Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="lg:hidden p-2"
              aria-label="Toggle navigation menu"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <nav className="flex flex-col space-y-2 px-4 py-4">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`rounded-lg px-4 py-2 transition-colors ${
                    location.pathname === path
                      ? "bg-primary text-white"
                      : "hover:bg-secondary"
                  }`}
                >
                  {label}
                </Link>
              ))}

              <Link
                to="/prayer"
                className="rounded-lg px-4 py-2 hover:bg-secondary"
              >
                Prayer Requests
              </Link>

              <Link
                to="/donations"
                className="rounded-lg bg-accent px-4 py-2 font-semibold text-black"
              >
                Donate Now
              </Link>

              <Link
                to="/live"
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
              >
                Watch Live
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ================= Main ================= */}
      <main className="mt-20 flex-1">
        <Outlet />
      </main>

      {/* ================= Footer ================= */}
      <footer className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <img
                src="/images/logo.png"
                alt="Heavenly Nature Ministry"
                className="mb-4 h-16 w-auto rounded-lg bg-white p-2"
                loading="lazy"
              />
              <p className="mb-4 text-sm text-white/80">We are one</p>
              <p className="text-sm text-white/70">
                Empowering street children, abandoned children, and orphans to
                become self-reliant and God-fearing citizens.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-heading text-lg font-semibold">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-accent">About Us</Link></li>
                <li><Link to="/sermons" className="hover:text-accent">Sermons</Link></li>
                <li><Link to="/events" className="hover:text-accent">Events</Link></li>
                <li><Link to="/blog" className="hover:text-accent">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-heading text-lg font-semibold">
                Get Involved
              </h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/donations" className="hover:text-accent">Donate</Link></li>
                <li><Link to="/volunteer" className="hover:text-accent">Volunteer</Link></li>
                <li><Link to="/prayer" className="hover:text-accent">Prayer Requests</Link></li>
                <li><Link to="/childrens-ministry" className="hover:text-accent">Children's Ministry</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-heading text-lg font-semibold">
                Contact Us
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <Mail className="mt-1 h-4 w-4" />
                  <a
                    href="mailto:info@heavenlynatureministry.com"
                    className="hover:text-accent"
                  >
                    info@heavenlynatureministry.com
                  </a>
                </li>
                <li className="flex gap-2">
                  <Phone className="mt-1 h-4 w-4" />
                  <a
                    href="tel:+211926006202"
                    className="hover:text-accent"
                  >
                    +211 926 006 202
                  </a>
                </li>
                <li className="text-white/70">
                  Gudele 2, Joppa Block 3, Juba, South Sudan
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-white/20 pt-8 text-center text-sm text-white/70">
            <p>
              &copy; {new Date().getFullYear()} Heavenly Nature Ministry. All
              rights reserved.
            </p>
            <p className="mt-2 italic">
              “For I have given them the glory that you gave me, that they may be
              one as we are one” – John 17:22
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
