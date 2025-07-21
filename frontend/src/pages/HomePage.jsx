// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// UI Components
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

/**
 * AppIcon Component
 * Renders an official logo for a given service using an <img> tag.
 * Assumes SVG/PNG files are located in the /public directory.
 * @param {object} props - Component props.
 * @param {string} props.name - The name of the service (e.g., "Netflix", "Spotify").
 * @param {number} [props.size=48] - The desired width and height for the icon in pixels.
 */
const AppIcon = ({ name, size = 48 }) => {
  // Maps service names to their corresponding image paths in the public directory.
  const iconPaths = {
    Netflix: "/netflix.svg",
    Spotify: "/spotify.svg",
    GamePass: "/xbox.svg", // Using xbox.svg to represent GamePass
    "Prime Video": "/primevideo.svg",
    "JioHotstar": "/hotstar.svg",
    "YouTube Premium": "/yt.svg",
  };

  const iconSrc = iconPaths[name];

  // Renders the image if a valid path is found.
  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={`${name} Logo`}
        style={{ width: size, height: size, objectFit: 'contain' }} // Ensures aspect ratio is maintained
        className="rounded-xl" // Applies common styling for icons
      />
    );
  }

  // Fallback div for services without a defined icon path.
  return (
    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
      ?
    </div>
  );
};

// Array containing data for various premium services offered.
const services = [
  // Pricing and savings are illustrative, based on typical market rates and potential savings for short-term rentals.
  { name: "Netflix", price: "₹80", duration: "3 days", color: "#E50914", savings: "Save ₹119" },
  { name: "Spotify", price: "₹40", duration: "1 week", color: "#1DB954", savings: "Save ₹89" },
  { name: "GamePass", price: "₹100", duration: "5 days", color: "#107C10", savings: "Save ₹519" },
  { name: "Prime Video", price: "₹75", duration: "1 week", color: "#00A8E1", savings: "Save ₹224" },
  { name: "JioHotstar", price: "₹25", duration: "1 week", color: "#113CCF", savings: "Save ₹4" },
  { name: "YouTube Premium", price: "₹40", duration: "1 week", color: "#FF0000", savings: "Save ₹109" }
];

// Array detailing the steps for how the service works.
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

/**
 * HomePage Component
 * Renders the main landing page of the application, including hero section,
 * services showcase, and how-it-works.
 */
export default function HomePage() {
  // State for managing active tab in services section
  const [activeTab, setActiveTab] = useState("popular");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex flex-col">
        <Header />

        {/* Hero Section: Main call to action and value proposition */}
        <section className="container mx-auto px-4 pt-24 pb-16 text-center flex-grow flex items-center justify-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight animate-fade-in-up">
              Rent Premium Subscriptions
              <span className="bg-gradient-to-r from-[#2bb6c4] to-blue-600 bg-clip-text text-transparent block text-3xl md:text-5xl lg:text-6xl mt-2">
                Pay Only for Days You Use
              </span>
            </h1>

            {/* UPDATED: Catchy tagline, removed explicit "save" amount */}
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Unlock entertainment and productivity on your terms.
              <span className="font-bold text-[#2bb6c4]"> Access premium, pay smart.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              {/* Button to navigate to the services section, styled to match theme */}
              <Button
                asChild
                size="lg"
                className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base px-8
                           bg-[#2bb6c4] text-white hover:bg-blue-600"
              >
                <Link to="#services">
                  Browse Services
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Showcase Section: Displays various subscription services by category */}
        <section id="services" className="container mx-auto px-4 mb-20 py-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Most Popular Services</h2>

          {/* Tabs for filtering services by category */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Added explicit active/inactive styling to TabsList and TabsTrigger */}
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="popular"
                className={`flex-1 px-4 py-2 text-center rounded-md transition-colors duration-200
                          ${activeTab === "popular"
                            ? "bg-white shadow text-[#2bb6c4] font-semibold"
                            : "text-gray-600 hover:bg-gray-200"
                          }`}
              >
                Popular
              </TabsTrigger>
              <TabsTrigger
                value="streaming"
                className={`flex-1 px-4 py-2 text-center rounded-md transition-colors duration-200
                          ${activeTab === "streaming"
                            ? "bg-white shadow text-[#2bb6c4] font-semibold"
                            : "text-gray-600 hover:bg-gray-200"
                          }`}
              >
                Streaming
              </TabsTrigger>
              <TabsTrigger
                value="gaming"
                className={`flex-1 px-4 py-2 text-center rounded-md transition-colors duration-200
                          ${activeTab === "gaming"
                            ? "bg-white shadow text-[#2bb6c4] font-semibold"
                            : "text-gray-600 hover:bg-gray-200"
                          }`}
              >
                Gaming
              </TabsTrigger>
            </TabsList>

            {/* Content for the "Popular" tab */}
            <TabsContent value="popular" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Renders the first three services as popular */}
                {services.slice(0, 3).map((service, index) => (
                  <Card key={service.name} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#2bb6c4] animate-slide-in-up" style={{animationDelay: `${index * 0.1}s`}}>
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
                ))}
              </div>
            </TabsContent>

            {/* Content for the "Streaming" tab */}
            <TabsContent value="streaming" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Filters and renders streaming-related services */}
                {services.filter(s => ["Netflix", "Prime Video", "JioHotstar", "YouTube Premium", "Spotify"].includes(s.name)).map((service, index) => (
                  <Card key={service.name} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#2bb6c4]">
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
                      <Button className="w-full" variant="outline" disabled>
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Content for the "Gaming" tab */}
            <TabsContent value="gaming" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Filters and renders gaming-related services */}
                {services.filter(s => ["GamePass"].includes(s.name)).map((service, index) => (
                  <Card key={service.name} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#2bb6c4]">
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
                      <Button className="w-full" variant="outline" disabled>
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* How It Works Section: Explains the process of using the service */}
        <section id="how-it-works" className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">How Sublite Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <Card key={step.number} className="text-center relative group hover:shadow-xl transition-all duration-300 animate-slide-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <CardHeader>
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{step.icon}</div>
                    <div className="text-3xl font-bold text-[#2bb6c4] mb-2">{step.number}</div>
                    <CardTitle className="text-xl text-gray-900">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">{step.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Inline style block for keyframe animations */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-in-up {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 1s ease-out both;
          }
          .animate-fade-in-up {
            animation: fade-in-up 1s ease-out both;
          }
          .animate-slide-in-up {
            animation: slide-in-up 0.8s ease-out both;
          }
        `}
      </style>
    </TooltipProvider>
  );
}