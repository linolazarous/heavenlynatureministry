import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, BookOpen, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="about-title">
            About Us
          </h1>
          <p className="text-xl text-blue-100">
            Learn more about our mission, vision, and values
          </p>
        </div>
      </section>

      {/* Vision, Mission and Goal */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  To raise self-reliant and God fearing generations in South Sudan and beyond.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Heavenly Nature Ministry exists to empower street/ abandoned children and orphans to fully utilize their spiritual, physical and mental gifts to become self-reliant and harmonious citizens in society.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  1. Empowering the children spiritually, physically and mentally with the word of God.
                  <br />
                  2. Teaching them to obey and honor Godʼs word in their lives.
                  <br />
                  3. Building people in the word of God to become useful in South Sudan and beyond.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values ( S.E.E H.I.M ) </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>The meaning of S</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  S – Seek God first (Matthew 6:33)
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>The meaning of E</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  E – Evangelism (Matthew 28:19)
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>The meaning of E</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  E – Excellent (Daniel 5:14, 6:3)
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>The meaning of H</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  H – Honor and Humility (Roman 12:10, 1 Peter 5:5)
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>The meaning of I</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  I – Integrity (Job 31:6)
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>The meaning of M</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  M – Mentoring (2Timothy 2:2)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Objectives */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Our Objectives</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-4">
              To win the lost souls to Christ and build their lives in the word of God
              through spiritual teachings, 
              preaching and giving life skills that enhance restoration of peace and
              confidence among the communities;
            </p>
            <p className="text-gray-600 mb-4">
              To train, equip and empower community leaders for nation building
              with knowledge and tools for servant leadership, stewardship, and transformation.
            </p>
            <p className="text-gray-600">
              To advocate for development and self-reliant churches that are multiservice oriented
              centered in teaching, care, harmony and reconciliation for the purpose of reunification
              through divine inspiration of the Bible and its final authority in all matters of faith
              and conduct, character and conversation to do every good work.
            </p>
            <p className="text-gray-600">
              Teaching them (sound and healthy doctrine) the word of God.
            </p>
            <p className="text-gray-600">
              Teaching them (sound and healthy doctrine) the word of God.
            </p>
            <p className="text-gray-600">
              Be submissive to Godʼs authority and his commands.
            </p>
            <p className="text-gray-600">
              Changing in character, conduct and conversation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
