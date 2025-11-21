import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  Share2, 
  Flag, 
  MapPin, 
  Calendar, 
  Users,
  Clock
} from "lucide-react";
import educationImg from "@/assets/campaign-education.jpg";

export default function CampaignDetail() {
  const { id } = useParams();
  const [donationAmount, setDonationAmount] = useState("");

  // Mock campaign data
  const campaign = {
    id,
    title: "Help Build a School in Rural India",
    description: "We are raising funds to build a new school building that will serve over 500 children in a rural community in India. The existing structure is in poor condition and lacks basic facilities.",
    fullStory: `This campaign aims to transform education for children in a remote village in rural India. 
      The current school building is over 50 years old and poses safety risks to students and teachers alike.
      
      With your support, we will:
      - Construct a new 2-story school building with 8 classrooms
      - Install proper sanitation facilities
      - Provide modern learning equipment and furniture
      - Create a safe outdoor play area for children
      - Ensure proper lighting and ventilation in all rooms
      
      Every child deserves access to quality education in a safe environment. Your donation will directly 
      contribute to creating better learning opportunities for these children and their future generations.`,
    image: educationImg,
    raised: 45000,
    goal: 75000,
    donors: 324,
    category: "Education",
    location: "Rural India",
    createdDate: "2024-01-15",
    daysLeft: 12,
    organizer: {
      name: "Education for All Foundation",
      avatar: "/placeholder.svg",
      verified: true,
    },
    recentDonations: [
      { name: "Sarah M.", amount: 100, time: "2 hours ago", message: "Happy to support this cause!" },
      { name: "Anonymous", amount: 250, time: "5 hours ago", message: "" },
      { name: "John D.", amount: 50, time: "1 day ago", message: "Education is key to breaking the poverty cycle" },
      { name: "Maria G.", amount: 500, time: "1 day ago", message: "Proud to contribute!" },
    ],
    updates: [
      {
        date: "2024-02-10",
        title: "Foundation Work Begins!",
        content: "We've started the foundation work for the new school building. Thank you all for your amazing support!",
      },
      {
        date: "2024-01-25",
        title: "Permits Approved",
        content: "Great news! All construction permits have been approved by local authorities.",
      },
    ],
  };

  const progress = (campaign.raised / campaign.goal) * 100;
  const formattedRaised = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(campaign.raised);
  const formattedGoal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(campaign.goal);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-4 left-4 bg-background/90 text-foreground">
                  {campaign.category}
                </Badge>
              </div>

              {/* Title and Meta */}
              <div>
                <h1 className="mb-4">{campaign.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {campaign.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Started {new Date(campaign.createdDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {campaign.donors} donors
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="story" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="story">Story</TabsTrigger>
                  <TabsTrigger value="updates">Updates ({campaign.updates.length})</TabsTrigger>
                  <TabsTrigger value="donors">Donors ({campaign.donors})</TabsTrigger>
                </TabsList>

                <TabsContent value="story" className="space-y-4 mt-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-lg">{campaign.description}</p>
                    <div className="whitespace-pre-line text-muted-foreground">
                      {campaign.fullStory}
                    </div>
                  </div>

                  {/* Organizer */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-4">Organizer</h3>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={campaign.organizer.avatar} />
                          <AvatarFallback>EF</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {campaign.organizer.name}
                            {campaign.organizer.verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Campaign Organizer</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="updates" className="space-y-4 mt-6">
                  {campaign.updates.map((update, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{update.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(update.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{update.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="donors" className="space-y-3 mt-6">
                  {campaign.recentDonations.map((donation, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{donation.name}</p>
                            <p className="text-sm text-muted-foreground">{donation.time}</p>
                          </div>
                          <span className="font-bold text-primary">
                            ${donation.amount}
                          </span>
                        </div>
                        {donation.message && (
                          <p className="text-sm text-muted-foreground italic">
                            "{donation.message}"
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Donation Card */}
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-3xl font-bold text-primary">{formattedRaised}</span>
                        <span className="text-muted-foreground">of {formattedGoal}</span>
                      </div>
                      <Progress value={progress} className="h-3 mb-4" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Heart className="h-4 w-4" />
                            <span>Donors</span>
                          </div>
                          <p className="font-semibold text-lg">{campaign.donors}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Clock className="h-4 w-4" />
                            <span>Days Left</span>
                          </div>
                          <p className="font-semibold text-lg">{campaign.daysLeft}</p>
                        </div>
                      </div>
                    </div>

                    {/* Donation Amount */}
                    <div className="space-y-3">
                      <Label>Enter your donation</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          placeholder="50"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="pl-7 text-lg"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[25, 50, 100, 250].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setDonationAmount(amount.toString())}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full gradient_accent text-white" size="lg">
                      Donate Now
                    </Button>

                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/campaigns/${id}/recurring`}>Set Up Monthly Donation</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Share Card */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-semibold">Share this campaign</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="flex-1">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="flex-1">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="flex-1">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
