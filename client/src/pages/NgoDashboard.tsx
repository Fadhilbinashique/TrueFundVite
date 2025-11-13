import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { NgoVerification } from "@shared/schema";

export default function NgoDashboard() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const { data: verification } = useQuery<NgoVerification>({
    queryKey: ['/api/ngo-verifications/my'],
  });

  const requestVerificationMutation = useMutation({
    mutationFn: async (documentsUrl: string) => {
      return apiRequest('POST', '/api/ngo-verifications', { documentsUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ngo-verifications/my'] });
      toast({
        title: "Verification Requested",
        description: "Your documents have been submitted for review.",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('ngo-docs')
      .upload(fileName, file);

    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('ngo-docs')
      .getPublicUrl(fileName);

    await requestVerificationMutation.mutateAsync(urlData.publicUrl);
    setUploading(false);
  };

  const getStatusBadge = () => {
    if (!verification) {
      return <Badge variant="secondary">Not Verified</Badge>;
    }
    if (verification.verified) {
      return (
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
        <Clock className="w-3 h-3 mr-1" />
        Pending Review
      </Badge>
    );
  };

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">NGO Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your NGO verification and access special features
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Verification Status</CardTitle>
                  <CardDescription>
                    Upload your NGO registration documents to get verified
                  </CardDescription>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!verification ? (
                <div className="space-y-4">
                  <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Get NGO Verified</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your NGO registration certificate, trust deed, or official documents
                    </p>
                    <label>
                      <Button disabled={uploading} data-testid="button-upload-docs">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload Documents"}
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        data-testid="input-upload-docs"
                      />
                    </label>
                  </div>
                </div>
              ) : verification.verified ? (
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Your NGO is Verified!</h3>
                  <p className="text-sm text-muted-foreground">
                    You can now create Disaster Relief campaigns and access special NGO features.
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                  <Clock className="w-12 h-12 text-yellow-600 mb-4" />
                  <h3 className="font-semibold mb-2">Verification Pending</h3>
                  <p className="text-sm text-muted-foreground">
                    Your documents are being reviewed by our admin team. This usually takes 24-48 hours.
                  </p>
                  {verification.documentsUrl && (
                    <a
                      href={verification.documentsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      View submitted documents
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NGO Benefits</CardTitle>
              <CardDescription>What you get with NGO verification</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Verified Badge</div>
                    <div className="text-sm text-muted-foreground">
                      Display trust with a verified NGO badge on all your campaigns
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Disaster Relief Campaigns</div>
                    <div className="text-sm text-muted-foreground">
                      Exclusive access to create disaster relief fundraisers
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Priority Listing</div>
                    <div className="text-sm text-muted-foreground">
                      Higher visibility in search and featured sections
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Advanced Analytics</div>
                    <div className="text-sm text-muted-foreground">
                      Detailed insights into donor demographics and campaign performance
                    </div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
