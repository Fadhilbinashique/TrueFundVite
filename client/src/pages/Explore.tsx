import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CampaignCard } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, CheckCircle } from "lucide-react";
import type { Campaign } from "@shared/schema";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCause, setSelectedCause] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
  });

  const causes = ["Medical", "Education", "Disaster Relief", "Community"];
  
  const locations = useMemo(() => {
    const locs = campaigns
      .map(c => c.location)
      .filter((l): l is string => !!l);
    return Array.from(new Set(locs));
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.title.toLowerCase().includes(query) ||
          c.uniqueCode?.toLowerCase().includes(query)
      );
    }

    if (selectedCause !== "all") {
      filtered = filtered.filter(c => c.cause === selectedCause);
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter(c => c.location === selectedLocation);
    }

    if (showVerifiedOnly) {
      filtered = filtered.filter(c => c.verified);
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "funded":
        filtered.sort((a, b) => b.collectedAmount - a.collectedAmount);
        break;
      case "verified":
        filtered.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
        break;
    }

    return filtered;
  }, [campaigns, searchQuery, selectedCause, selectedLocation, showVerifiedOnly, sortBy]);

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Campaigns</h1>
          <p className="text-lg text-muted-foreground">
            Discover causes that need your support
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 mb-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by title or code (e.g., TF-ABC123)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                data-testid="input-search-campaigns"
              />
            </div>
            <Button variant="outline" data-testid="button-search">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCause} onValueChange={setSelectedCause}>
                <SelectTrigger data-testid="select-cause">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {causes.map((cause) => (
                    <SelectItem key={cause} value={cause}>
                      {cause}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger data-testid="select-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="funded">Most Funded</SelectItem>
                  <SelectItem value="verified">Verified First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filters</label>
              <Button
                variant={showVerifiedOnly ? "default" : "outline"}
                className="w-full"
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                data-testid="button-verified-filter"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified Only
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedCause !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCause("all")}>
                {selectedCause} ×
              </Badge>
            )}
            {selectedLocation !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedLocation("all")}>
                {selectedLocation} ×
              </Badge>
            )}
            {showVerifiedOnly && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowVerifiedOnly(false)}>
                Verified Only ×
              </Badge>
            )}
          </div>
        </div>

        <div className="mb-4 text-muted-foreground">
          Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
