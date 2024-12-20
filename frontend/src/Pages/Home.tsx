import { ArrowRight, Users, Sparkles, Search, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center lg:py-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Connect, Learn, and Grow Together
          </h1>
          <p className="mb-8 text-lg text-gray-600 lg:text-xl">
            Find your perfect mentor or mentee match. Our platform connects passionate individuals 
            ready to share knowledge and grow together.
          </p>
          <div className="flex justify-center gap-4">
            <Link to={'/signup'}>
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-5 w-5" />
            </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Discovery</h3>
                <p className="text-gray-600 text-center">
                  Explore our community of mentors and mentees. Browse profiles, skills, and interests 
                  to find your ideal match.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Smart Matching</h3>
                <p className="text-gray-600 text-center">
                  Our intelligent matching system recommends the best connections based on your skills, 
                  interests, and goals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Connect</h3>
                <p className="text-gray-600 text-center">
                  Build meaningful connections with mentors or mentees who share your passion and 
                  can help you achieve your goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Personalized Matching</h3>
                <p className="text-gray-600">
                  Our advanced algorithm ensures you connect with mentors or mentees who align 
                  perfectly with your goals and interests.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Diverse Community</h3>
                <p className="text-gray-600">
                  Join a vibrant community of professionals and learners from various backgrounds 
                  and expertise levels.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Skill-Based Matching</h3>
                <p className="text-gray-600">
                  Find mentors with the exact skills you want to learn, or mentees eager to learn 
                  what you can teach.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Growth Opportunities</h3>
                <p className="text-gray-600">
                  Whether you're sharing knowledge or learning, our platform helps you grow 
                  professionally and personally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our community today and take the first step towards meaningful mentorship connections.
          </p>
          <Link to={'/signup'} >
          <Button size="lg" className="gap-2">
            Get Started Now <ArrowRight className="h-5 w-5" />
          </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;