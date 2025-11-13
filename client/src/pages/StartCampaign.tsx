import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";

export default function StartCampaign() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cause, setCause] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [hospitalEmail, setHospitalEmail] = useState("");
  const [isTemporary, setIsTemporary] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/campaigns', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign Created!",
        description: "Your campaign is now live and ready to receive donations.",
      });
      navigate(`/campaign/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    let imageUrl = "";

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data, error } = await supabase.storage
        .from('campaign-images')
        .upload(fileName, imageFile);

      if (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Continuing without image.",
          variant: "destructive",
        });
      } else {
        const { data: urlData } = supabase.storage
          .from('campaign-images')
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    createCampaignMutation.mutate({
      title,
      description,
      cause,
      goalAmount: parseInt(goalAmount),
      location,
      imageUrl: imageUrl || undefined,
      hospitalEmail: cause === "Medical" ? hospitalEmail : undefined,
      isTemporary: cause === "Medical" && isTemporary,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return title && description;
      case 2:
        return cause && goalAmount && parseInt(goalAmount) > 0;
      case 3:
        return location;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen py-12 pb-24 md:pb-12">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Start a Campaign</h1>
          <p className="text-lg text-muted-foreground">
            Create your fundraising campaign in a few simple steps
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Step {step} of {totalSteps}</span>
            <span>{progress.toFixed(0)}% complete</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Campaign Details"}
              {step === 2 && "Cause & Goal"}
              {step === 3 && "Location & Image"}
              {step === 4 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your campaign"}
              {step === 2 && "Choose a category and set your fundraising goal"}
              {step === 3 && "Where is this campaign located?"}
              {step === 4 && "Review your campaign before publishing"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    placeholder="Help Save Lives Through Clean Water Initiative"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Campaign Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your cause, why it matters, and how the funds will be used..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    data-testid="textarea-description"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be detailed and specific about your cause to build trust
                  </p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="cause">Campaign Category *</Label>
                  <Select value={cause} onValueChange={setCause}>
                    <SelectTrigger data-testid="select-cause">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {cause === "Medical" && (
                  <>
                    <div>
                      <Label htmlFor="hospital-email">Hospital/Clinic Email</Label>
                      <Input
                        id="hospital-email"
                        type="email"
                        placeholder="hospital@example.com"
                        value={hospitalEmail}
                        onChange={(e) => setHospitalEmail(e.target.value)}
                        data-testid="input-hospital-email"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        We'll send a verification request to confirm the medical need
                      </p>
                    </div>

                    <div className="flex items-start space-x-2 p-4 bg-muted/50 rounded-lg">
                      <Checkbox
                        id="temporary"
                        checked={isTemporary}
                        onCheckedChange={(checked) => setIsTemporary(checked as boolean)}
                        data-testid="checkbox-temporary"
                      />
                      <div className="flex-1">
                        <Label htmlFor="temporary" className="font-medium">
                          Launch Now (Temporary)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Accept donations immediately, but funds won't be released until hospital verification is complete
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="goal">Fundraising Goal (₹) *</Label>
                  <Input
                    id="goal"
                    type="number"
                    placeholder="100000"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    data-testid="input-goal"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Set a realistic goal that covers your actual needs
                  </p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Mumbai, Maharashtra"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    data-testid="input-location"
                  />
                </div>

                <div>
                  <Label>Campaign Image</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover-elevate">
                        <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload an image
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                          data-testid="input-image"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Campaign Summary</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-muted-foreground">Title</dt>
                      <dd className="font-medium">{title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Description</dt>
                      <dd className="text-sm line-clamp-3">{description}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-muted-foreground">Category</dt>
                        <dd className="font-medium">{cause}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Goal</dt>
                        <dd className="font-medium">₹{parseInt(goalAmount).toLocaleString()}</dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Location</dt>
                      <dd className="font-medium">{location}</dd>
                    </div>
                    {imagePreview && (
                      <div>
                        <dt className="text-sm text-muted-foreground mb-2">Image</dt>
                        <img src={imagePreview} alt="Campaign" className="w-full h-48 object-cover rounded-lg" />
                      </div>
                    )}
                  </dl>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm">
                    By submitting, you agree to our terms and conditions. 
                    {cause === "Medical" && hospitalEmail && !isTemporary && 
                      " Your campaign will be pending until hospital verification is complete."
                    }
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createCampaignMutation.isPending || !canProceed()}
                  data-testid="button-submit-campaign"
                >
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
