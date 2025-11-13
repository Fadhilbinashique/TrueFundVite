import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { Campaign } from "@shared/schema";

interface CampaignCardProps {
  campaign: Campaign;
  compact?: boolean;
}

export function CampaignCard({ campaign, compact = false }: CampaignCardProps) {
  const progress = campaign.goalAmount
    ? Math.min((campaign.collectedAmount / campaign.goalAmount) * 100, 100)
    : 0;

  const getCauseBadgeColor = (cause: string) => {
    const colors: Record<string, string> = {
      Medical: "bg-red-500/10 text-red-700 border-red-200",
      Education: "bg-blue-500/10 text-blue-700 border-blue-200",
      "Disaster Relief": "bg-orange-500/10 text-orange-700 border-orange-200",
      Community: "bg-purple-500/10 text-purple-700 border-purple-200",
    };
    return colors[cause] || "bg-muted text-muted-foreground";
  };

  return (
    <Card 
      className={`hover-elevate overflow-hidden transition-all ${compact ? '' : 'h-full'}`}
      data-testid={`card-campaign-${campaign.id}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={campaign.imageUrl || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=450&fit=crop"}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className={`${getCauseBadgeColor(campaign.cause || '')} border`}>
            {campaign.cause}
          </Badge>
          {campaign.verified && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold line-clamp-2 mb-2" data-testid={`text-campaign-title-${campaign.id}`}>
            {campaign.title}
          </h3>
          {campaign.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              {campaign.location}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <div>
              <div className="text-2xl font-bold text-primary" data-testid={`text-collected-${campaign.id}`}>
                ₹{campaign.collectedAmount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                raised of ₹{campaign.goalAmount.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{progress.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">funded</div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/campaign/${campaign.id}`} className="w-full">
          <Button className="w-full" data-testid={`button-donate-${campaign.id}`}>
            Donate Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
