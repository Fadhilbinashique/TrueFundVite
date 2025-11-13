import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/CampaignCard";
import { Heart, TrendingUp, User, Settings } from "lucide-react";
import { Link } from "wouter";
import type { Campaign, Donation } from "@shared/schema";

export default function Profile() {
  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
  });

  const { data: myCampaigns = [] } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns/my'],
  });

  const { data: myDonations = [] } = useQuery<Donation[]>({
    queryKey: ['/api/donations/my'],
  });

  const totalRaised = myCampaigns.reduce((sum, c) => sum + c.collectedAmount, 0);
  const totalDonated = myDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="container mx-auto px-6 max-w-6xl">
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.profilePhotoUrl} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold" data-testid="text-user-name">
                    {user?.name || 'User'}
                  </h1>
                  {user?.isNgo && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      NGO Verified
                    </Badge>
                  )}
                  {user?.isAdmin && (
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{user?.email}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {myCampaigns.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Campaigns Created</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ₹{totalRaised.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Raised</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ₹{totalDonated.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Donated</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {user?.isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" data-testid="link-admin">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                {user?.isNgo && (
                  <Link href="/ngo-dashboard">
                    <Button variant="outline" data-testid="link-ngo">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      NGO Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="campaigns" data-testid="tab-campaigns">
              My Campaigns
            </TabsTrigger>
            <TabsTrigger value="donations" data-testid="tab-donations">
              My Donations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            {myCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your first fundraising campaign today
                  </p>
                  <Link href="/start-campaign">
                    <Button data-testid="button-create-campaign">
                      Create Campaign
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="donations" className="space-y-4">
            {myDonations.length > 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {myDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                        data-testid={`donation-${donation.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">Campaign Donation</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">
                            ₹{donation.amount.toLocaleString()}
                          </div>
                          {donation.tipAmount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              +₹{donation.tipAmount} tip
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No donations yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Support a cause and make a difference today
                  </p>
                  <Link href="/explore">
                    <Button data-testid="button-explore">
                      Explore Campaigns
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
