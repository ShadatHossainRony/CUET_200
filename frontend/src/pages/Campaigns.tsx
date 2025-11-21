import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import educationImg from "@/assets/campaign-education.jpg";
import medicalImg from "@/assets/campaign-medical.jpg";
import waterImg from "@/assets/campaign-water.jpg";

export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  // Mock campaign data
  const campaigns = [
    {
      id: "1",
      title: "Help Build a School in Rural India",
      description: "Supporting education for 500+ children in underserved communities with new classrooms and learning materials",
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
      description: "Help Sarah fight her battle against leukemia with life-saving treatment and ongoing care",
      image: medicalImg,
      raised: 28000,
      goal: 50000,
      donors: 189,
      category: "Medical",
      daysLeft: 8,
    },
    {
      id: "3",
      title: "Clean Water Project for African Village",
      description: "Bringing clean, safe drinking water to 1,000 families through sustainable infrastructure",
      image: waterImg,
      raised: 62000,
      goal: 80000,
      donors: 456,
      category: "Community",
      daysLeft: 15,
      trending: true,
    },
    {
      id: "4",
      title: "Disaster Relief for Flood Victims",
      description: "Emergency support for families affected by recent flooding in coastal regions",
      image: "/placeholder.svg",
      raised: 15000,
      goal: 30000,
      donors: 87,
      category: "Emergency",
      daysLeft: 5,
    },
    {
      id: "5",
      title: "Save the Rainforest Conservation Project",
      description: "Protecting endangered wildlife habitats and promoting sustainable forestry practices",
      image: "/placeholder.svg",
      raised: 38000,
      goal: 60000,
      donors: 234,
      category: "Environment",
      daysLeft: 20,
    },
    {
      id: "6",
      title: "Community Food Bank Expansion",
      description: "Help us serve 5,000 more families with nutritious meals and food security programs",
      image: "/placeholder.svg",
      raised: 52000,
      goal: 70000,
      donors: 512,
      category: "Community",
      daysLeft: 18,
    },
  ];

  const categories = [
    "All Categories",
    "Medical",
    "Education",
    "Community",
    "Emergency",
    "Environment",
    "Animals",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="py-12 border-b bg-muted/30">
          <div className="container mx-auto px-4">
            <h1 className="mb-4">Browse Campaigns</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover campaigns making real impact. Support causes you care about.
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 border-b bg-background sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase().replace(" ", "-")}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Campaign Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} {...campaign} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-12">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button variant="default" className="gradient_hero text-white">
                1
              </Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
