import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, BookOpen, Globe, Target, Star, Shield, ArrowRight, Home, School, HandHeart, Cross, Book, Users2, Lightbulb } from 'lucide-react';

const About = () => {
  const coreValues = [
    { 
      letter: 'S', 
      meaning: 'Seek God first', 
      scripture: 'Matthew 6:33',
      description: 'Putting God at the center of everything we do',
      icon: <Target className="h-8 w-8" />
    },
    { 
      letter: 'E', 
      meaning: 'Evangelism', 
      scripture: 'Matthew 28:19',
      description: 'Spreading the Gospel to all nations',
      icon: <Globe className="h-8 w-8" />
    },
    { 
      letter: 'E', 
      meaning: 'Excellence', 
      scripture: 'Daniel 5:14, 6:3',
      description: 'Doing everything with excellence for God\'s glory',
      icon: <Star className="h-8 w-8" />
    },
    { 
      letter: 'H', 
      meaning: 'Honor and Humility', 
      scripture: 'Romans 12:10, 1 Peter 5:5',
      description: 'Respecting others and walking in humility',
      icon: <Users className="h-8 w-8" />
    },
    { 
      letter: 'I', 
      meaning: 'Integrity', 
      scripture: 'Job 31:6',
      description: 'Living with honesty and moral uprightness',
      icon: <Shield className="h-8 w-8" />
    },
    { 
      letter: 'M', 
      meaning: 'Mentoring', 
      scripture: '2 Timothy 2:2',
      description: 'Developing leaders through discipleship',
      icon: <BookOpen className="h-8 w-8" />
    }
  ];

  const objectives = [
    {
      title: 'Spiritual Foundation',
      description: 'To win lost souls to Christ and build lives through spiritual teachings',
      icon: <Cross className="h-6 w-6" />
    },
    {
      title: 'Leadership Development',
      description: 'To train and equip community leaders for nation building',
      icon: <Users2 className="h-6 w-6" />
    },
    {
      title: 'Church Empowerment',
      description: 'To develop self-reliant churches centered in teaching and care',
      icon: <Home className="h-6 w-6" />
    },
    {
      title: 'Sound Doctrine',
      description: 'Teaching healthy biblical doctrine for faith and conduct',
      icon: <Book className="h-6 w-6" />
    },
    {
      title: 'Character Transformation',
      description: 'Promoting change in character, conduct and conversation',
      icon: <Lightbulb className="h-6 w-6" />
    },
    {
      title: 'Community Service',
      description: 'Serving abandoned children and orphans through life skills',
      icon: <HandHeart className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-24"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/herobg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="about-title">
            Our Mission & Vision
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8">
            Empowering generations through faith, education, and community transformation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <a href="#vision">Our Vision</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="#values">Core Values</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="/contact">Get Involved</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Vision, Mission and Goal */}
      <section id="vision" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4">Our Foundation</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Drives Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These foundational pillars guide every decision we make and every life we touch
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed text-lg">
                  To raise self-reliant and God fearing generations in South Sudan and beyond.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <Heart className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Inspiring future leaders</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Heavenly Nature Ministry exists to empower street/abandoned children and orphans to fully utilize their spiritual, physical and mental gifts to become self-reliant and harmonious citizens in society.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <School className="h-4 w-4 mr-2 text-green-600" />
                    <span>Empowering through education</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-100 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Our Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-1 mr-3 mt-1">
                      <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <span>Empowering children spiritually, physically and mentally</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-1 mr-3 mt-1">
                      <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <span>Teaching obedience and honor for Godʼs word</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-1 mr-3 mt-1">
                      <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <span>Building useful citizens through biblical principles</span>
                  </li>
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <HandHeart className="h-4 w-4 mr-2 text-purple-600" />
                    <span>Transformative community impact</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section id="values" className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 mb-4">S.E.E H.I.M</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide our ministry and define our character
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${
                      value.letter === 'S' ? 'bg-blue-100' :
                      value.letter === 'E' ? 'bg-green-100' :
                      value.letter === 'H' ? 'bg-purple-100' :
                      value.letter === 'I' ? 'bg-yellow-100' : 'bg-indigo-100'
                    }`}>
                      <div className="flex items-center justify-center">
                        {value.icon}
                      </div>
                    </div>
                    <Badge className={
                      value.letter === 'S' ? 'bg-blue-100 text-blue-700' :
                      value.letter === 'E' ? 'bg-green-100 text-green-700' :
                      value.letter === 'H' ? 'bg-purple-100 text-purple-700' :
                      value.letter === 'I' ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-100 text-indigo-700'
                    }>
                      {value.letter}
                    </Badge>
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

          <div className="text-center mt-12">
            <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-sm">
              <div className="flex items-center space-x-2">
                {coreValues.map((value, index) => (
                  <React.Fragment key={index}>
                    <span className="font-bold text-blue-600">{value.letter}</span>
                    {index < coreValues.length - 1 && (
                      <span className="text-gray-400">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <p className="text-gray-600 mt-4">These values shape everything we do</p>
          </div>
        </div>
      </section>

      {/* Our Objectives */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mb-4">Our Objectives</Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Strategic Focus Areas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Specific goals that drive our ministry forward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {objectives.map((objective, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      {objective.icon}
                    </div>
                    <CardTitle className="text-lg">{objective.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{objective.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Objectives */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Our Detailed Objectives
              </CardTitle>
              <CardDescription>
                Comprehensive goals for holistic community transformation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Spiritual & Community Development</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        </div>
                        <span>Win lost souls to Christ and build lives through spiritual teachings</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        </div>
                        <span>Train and equip community leaders for nation building</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        </div>
                        <span>Advocate for development and self-reliant churches</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Character & Growth</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                          <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                        </div>
                        <span>Teach sound and healthy doctrine from God's word</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                          <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                        </div>
                        <span>Promote submission to God's authority and commands</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                          <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                        </div>
                        <span>Foster change in character, conduct and conversation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <a href="/contact">Partner With Us</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="/donate">Support Our Work</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="/events">Attend an Event</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
