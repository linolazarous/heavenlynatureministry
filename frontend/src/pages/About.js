const About = () => {
  const values = [
    { letter: "S", title: "Seek God First", scripture: "Matthew 6:33", description: "Making God our priority in all we do" },
    { letter: "E", title: "Evangelism", scripture: "Matthew 28:19", description: "Sharing the gospel with lost souls" },
    { letter: "E", title: "Excellence", scripture: "Daniel 5:14, 6:3", description: "Pursuing excellence in all our work" },
    { letter: "H", title: "Honor & Humility", scripture: "Romans 12:10, 1 Peter 5:5", description: "Treating others with respect and walking in humility" },
    { letter: "I", title: "Integrity", scripture: "Job 31:6", description: "Living with honesty and moral uprightness" },
    { letter: "M", title: "Mentoring", scripture: "2 Timothy 2:2", description: "Investing in the next generation" },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl lg:text-6xl font-bold mb-6">About Us</h1>
          <p className="text-xl text-white/90">Empowering generations through faith, hope, and unity</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4">Our Vision</h2>
            <p className="text-xl text-muted-foreground">
              To raise self-reliant and God-fearing generations in South Sudan and beyond.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4">Our Mission</h2>
            <p className="text-xl text-muted-foreground">
              Heavenly Nature Ministry exists to empower street/abandoned children and orphans to fully utilize their spiritual, physical, and mental gifts to become self-reliant and harmonious citizens in society.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-4xl font-bold text-primary mb-4">Our Goals</h2>
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold">1.</span>
                <span>Empower children spiritually, physically, and mentally with the Word of God</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold">2.</span>
                <span>Teach them to obey and honor God's Word in their lives</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold">3.</span>
                <span>Build people in the Word of God to become useful in South Sudan and beyond</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4">Core Values - SEE HIM</h2>
            <p className="text-lg text-muted-foreground">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl font-heading font-bold text-black">{value.letter}</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-primary mb-2">{value.title}</h3>
                <p className="text-sm text-accent mb-3 italic">{value.scripture}</p>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl font-bold text-primary mb-8 text-center">Our Objectives</h2>
          <div className="space-y-6">
            <div className="bg-secondary/50 rounded-xl p-6">
              <h3 className="font-heading text-xl font-bold text-primary mb-2">Win Lost Souls</h3>
              <p className="text-muted-foreground">
                Win lost souls to Christ and build their lives in the Word of God through spiritual teachings, preaching, and life skills that restore peace and confidence in communities
              </p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-6">
              <h3 className="font-heading text-xl font-bold text-primary mb-2">Train Leaders</h3>
              <p className="text-muted-foreground">
                Train, equip, and empower community leaders for nation building using tools for servant leadership, stewardship, and transformation
              </p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-6">
              <h3 className="font-heading text-xl font-bold text-primary mb-2">Build Churches</h3>
              <p className="text-muted-foreground">
                Advocate for self-reliant, multiservice-oriented churches centered on teaching, care, harmony, and reconciliation through divine inspiration of the Bible
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl font-bold mb-6">Location</h2>
          <p className="text-xl mb-8">Gudele 2, Joppa Block 3, Juba, South Sudan</p>
          <p className="text-lg text-white/80 mb-8">
            Visit us to see firsthand the work we're doing to transform lives in our community
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;