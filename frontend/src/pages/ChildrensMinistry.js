const ChildrensMinistry = () => {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-5xl lg:text-6xl font-bold mb-6">
            Children's Ministry
          </h1>
          <p className="text-xl text-white/90">
            Empowering the next generation with hope and purpose
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="font-heading text-4xl font-bold text-primary mb-4">
                Our Focus
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                We serve street children, abandoned children, and orphans in South
                Sudan, providing them with shelter, education, spiritual guidance,
                and life skills.
              </p>
              <p className="text-lg text-muted-foreground">
                Through God's love and your support, we're transforming lives and
                building a brighter future for these precious children.
              </p>
            </div>

            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
              <img
                src="/images/Children_Smiling.webp"
                alt="Children smiling"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-secondary/30 rounded-xl p-6">
              <h3 className="font-heading text-2xl font-bold text-primary mb-4">
                Education
              </h3>
              <p className="text-muted-foreground">
                Providing quality education and vocational training to equip
                children with skills for self-reliance
              </p>
            </div>

            <div className="bg-secondary/30 rounded-xl p-6">
              <h3 className="font-heading text-2xl font-bold text-primary mb-4">
                Spiritual Growth
              </h3>
              <p className="text-muted-foreground">
                Teaching biblical principles and helping children develop a
                personal relationship with Jesus Christ
              </p>
            </div>

            <div className="bg-secondary/30 rounded-xl p-6">
              <h3 className="font-heading text-2xl font-bold text-primary mb-4">
                Basic Needs
              </h3>
              <p className="text-muted-foreground">
                Ensuring children have access to food, shelter, clothing, and
                healthcare
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl font-bold text-primary mb-6">
            Impact Stories
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            See how your support is changing lives (testimonials coming soon)
          </p>
        </div>
      </section>
    </div>
  );
};

export default ChildrensMinistry;
