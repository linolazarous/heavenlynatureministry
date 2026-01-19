import { useEffect, useState } from "react";
import { Play, Download, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSermons } from "@/lib/api";

const Sermons = () => {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const data = await getSermons(0, 50);
        setSermons(data);
      } catch (error) {
        console.error("Error fetching sermons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSermons();
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl lg:text-6xl font-bold mb-6">Sermons</h1>
          <p className="text-xl text-white/90">
            Listen to powerful messages that transform lives
          </p>
        </div>
      </section>

      {/* SERMON CARDS */}
      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">Loading sermons...</p>
            </div>
          ) : sermons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sermons.map((sermon) => (
                <Card key={sermon.id} className="card-hover" data-testid={`sermon-card-${sermon.id}`}>
                  <div className="relative aspect-video overflow-hidden rounded-t-xl">
                    <img
                      src={
                        sermon.thumbnail_url ||
                        "https://images.unsplash.com/photo-1716666178997-6e4a056f07d1?crop=entropy&cs=srgb&fm=jpg&q=85"
                      }
                      alt={sermon.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="font-heading line-clamp-2">{sermon.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {sermon.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{sermon.speaker}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(sermon.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {sermon.video_url && (
                        <Button className="flex-1" size="sm" data-testid={`watch-button-${sermon.id}`}>
                          <Play className="h-4 w-4 mr-1" /> Watch
                        </Button>
                      )}
                      {sermon.download_url && (
                        <Button variant="outline" size="sm" data-testid={`download-button-${sermon.id}`}>
                          <Download className="h-4 w-4" /> Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                No sermons available yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Sermons;
