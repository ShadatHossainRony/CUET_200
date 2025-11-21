import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  category: string;
  daysLeft?: number;
  trending?: boolean;
}

export const CampaignCard = ({
  id,
  title,
  description,
  image,
  raised,
  goal,
  donors,
  category,
  daysLeft,
  trending,
}: CampaignCardProps) => {
  const progress = (raised / goal) * 100;
  const formattedRaised = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(raised);
  const formattedGoal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(goal);

  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-smooth">
      <Link to={`/campaigns/${id}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-smooth"
          />
          {trending && (
            <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
          <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
            {category}
          </Badge>
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-smooth">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl font-bold text-primary">{formattedRaised}</span>
                <span className="text-sm text-muted-foreground">of {formattedGoal}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{donors} donors</span>
              </div>
              {daysLeft !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{daysLeft} days left</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5">
        <Button asChild className="w-full gradient_accent text-white">
          <Link to={`/campaigns/${id}`}>Donate Now</Link>
        </Button>
      </div>
    </Card>
  );
};
