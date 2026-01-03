// frontend/src/pages/About.js
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, BookOpen, Globe, Target, Star, Shield, Cross, Book, Users2, Lightbulb, HandHeart } from 'lucide-react';

const About = () => {
  const coreValues = [
    { letter: 'S', meaning: 'Seek God first', scripture: 'Matthew 6:33', description: 'Putting God at the center of everything we do', icon: <Target className="h-8 w-8 text-blue-600" /> },
    { letter: 'E', meaning: 'Evangelism', scripture: 'Matthew 28:19', description: 'Spreading the Gospel to all nations', icon: <Globe className="h-8 w-8 text-green-600" /> },
    { letter: 'E', meaning: 'Excellence', scripture: 'Daniel 5:14, 6:3', description: 'Doing everything with excellence for God\'s glory', icon: <Star className="h-8 w-8 text-yellow-600" /> },
    { letter: 'H', meaning: 'Honor and Humility', scripture: 'Romans 12:10, 1 Peter 5:5', description: 'Respecting others and walking in humility', icon: <Users className="h-8 w-8 text-purple-600" /> },
    { letter: 'I', meaning: 'Integrity', scripture: 'Job 31:6', description: 'Living with honesty and moral uprightness', icon: <Shield className="h-8 w-8 text-indigo-600" /> },
    { letter: 'M', meaning: 'Mentoring', scripture: '2 Timothy 2:2', description: 'Developing leaders through discipleship', icon: <BookOpen className="h-8 w-8 text-pink-600" /> }
  ];

  const objectives = [
    { title: 'Spiritual Foundation', description: 'To win lost souls to Christ and build lives through spiritual teachings', icon: <Cross className="h-6 w-6 text-blue-600" /> },
    { title: 'Leadership Development', description: 'To train and equip community leaders for nation building', icon: <Users2 className="h-6 w-6 text-green-600" /> },
    { title: 'Church Empowerment', description: 'To develop self-reliant churches centered in teaching and care', icon: <Heart className="h-6 w-6 text-purple-600" /> },
    { title: 'Sound Doctrine', description: 'Teaching healthy biblical doctrine for faith and conduct', icon: <Book className="h-6 w-6 text-yellow-600" /> },
    { title: 'Character Transformation', description: 'Promoting change in character, conduct and conversation', icon: <Lightbulb className="h-6 w-6 text-indigo-600" /> },
    { title: 'Community Service', description: 'Serving abandoned children and orphans through life skills', icon: <HandHeart className="h-6 w-6 text-pink-600" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* Hero Section */}
      <section 
        className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-24"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://source.unsplash.com/1600x900/?church)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Our Mission & Vision
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8">
            Empowering generations through faith, education, and community transformation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <a href="#vision" aria-label="Jump to Our Vision section">Our Vision</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="#values" aria-label="Jump to Core Values section">Core Values</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="/contact" aria-label="Go to Contact page">Get Involved</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Vision, Mission, Goals */}
      <section id="vision" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-700 mb-4">Our Foundation</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Drives Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These foundational pillars guide every decision we make and every life we touch
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Our Vision',
                icon: <Target className="h-7 w-7 text-white" />,
                bg: 'from-blue-500 to-blue-600',
                text: 'To raise self-reliant and God fearing generations in South Sudan and beyond.',
                footerIcon: <Heart className="h-4 w-4 mr-2 text-blue-600" />,
                footerText: 'Inspiring future leaders'
              },
              {
                title: 'Our Mission',
                icon: <BookOpen className="h-7 w-7 text-white" />,
                bg: 'from-green-500 to-green-600',
                text: 'Heavenly Nature Ministry exists to empower street/abandoned children and orphans to fully utilize their spiritual, physical and mental gifts to become self-reliant and harmonious citizens in society.',
                footerIcon: <Users className="h-4 w-4 mr-2 text-green-600" />,
                footerText: 'Empowering through education'
              },
              {
                title: 'Our Goals',
                icon: <Target className="h-7 w-7 text-white" />,
                bg: 'from-purple-500 to-purple-600',
                list: [
                  'Empowering children spiritually, physically and mentally',
                  'Teaching obedience and honor for Godʼs word',
                  'Building useful citizens through biblical principles'
                ],
                footerIcon: <HandHeart className="h-4 w-4 mr-2 text-purple-600" />,
                footerText: 'Transformative community impact'
              }
            ].map((item, i) => (
              <Card key={i} className="border-0 hover:shadow-xl transition-transform duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`bg-gradient-to-r ${item.bg} rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4`}>
                    {item.icon}
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {item.text && <p className="text-gray-600 leading-relaxed text-lg">{item.text}</p>}
                  {item.list && (
                    <ul className="space-y-2 text-gray-600">
                      {item.list.map((l, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="bg-purple-100 h-2 w-2 mt-2 rounded-full flex-shrink-0"></span>
                          {l}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-6 pt-6 border-t border-gray-100 flex items-center text-sm text-gray-500">
                    {item.footerIcon}
                    <span>{item.footerText}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section id="values" className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-indigo-100 text-indigo-700 mb-4">S.E.E H.I.M</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide our ministry and define our character
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-white shadow flex items-center justify-center">{value.icon}</div>
                    <Badge className="bg-gray-100 text-gray-800">{value.letter}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2">{value.meaning}</CardTitle>
                  <CardDescription className="mb-3">{value.scripture}</CardDescription>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-700 mb-4">Our Objectives</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Strategic Focus Areas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Specific goals that drive our ministry forward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((obj, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">{obj.icon}</div>
                    <CardTitle className="text-lg">{obj.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{obj.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Be part of transforming lives and building God-fearing generations in South Sudan and beyond
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <a href="/contact" aria-label="Partner with us">Partner With Us</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="/donate" aria-label="Support our work">Support Our Work</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="/events" aria-label="Attend an event">Attend an Event</a>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
