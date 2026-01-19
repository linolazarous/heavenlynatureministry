import { useEffect, useState } from "react";
import { getCurrentLivestream } from "@/lib/api";

const LiveStream = () => {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const data = await getCurrentLivestream();
        setStream(data);
      } catch (error) {
        console.error("Error fetching livestream:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStream();
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl lg:text-6xl font-bold mb-6">
            Live Streaming
          </h1>
          <p className="text-xl text-white/90">
            Join us for live Sunday services and special events
          </p>
        </div>
      </section>

      {/* STREAM CONTENT */}
      <section className="section-padding bg-background">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">Loading stream...</p>
            </div>
          ) : stream && stream.id ? (
            <div>
              <div className="aspect-video bg-black rounded-xl overflow-hidden mb-8">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Live stream player will appear here when service starts</p>
                </div>
              </div>
              <div className="text-center">
                <h2 className="font-heading text-3xl font-bold text-primary mb-4">
                  {stream.title}
                </h2>
                <p className="text-lg text-muted-foreground">{stream.description}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="font-heading text-3xl font-bold text-primary mb-4">
                No Live Stream Currently
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join us every Sunday for our live worship service
              </p>
              <p className="text-muted-foreground">
                Check back during service times!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LiveStream;
