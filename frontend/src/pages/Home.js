import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Heart,
  Users,
  BookOpen,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSermons, getEvents } from "@/lib/api";

const Home = () => {
  const [featuredSermon, setFeaturedSermon] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sermons = await getSermons(0, 1);
        const events = await getEvents(0, 3, true);
        if (sermons?.length) setFeaturedSermon(sermons[0]);
        setUpcomingEvents(events || []);
      } catch (err) {
        console.error("Home fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="hero-section relative">
        <img
          src="/images/worship-bg.webp"
          alt="Worship and Unity"
          className="hero-image"
          loading="eager"
        />
        <div className="hero-overlay" />
        <div className="hero-content flex items-center justify-center min-h-[90vh] px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <p className="text-accent font-semibold uppercase tracking-widest mb-4">
              Heavenly Nature Ministry
            </p>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              We Are One
            </h1>
            <p className="text-xl sm:text-2xl mb-4 text-white/90 max-w-2xl mx-auto">
              Empowering street children and orphans to become self-reliant and
              God-fearing citizens
            </p>
            <p className="text-lg mb-8 text-accent/90 italic">
              “That they may be one as we are one” — John 17:22
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donations">
                <Button className="btn-accent px-10 py-6 text-lg">
                  Make a Difference <Heart className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  className="px-10 py-6 text-lg bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="section-padding bg-secondary/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-accent font-semibold uppercase tracking-widest mb-2">
            Our Mission
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-primary mb-4">
            Raising Self-Reliant Generations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Spiritual, physical and mental empowerment in South Sudan and beyond
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <Heart className="h-6 w-6 text-primary mb-3" />
                <CardTitle>Spiritual Empowerment</CardTitle>
              </CardHeader>
              <CardContent>
                Teaching children to seek God first and live by His Word
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Users className="h-6 w-6 text-primary mb-3" />
                <CardTitle>Community Building</CardTitle>
              </CardHeader>
              <CardContent>
                Mentorship, leadership training and life skills development
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <BookOpen className="h-6 w-6 text-primary mb-3" />
                <CardTitle>Excellence & Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                SEE HIM values — Seek God, Evangelism, Excellence, Honor,
                Integrity, Mentoring
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FEATURED SERMON */}
      {featuredSermon && (
        <section className="section-padding bg-background">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent font-semibold uppercase tracking-widest mb-2">
                Latest Sermon
              </p>
              <h2 className="font-heading text-4xl font-bold text-primary mb-4">
                {featuredSermon.title}
              </h2>
              <p className="text-muted-foreground mb-6">
                {featuredSermon.description}
              </p>
              <Link to="/sermons">
                <Button className="btn-primary">
                  <Play className="mr-2 h-4 w-4" /> Watch Now
                </Button>
              </Link>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img
                src={featuredSermon.thumbnail_url}
                alt={featuredSermon.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      )}

      {/* EVENTS */}
      <section className="section-padding bg-primary text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-4xl font-bold text-center mb-12">
            Upcoming Events
          </h2>

          {loading ? (
            <p className="text-center">Loading events…</p>
          ) : upcomingEvents.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="bg-white/10 border-white/20 text-white"
                >
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-white/80">
                      {event.description.slice(0, 100)}…
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.start_date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/70">
              No upcoming events at the moment
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-to-br from-accent/10 to-secondary/30 text-center">
        <h2 className="font-heading text-4xl font-bold text-primary mb-6">
          Your Support Changes Lives
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Every donation provides shelter, education and spiritual guidance
        </p>
        <Link to="/donations">
          <Button className="btn-accent px-10 py-6 text-lg">
            Donate Now <Heart className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
