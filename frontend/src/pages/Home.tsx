import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Heart, Shield, TrendingUp, Users, Zap, Globe } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import educationImg from "@/assets/campaign-education.jpg";
import medicalImg from "@/assets/campaign-medical.jpg";
import waterImg from "@/assets/campaign-water.jpg";

export default function Home() {
  // Mock data for trending campaigns
  const trendingCampaigns = [
    {
      id: "1",
      title: "Help Build a School in Rural India",
      description: "Supporting education for 500+ children in underserved communities",
      image: educationImg,
      raised: 45000,
      goal: 75000,
      donors: 324,
      category: "Education",
      daysLeft: 12,
      trending: true,
    },
    {
      id: "2",
      title: "Medical Treatment for Cancer Patient",
      description: "Help Sarah fight her battle against leukemia with life-saving treatment",
      image: medicalImg,
      raised: 28000,
      goal: 50000,
      donors: 189,
      category: "Medical",
      daysLeft: 8,
      trending: true,
    },
    {
      id: "3",
      title: "Clean Water Project for African Village",
      description: "Bringing clean, safe drinking water to 1,000 families",
      image: waterImg,
      raised: 62000,
      goal: 80000,
      donors: 456,
      category: "Community",
      daysLeft: 15,
      trending: true,
    },
  ];

  const stats = [
    { label: "Total Raised", value: "$12.5M+", icon: TrendingUp },
    { label: "Active Campaigns", value: "2,500+", icon: Heart },
    { label: "Donors Worldwide", value: "50,000+", icon: Users },
    { label: "Countries Reached", value: "120+", icon: Globe },
  ];

  const features = [
    {
      icon: Zap,
      title: "Quick Setup",
      description: "Create your campaign in minutes with our easy-to-use platform",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Industry-leading encryption protects every donation",
    },
    {
      icon: Users,
      title: "Global Reach",
      description: "Connect with donors from around the world instantly",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Community helping each other" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80" />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="mb-6 animate-fade-in text-balance">
              Make a Difference Today
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-slide-up">
              Join thousands of compassionate people supporting causes that matter. 
              Start your fundraising journey or donate to campaigns changing lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8"
              >
                <Link to="/campaigns/create">Start a Campaign</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8"
              >
                <Link to="/campaigns">Browse Campaigns</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Campaigns */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Trending Campaigns</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Support these popular campaigns making real impact in communities worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {trendingCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} {...campaign} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/campaigns">View All Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Why Choose CareForAll?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The most trusted crowdfunding platform with powerful tools and global reach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-background p-8 rounded-lg border text-center hover:shadow-md transition-smooth"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient_accent">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="mb-6 text-white">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Whether you're raising funds or giving support, every action counts. 
            Join our community today.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-accent hover:bg-white/90 text-lg px-8"
          >
            <Link to="/register">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
