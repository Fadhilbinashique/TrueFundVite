import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampaignCard } from "@/components/CampaignCard";
import { Search, TrendingUp, Users, Heart, Target } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Hero_image_community_support_f48320b5.png";
import type { Campaign } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
  });

  const { data: stats } = useQuery<{
    totalRaised: number;
    campaignsFunded: number;
    livesImpacted: number;
  }>({
    queryKey: ['/api/stats'],
  });

  const featured = campaigns.filter(c => c.verified).slice(0, 3);
  const trending = campaigns.slice(0, 4);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/explore?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      <section 
        className="relative h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight" data-testid="text-hero-title">
            Fund What Matters
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Transparent crowdfunding for medical needs, education, and community causes. Every rupee makes a difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/start-campaign">
              <Button size="lg" className="text-lg px-8" data-testid="button-start-campaign-hero">
                Start a Campaign
              </Button>
            </Link>
            <Link href="/explore">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                data-testid="button-explore-causes"
              >
                Explore Causes
              </Button>
            </Link>
          </div>

          <div className="pt-8">
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <label className="block text-sm font-medium mb-2">Search by campaign title or code</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., TF-ABC123"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  data-testid="input-search-hero"
                />
                <Button onClick={handleSearch} variant="secondary" data-testid="button-search-hero">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl font-bold" data-testid="text-total-raised">
                ₹{stats?.totalRaised.toLocaleString() || '0'}
              </div>
              <div className="text-muted-foreground">Total Raised</div>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl font-bold" data-testid="text-campaigns-funded">
                {stats?.campaignsFunded || 0}
              </div>
              <div className="text-muted-foreground">Campaigns Funded</div>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl font-bold" data-testid="text-lives-impacted">
                {stats?.livesImpacted || 0}
              </div>
              <div className="text-muted-foreground">Lives Impacted</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Featured Campaigns</h2>
            <p className="text-muted-foreground text-lg">Verified causes making a real impact</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No featured campaigns yet
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-2">Trending Now</h2>
              <p className="text-muted-foreground">Popular campaigns this week</p>
            </div>
            <Link href="/explore">
              <Button variant="outline" data-testid="button-view-all">
                <TrendingUp className="w-4 h-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {trending.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} compact />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No trending campaigns yet
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
