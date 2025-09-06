import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Target, Clock, CreditCard, Zap, Users, DollarSign, Star } from 'lucide-react';

const AppIcon = ({ name, size = 48 }) => {
  const iconPaths = {
    Netflix: "/icons/netflix.svg",
    Spotify: "/icons/spotify.svg",
    GamePass: "/icons/xbox.svg",
    "Prime Video": "/icons/primevideo.svg",
    "JioHotstar": "/icons/hotstar.svg",
    "YouTube Premium": "/icons/yt.svg",
    "OpenAI": "/icons/chatgpt.svg",
    "GitHub Copilot": "/icons/copilot.svg",
    "Adobe CC": "/icons/adobe.svg",
  };

  const iconSrc = iconPaths[name];

  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={`${name} Logo`}
        style={{ width: size, height: size, objectFit: 'contain' }}
        className="rounded-xl"
      />
    );
  }

  return (
    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
      ?
    </div>
  );
};


// Services data would be fetched from API - using placeholders for now
const services = [
  { name: "Netflix", price: "₹18", duration: "3 days", savings: "Save ₹119" },
  { name: "Spotify", price: "₹38", duration: "1 week", savings: "Save ₹89" },
  { name: "Prime Video", price: "₹18", duration: "1 week", savings: "Save ₹224" },
  { name: "JioHotstar", price: "₹25", duration: "1 week", savings: "Save ₹199" },
  { name: "YouTube Premium", price: "₹45", duration: "1 week", savings: "Save ₹129" },
  { name: "OpenAI", price: "₹89", duration: "3 days", savings: "Save ₹1,911" },
  { name: "GitHub Copilot", price: "₹75", duration: "1 week", savings: "Save ₹325" },
  { name: "Adobe CC", price: "₹89", duration: "2 days", savings: "Save ₹1,910" }
];

const steps = [
  {
    number: "01",
    title: "Browse & Select",
    description: "Choose from Netflix, Spotify, Game Pass and more premium services",
    icon: Target
  },
  {
    number: "02",
    title: "Pick Duration",
    description: "Rent for 1 day, 3 days, 1 week - exactly what you need",
    icon: Clock
  },
  {
    number: "03",
    title: "Secure Payment",
    description: "Pay in INR with UPI, cards, or digital wallet",
    icon: CreditCard
  },
  {
    number: "04",
    title: "Instant Access",
    description: "Get login credentials on WhatsApp within minutes",
    icon: Zap
  }
];

const fontFamily = 'Inter, Roboto, Arial, sans-serif';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("popular");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-20" role="main" aria-labelledby="hero-title">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="text-left">
                <div className="inline-flex items-center bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 text-[#2bb6c4] dark:text-[#5ed1dc] px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Star className="w-4 h-4 mr-2" />
                  Trusted by 10,000+ users
                </div>
                
                <h1 id="hero-title" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Rent Premium Subscriptions
                  <span className="text-[#2bb6c4] dark:text-[#5ed1dc] block">
                    Pay Only for Days You Use
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Rent Netflix, Spotify, Adobe, and 50+ premium services for just the days you need them. 
                  <span className="text-[#2bb6c4] dark:text-[#5ed1dc] font-semibold">Save up to 90% on your favorite apps.</span>
                </p>

                {/* Value Proposition Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">₹18</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Netflix 3 days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">₹38</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Spotify 1 week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">₹18</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Prime Video 1 week</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="text-base px-8 py-4 bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-semibold">
                    <Link to="/login" aria-describedby="hero-description">Start Saving Now - Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base px-8 py-4 border-2 border-[#2bb6c4] text-white hover:bg-[#2bb6c4] hover:text-white font-semibold">
                    <Link to="/available-plans">View All Services</Link>
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  ✓ No hidden fees ✓ Instant access ✓ 24/7 support
                </p>
              </div>

              {/* Right Column - Visual */}
              <div className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pay Only for Days You Use</h3>
                    <div className="text-3xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">3 Days</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Netflix binge weekend</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <img src="/icons/netflix.svg" alt="Netflix" className="w-8 h-8 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Netflix</div>
                          <div className="text-xs text-gray-500">3 days</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#2bb6c4] dark:text-[#5ed1dc]">₹18</div>
                        <div className="text-xs text-gray-500 line-through">₹199</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <img src="/icons/spotify.svg" alt="Spotify" className="w-8 h-8 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Spotify</div>
                          <div className="text-xs text-gray-500">1 week</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#2bb6c4] dark:text-[#5ed1dc]">₹38</div>
                        <div className="text-xs text-gray-500 line-through">₹199</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <img src="/icons/adobe.svg" alt="Adobe" className="w-8 h-8 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Adobe CC</div>
                          <div className="text-xs text-gray-500">2 days</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#2bb6c4] dark:text-[#5ed1dc]">₹89</div>
                        <div className="text-xs text-gray-500 line-through">₹1,999</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-[#2bb6c4]/10 dark:bg-[#5ed1dc]/10 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total for this week</div>
                      <div className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">₹145</div>
                      <div className="text-xs text-gray-500">vs ₹2,397 full subscriptions</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements for visual appeal */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#2bb6c4] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  ₹145
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#2bb6c4] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  ✓
                </div>
              </div>
            </div>
            <p id="hero-description" className="sr-only">Click to explore our premium subscription services</p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Sublite?</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Join thousands of smart users who save money while enjoying premium services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2bb6c4] dark:bg-[#5ed1dc] rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Save Up to 90%</h3>
                <p className="text-gray-600 dark:text-gray-300">Pay only for the days you actually use. No more wasting money on unused subscriptions.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2bb6c4] dark:bg-[#5ed1dc] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Instant Access</h3>
                <p className="text-gray-600 dark:text-gray-300">Get your login credentials within minutes via WhatsApp. Start using immediately.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2bb6c4] dark:bg-[#5ed1dc] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">50+ Premium Services</h3>
                <p className="text-gray-600 dark:text-gray-300">Access Netflix, Spotify, Adobe, Game Pass, and all your favorite apps in one place.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="container mx-auto px-4 py-16" aria-labelledby="services-title">
          <div className="text-center mb-12">
            <h2 id="services-title" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Most Popular Services</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from our most popular services and start saving today
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full max-w-md mx-auto mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" role="tablist" aria-label="Service categories">
              <TabsTrigger value="popular" className={`px-6 py-3 font-medium text-sm text-center transition-all duration-300 flex-1 ${activeTab === "popular" ? "bg-[#2bb6c4] text-white" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"}`} role="tab" aria-selected={activeTab === "popular"} aria-controls="popular-panel">
                Popular
              </TabsTrigger>
              <TabsTrigger value="streaming" className={`px-6 py-3 font-medium text-sm text-center transition-all duration-300 flex-1 ${activeTab === "streaming" ? "bg-[#2bb6c4] text-white" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"}`} role="tab" aria-selected={activeTab === "streaming"} aria-controls="streaming-panel">
                Streaming
              </TabsTrigger>
              <TabsTrigger value="ai" className={`px-6 py-3 font-medium text-sm text-center transition-all duration-300 flex-1 ${activeTab === "ai" ? "bg-[#2bb6c4] text-white" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"}`} role="tab" aria-selected={activeTab === "ai"} aria-controls="ai-panel">
                AI Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popular" id="popular-panel" className="mt-6" role="tabpanel" aria-labelledby="popular-tab">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.slice(0, 3).map((service, index) => (
                  <ServiceCard key={service.name} service={service} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="streaming" id="streaming-panel" className="mt-6" role="tabpanel" aria-labelledby="streaming-tab">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.filter(s => ["Netflix", "Prime Video", "JioHotstar", "YouTube Premium", "Spotify"].includes(s.name)).map((service, index) => (
                  <ServiceCard key={service.name} service={service} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai" id="ai-panel" className="mt-6" role="tabpanel" aria-labelledby="ai-tab">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.filter(s => ["OpenAI", "GitHub Copilot", "Adobe CC"].includes(s.name)).map((service, index) => (
                  <ServiceCard key={service.name} service={service} index={index} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 dark:bg-gray-900 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How Sublite Works</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Get started in 4 simple steps and start saving money immediately
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Card key={step.number} className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
                    <CardHeader className="pb-4">
                      <div className="w-12 h-12 bg-[#2bb6c4] dark:bg-[#5ed1dc] rounded-lg flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc] mb-2">{step.number}</div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300">{step.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Ready to Pay Only for Days You Use?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Stop wasting money on unused subscriptions. Rent what you need, when you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button asChild size="lg" className="text-base px-8 py-4 bg-[#2bb6c4] hover:bg-[#1ea1b0] text-white font-semibold">
                <Link to="/login">Start Renting Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 py-4 border-2 border-[#2bb6c4] text-white hover:bg-[#2bb6c4] hover:text-white font-semibold">
                <Link to="/available-plans">View All Services</Link>
              </Button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
              ✓ No credit card required ✓ Instant access ✓ 24/7 support
            </p>
          </div>
        </section>

        <Footer />

      </div>
    </TooltipProvider>
  );
}

// Shared ServiceCard Component
function ServiceCard({ service, index }) {
  return (
    <Card className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="absolute top-4 right-4">
        <span className="bg-[#2bb6c4] text-white text-xs font-medium px-3 py-1 rounded-full">
          {service.savings}
        </span>
      </div>
      <CardHeader className="text-center pb-4 pt-8">
        <div className="flex justify-center mb-4">
          <AppIcon name={service.name} size={56} />
        </div>
        <CardTitle className="text-xl text-gray-900 dark:text-white">{service.name}</CardTitle>
        <CardDescription className="text-base">
          <span className="text-2xl font-bold text-[#2bb6c4] dark:text-[#5ed1dc]">{service.price}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">for {service.duration}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Get instant access to {service.name}</p>
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
}

// PropTypes definitions
AppIcon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number
};

AppIcon.defaultProps = {
  size: 48
};

ServiceCard.propTypes = {
  service: PropTypes.shape({
    name: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    color: PropTypes.string,
    savings: PropTypes.string
  }).isRequired,
  index: PropTypes.number.isRequired
};
