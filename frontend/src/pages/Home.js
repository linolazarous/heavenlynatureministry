import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Heart, Users, BookOpen, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSermons, getEvents } from "@/lib/api";

const Home = () => {
  const [featuredSermon, setFeaturedSermon] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sermonsData, eventsData] = await Promise.all([
          getSermons(0, 1),
          getEvents(0, 3, true),
        ]);
        if (sermonsData.length > 0) setFeaturedSermon(sermonsData[0]);
        setUpcomingEvents(eventsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="hero-section relative" data-testid="hero-section">
        <img
          src="https://images.unsplash.com/photo-1642654877094-e8db202268de?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Worship and Unity"
          className="hero-image"
        />
        <div className="hero-overlay" />
        <div className="hero-content flex items-center justify-center min-h-[90vh] px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <p className="text-accent font-body font-semibold text-sm uppercase tracking-widest mb-4">
              Heavenly Nature Ministry
            </p>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              We Are One
            </h1>
            <p className="text-xl sm:text-2xl mb-4 text-white/90 max-w-2xl mx-auto">
              Empowering street children and orphans to become self-reliant and God-fearing citizens
            </p>
            <p className="text-lg mb-8 text-accent/90 italic font-medium">
              "For I have given them the glory that you gave me, that they may be one as we are one" - John 17:22
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/donations">
                <Button className="btn-accent text-lg px-10 py-6" size="lg" data-testid="hero-donate-button">
                  Make a Difference
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  className="text-lg px-10 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                  size="lg"
                  data-testid="hero-learn-more-button"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-body font-semibold text-sm uppercase tracking-widest mb-2">
              Our Mission
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-primary mb-4">
              Raising Self-Reliant Generations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Through spiritual, physical, and mental empowerment in South Sudan and beyond
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-hover" data-testid="mission-card-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-heading">Spiritual Empowerment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Teaching children to seek God first and build their lives on the solid foundation of His Word
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover" data-testid="mission-card-2">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-heading">Community Building</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Creating harmonious citizens through mentorship, leadership training, and life skills development
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover" data-testid="mission-card-3">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-heading">Excellence & Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Instilling SEE HIM values: Seek God First, Evangelism, Excellence, Honor, Integrity, and Mentoring
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {featuredSermon && (
        <section className="section-padding bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-accent font-body font-semibold text-sm uppercase tracking-widest mb-2">
                  Latest Sermon
                </p>
                <h2 className="font-heading text-4xl font-bold text-primary mb-4">
                  {featuredSermon.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-4">{featuredSermon.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span>{featuredSermon.speaker}</span>
                  <span>•</span>
                  <span>{new Date(featuredSermon.date).toLocaleDateString()}</span>
                  {featuredSermon.duration_minutes && (
                    <>
                      <span>•</span>
                      <span>{featuredSermon.duration_minutes} min</span>
                    </>
                  )}
                </div>
                <Link to="/sermons">
                  <Button className="btn-primary" data-testid="view-sermons-button">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Now
                  </Button>
                </Link>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
                <img
                  src={featuredSermon.thumbnail_url || "https://images.unsplash.com/photo-1716666178997-6e4a056f07d1?crop=entropy&cs=srgb&fm=jpg&q=85"}
                  alt={featuredSermon.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-padding bg-primary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-body font-semibold text-sm uppercase tracking-widest mb-2">
              Upcoming Events
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold mb-4">
              Join Us
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p>Loading events...</p>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white card-hover">
                  <CardHeader>
                    <CardTitle className="font-heading text-white">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 mb-4">{event.description.substring(0, 100)}...</p>
                    <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                    <Link to="/events">
                      <Button variant="outline" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20">
                        Learn More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/70">No upcoming events at the moment. Check back soon!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/events">
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20" size="lg">
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-accent/10 to-secondary/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-primary mb-6">
            Your Support Changes Lives
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Every donation helps us provide shelter, education, and spiritual guidance to street children and orphans in South Sudan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donations">
              <Button className="btn-accent text-lg px-10 py-6" size="lg" data-testid="cta-donate-button">
                Donate Now
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/volunteer">
              <Button variant="outline" className="text-lg px-10 py-6" size="lg" data-testid="cta-volunteer-button">
                Become a Volunteer
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;