import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

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
  { name: "Prime Video", price: "₹18", duration: "1 week", savings: "Save ₹224" }
];

const steps = [
  {
    number: "01",
    title: "Browse & Select",
    description: "Choose from Netflix, Spotify, Game Pass and more premium services",
    icon: "🎯"
  },
  {
    number: "02",
    title: "Pick Duration",
    description: "Rent for 1 day, 3 days, 1 week - exactly what you need",
    icon: "⏰"
  },
  {
    number: "03",
    title: "Secure Payment",
    description: "Pay in INR with UPI, cards, or digital wallet",
    icon: "💳"
  },
  {
    number: "04",
    title: "Instant Access",
    description: "Get login credentials on WhatsApp within minutes",
    icon: "⚡"
  }
];

const fontFamily = 'Inter, Roboto, Arial, sans-serif';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("popular");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Header />

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-12 md:pt-24 pb-8 md:pb-12 text-center" role="main" aria-labelledby="hero-title">
          <div className="max-w-5xl mx-auto">
            <h1 id="hero-title" className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Rent Premium Subscriptions
              <span className="bg-gradient-to-r from-[#2bb6c4] to-blue-600 bg-clip-text text-transparent block text-3xl md:text-5xl lg:text-6xl mt-2">
                Pay Only for Days You Use
              </span>
            </h1>

            {/* Visual Element - Subscription Stack */}
            <div className="flex justify-center mt-6 mb-4">
              <div className="relative">
                {/* Base Card */}
                <div className="w-20 h-12 bg-gradient-to-br from-[#2bb6c4] to-[#5ed1dc] rounded-lg shadow-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full opacity-80"></div>
                </div>
                {/* Middle Card */}
                <div className="absolute -top-2 -left-2 w-20 h-12 bg-gradient-to-br from-[#5ed1dc] to-[#2bb6c4] rounded-lg shadow-lg flex items-center justify-center transform rotate-3">
                  <div className="w-6 h-6 bg-white rounded-full opacity-80"></div>
                </div>
                {/* Top Card */}
                <div className="absolute -top-1 -right-1 w-20 h-12 bg-gradient-to-br from-[#2bb6c4] to-[#89e0e5] rounded-lg shadow-lg flex items-center justify-center transform -rotate-2">
                  <div className="w-6 h-6 bg-white rounded-full opacity-80"></div>
                </div>
              </div>
            </div>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
              Unlock entertainment and productivity on your terms.
              <strong className="text-[#2bb6c4]"> Access premium, pay smart.</strong>
            </p>


            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8 mb-2">
              <Button asChild size="lg" className="shadow-lg hover:shadow-xl text-base sm:text-lg px-8 sm:px-16 py-3 sm:py-4 bg-[#2bb6c4] text-white hover:bg-[#1ea1b0] w-full sm:w-auto max-w-xs sm:max-w-none">
                <Link to="/login" aria-describedby="hero-description">Start Saving Now</Link>
              </Button>
            </div>
            <p id="hero-description" className="sr-only">Click to explore our premium subscription services</p>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="container mx-auto px-4 mb-16 py-8" aria-labelledby="services-title">
          <h2 id="services-title" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">Most Popular Services</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-xs sm:max-w-md mx-auto mb-8 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg" role="tablist" aria-label="Service categories">
              <TabsTrigger value="popular" className={`${activeTab === "popular" ? "bg-white dark:bg-gray-600 shadow text-[#2bb6c4] font-semibold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"} flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm text-center rounded-md transition-colors duration-200`} role="tab" aria-selected={activeTab === "popular"} aria-controls="popular-panel">
                Popular
              </TabsTrigger>
              <TabsTrigger value="streaming" className={`${activeTab === "streaming" ? "bg-white dark:bg-gray-600 shadow text-[#2bb6c4] font-semibold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"} flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm text-center rounded-md transition-colors duration-200`} role="tab" aria-selected={activeTab === "streaming"} aria-controls="streaming-panel">
                Streaming
              </TabsTrigger>
              <TabsTrigger value="ai" className={`${activeTab === "ai" ? "bg-white dark:bg-gray-600 shadow text-[#2bb6c4] font-semibold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"} flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm text-center rounded-md transition-colors duration-200`} role="tab" aria-selected={activeTab === "ai"} aria-controls="ai-panel">
                AI Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popular" id="popular-panel" className="space-y-8" role="tabpanel" aria-labelledby="popular-tab">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.slice(0, 3).map((service, index) => (
                  <ServiceCard key={service.name} service={service} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="streaming" id="streaming-panel" className="space-y-8" role="tabpanel" aria-labelledby="streaming-tab">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.filter(s => ["Netflix", "Prime Video", "JioHotstar", "YouTube Premium", "Spotify"].includes(s.name)).map((service, index) => (
                  <ServiceCard key={service.name} service={service} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai" id="ai-panel" className="space-y-8" role="tabpanel" aria-labelledby="ai-tab">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.filter(s => ["OpenAI", "GitHub Copilot", "Adobe CC"].includes(s.name)).map((service, index) => (
                  <ServiceCard key={service.name} service={service} index={index} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* How It Works */}
        <section className="bg-white dark:bg-gray-900 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-16">How Sublite Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <Card key={step.number} className="text-center hover:shadow-xl transition-all duration-300 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 animate-slide-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <div className="text-5xl mb-4 animate-float">{step.icon}</div>
                    <div className="text-3xl font-bold text-[#2bb6c4] mb-2">{step.number}</div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300">{index === 3 ? 'Get instant access to your subscription details and credentials.' : step.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Footer />

        {/* Animations */}
        <style>
          {`
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slide-in-up {
              from { opacity: 0; transform: translateY(50px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
            .animate-fade-in-up { animation: fade-in-up 1s ease-out both; }
            .animate-slide-in-up { animation: slide-in-up 0.8s ease-out both; }
            .animate-float { animation: float 2s ease-in-out infinite; }
          `}
        </style>
      </div>
    </TooltipProvider>
  );
}

// Shared ServiceCard Component
function ServiceCard({ service, index }) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#2bb6c4] animate-slide-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="absolute top-4 right-4">
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
          {service.savings}
        </span>
      </div>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
          <AppIcon name={service.name} size={64} />
        </div>
        <CardTitle className="text-2xl text-gray-900">{service.name}</CardTitle>
        <CardDescription className="text-lg">
          <span className="text-3xl font-bold text-[#2bb6c4]">{service.price}</span>
          <span className="text-gray-500 ml-2">for {service.duration}</span>
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
