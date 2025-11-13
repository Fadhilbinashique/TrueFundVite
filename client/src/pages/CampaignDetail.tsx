import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MapPin, CheckCircle, Share2, QrCode, Image as ImageIcon, Download, Calendar, Users } from "lucide-react";
import { generateQRCode, generatePoster } from "@/lib/qrcode";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Campaign, Donation, Review } from "@shared/schema";

export default function CampaignDetail() {
  const [, params] = useRoute("/campaign/:id");
  const campaignId = params?.id;
  const { toast } = useToast();

  const [donateOpen, setDonateOpen] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [includeTip, setIncludeTip] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: ['/api/campaigns', campaignId],
  });

  const { data: donations = [] } = useQuery<Donation[]>({
    queryKey: ['/api/campaigns', campaignId, 'donations'],
    enabled: !!campaignId,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
  });

  const donateMutation = useMutation({
    mutationFn: async (data: { campaignId: string; amount: number; tipAmount: number; donorName?: string }) => {
      return apiRequest('POST', '/api/donations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns', campaignId, 'donations'] });
      toast({
        title: "Thank you!",
        description: "Your donation has been processed successfully.",
      });
      setDonateOpen(false);
      setAmount("");
      setDonorName("");
      setIncludeTip(false);
    },
  });

  const handleDonate = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    const donationAmount = parseFloat(amount);
    const tipAmount = includeTip ? Math.round(donationAmount * 0.1) : 0;

    donateMutation.mutate({
      campaignId: campaignId!,
      amount: donationAmount,
      tipAmount,
      donorName: donorName || undefined,
    });
  };

  const handleGenerateQR = async () => {
    if (!campaign) return;
    const url = `${window.location.origin}/campaign/${campaign.id}`;
    const qr = await generateQRCode(url);
    setQrUrl(qr);
    
    const link = document.createElement('a');
    link.href = qr;
    link.download = `${campaign.uniqueCode}-qr.png`;
    link.click();
    
    toast({
      title: "QR Code Downloaded",
      description: "Share this to let others donate easily!",
    });
  };

  const handleGeneratePoster = async () => {
    if (!campaign) return;
    
    const url = `${window.location.origin}/campaign/${campaign.id}`;
    const qr = await generateQRCode(url);
    const poster = await generatePoster(
      campaign.imageUrl || '',
      campaign.title,
      qr,
      campaign.goalAmount,
      campaign.collectedAmount
    );
    
    setPosterUrl(poster);
    
    const link = document.createElement('a');
    link.href = poster;
    link.download = `${campaign.uniqueCode}-poster.png`;
    link.click();
    
    toast({
      title: "Poster Generated",
      description: "Your campaign poster is ready!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campaign not found</h2>
          <p className="text-muted-foreground">This campaign may have been removed</p>
        </div>
      </div>
    );
  }

  const progress = campaign.goalAmount
    ? Math.min((campaign.collectedAmount / campaign.goalAmount) * 100, 100)
    : 0;

  const daysRemaining = 30;

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="relative aspect-video w-full max-h-[500px] overflow-hidden">
        <img
          src={campaign.imageUrl || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200"}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-6 right-6 flex gap-2">
          <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-white/20">
            {campaign.cause}
          </Badge>
          {campaign.verified && (
            <Badge variant="secondary" className="bg-primary/90 text-white border-white/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4" data-testid="text-campaign-title">
                {campaign.title}
              </h1>
              {campaign.location && (
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  {campaign.location}
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created {new Date(campaign.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {donations.length} supporter{donations.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">About this campaign</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="whitespace-pre-wrap">{campaign.description || 'No description provided.'}</p>
                </div>
              </CardContent>
            </Card>

            {reviews.length > 0 && (
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">Reviews & Testimonials</h2>
                  <div className="space-y-6">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="flex gap-4">
                        <img
                          src={review.userImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userName}`}
                          alt={review.userName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{review.userName}</span>
                            <div className="flex">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <span key={i} className="text-yellow-500">★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.reviewText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2" data-testid="text-collected">
                    ₹{campaign.collectedAmount.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground mb-4">
                    raised of ₹{campaign.goalAmount.toLocaleString()} goal
                  </div>
                  <Progress value={progress} className="h-3 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{progress.toFixed(0)}% funded</span>
                    <span>{daysRemaining} days left</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center mb-2">
                    <div className="text-2xl font-bold">{donations.length}</div>
                    <div className="text-sm text-muted-foreground">supporters</div>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={() => setDonateOpen(true)}
                  data-testid="button-donate-now"
                >
                  Donate Now
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={handleGenerateQR} data-testid="button-download-qr">
                    <QrCode className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGeneratePoster} data-testid="button-generate-poster">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Poster
                  </Button>
                </div>

                <Button variant="outline" className="w-full" data-testid="button-share">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Campaign
                </Button>

                {campaign.uniqueCode && (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">Campaign Code</div>
                    <div className="font-mono font-bold text-lg" data-testid="text-unique-code">
                      {campaign.uniqueCode}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
        <DialogContent data-testid="dialog-donate">
          <DialogHeader>
            <DialogTitle>Support this campaign</DialogTitle>
            <DialogDescription>
              Your donation will help make a real difference
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="donor-name">Your Name (Optional)</Label>
              <Input
                id="donor-name"
                placeholder="Anonymous"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                data-testid="input-donor-name"
              />
            </div>

            <div>
              <Label htmlFor="amount">Donation Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="tip"
                checked={includeTip}
                onCheckedChange={(checked) => setIncludeTip(checked as boolean)}
                data-testid="checkbox-tip"
              />
              <Label htmlFor="tip" className="text-sm">
                Add 10% tip to support TrueFund's platform costs
              </Label>
            </div>

            {includeTip && amount && parseFloat(amount) > 0 && (
              <div className="text-sm text-muted-foreground">
                Tip amount: ₹{(parseFloat(amount) * 0.1).toFixed(2)}
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold">
                  ₹{amount && parseFloat(amount) > 0
                    ? (parseFloat(amount) * (includeTip ? 1.1 : 1)).toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <Button
                className="w-full"
                onClick={handleDonate}
                disabled={donateMutation.isPending || !amount || parseFloat(amount) <= 0}
                data-testid="button-confirm-donate"
              >
                {donateMutation.isPending ? 'Processing...' : 'Complete Donation'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This is a demo. No actual payment will be processed.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
