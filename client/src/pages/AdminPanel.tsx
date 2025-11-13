import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { NgoVerification, Ticket, Campaign } from "@shared/schema";

export default function AdminPanel() {
  const { toast } = useToast();

  const { data: verifications = [] } = useQuery<NgoVerification[]>({
    queryKey: ['/api/admin/ngo-verifications'],
  });

  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ['/api/admin/tickets'],
  });

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns'],
  });

  const verifyNgoMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      return apiRequest('PATCH', `/api/admin/ngo-verifications/${id}`, { verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ngo-verifications'] });
      toast({
        title: "Updated",
        description: "NGO verification status updated successfully.",
      });
    },
  });

  const resolveTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('PATCH', `/api/admin/tickets/${id}`, { status: 'resolved' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      toast({
        title: "Resolved",
        description: "Ticket has been marked as resolved.",
      });
    },
  });

  const pendingVerifications = verifications.filter(v => !v.verified);
  const pendingTickets = tickets.filter(t => t.status === 'open');
  const temporaryCampaigns = campaigns.filter(c => c.isTemporary && !c.verified);

  return (
    <div className="min-h-screen py-8 pb-24 md:pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-lg text-muted-foreground">
            Manage verifications, campaigns, and support tickets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Pending Verifications</div>
                  <div className="text-3xl font-bold" data-testid="text-pending-verifications">
                    {pendingVerifications.length}
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Temporary Campaigns</div>
                  <div className="text-3xl font-bold" data-testid="text-temporary-campaigns">
                    {temporaryCampaigns.length}
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Open Tickets</div>
                  <div className="text-3xl font-bold" data-testid="text-open-tickets">
                    {pendingTickets.length}
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verifications" data-testid="tab-verifications">
              NGO Verifications
            </TabsTrigger>
            <TabsTrigger value="campaigns" data-testid="tab-campaigns">
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="tickets" data-testid="tab-tickets">
              Support Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>NGO Verification Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {verifications.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verifications.map((verification) => (
                        <TableRow key={verification.id}>
                          <TableCell className="font-mono text-sm">
                            {verification.userId.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {verification.documentsUrl ? (
                              <a
                                href={verification.documentsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                View Documents
                              </a>
                            ) : (
                              <span className="text-muted-foreground">No documents</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(verification.requestedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {verification.verified ? (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {!verification.verified && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    verifyNgoMutation.mutate({
                                      id: verification.id,
                                      verified: true,
                                    })
                                  }
                                  data-testid={`button-approve-${verification.id}`}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    verifyNgoMutation.mutate({
                                      id: verification.id,
                                      verified: false,
                                    })
                                  }
                                  data-testid={`button-reject-${verification.id}`}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No verification requests
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Management</CardTitle>
              </CardHeader>
              <CardContent>
                {temporaryCampaigns.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Cause</TableHead>
                        <TableHead>Goal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hospital Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {temporaryCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.title}</TableCell>
                          <TableCell>{campaign.cause}</TableCell>
                          <TableCell>₹{campaign.goalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-700">
                              Temporary
                            </Badge>
                          </TableCell>
                          <TableCell>{campaign.hospitalEmail || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No temporary campaigns
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                {tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-4 border rounded-lg"
                        data-testid={`ticket-${ticket.id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold">{ticket.name}</div>
                            <div className="text-sm text-muted-foreground">{ticket.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                ticket.status === 'open'
                                  ? 'bg-red-500/10 text-red-700'
                                  : 'bg-primary/10 text-primary'
                              }
                            >
                              {ticket.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm mb-3">{ticket.message}</p>
                        {ticket.status === 'open' && (
                          <Button
                            size="sm"
                            onClick={() => resolveTicketMutation.mutate(ticket.id)}
                            data-testid={`button-resolve-${ticket.id}`}
                          >
                            Mark as Resolved
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No support tickets
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
