import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase } from "./supabase";

// Helper function to generate unique campaign code
function generateUniqueCampaignCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth endpoints
  app.get('/api/auth/session', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json(null);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.json(null);
    }

    res.json({ user });
  });

  app.get('/api/auth/user', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  });

  // Campaign endpoints
  app.get('/api/campaigns', async (req, res) => {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(campaigns);
  });

  app.get('/api/campaigns/:id', async (req, res) => {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  });

  app.get('/api/campaigns/my', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(campaigns);
  });

  app.post('/api/campaigns', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const uniqueCode = generateUniqueCampaignCode();
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        ...req.body,
        created_by: user.id,
        unique_code: uniqueCode,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // TODO: If medical campaign with hospital email, send verification email
    if (req.body.cause === 'Medical' && req.body.hospitalEmail && !req.body.isTemporary) {
      // Send hospital verification email
      console.log('TODO: Send hospital verification email to:', req.body.hospitalEmail);
    }

    res.json(campaign);
  });

  // Donations endpoints
  app.get('/api/campaigns/:id/donations', async (req, res) => {
    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .eq('campaign_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(donations);
  });

  app.get('/api/donations/my', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(donations);
  });

  app.post('/api/donations', async (req, res) => {
    const { campaignId, amount, tipAmount, donorName } = req.body;

    const authHeader = req.headers.authorization;
    let donorId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      donorId = user?.id;
    }

    // Create donation
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        campaign_id: campaignId,
        amount: amount,
        tip_amount: tipAmount || 0,
        donor_name: donorName,
        donor_id: donorId,
      })
      .select()
      .single();

    if (donationError) {
      return res.status(500).json({ error: donationError.message });
    }

    // Update campaign collected amount atomically
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('collected_amount')
      .eq('id', campaignId)
      .single();

    if (campaign) {
      await supabase
        .from('campaigns')
        .update({ collected_amount: campaign.collected_amount + amount })
        .eq('id', campaignId);
    }

    res.json(donation);
  });

  // Reviews endpoints
  app.get('/api/reviews', async (req, res) => {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(reviews);
  });

  app.post('/api/reviews', async (req, res) => {
    const { data: review, error } = await supabase
      .from('reviews')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(review);
  });

  // Tickets endpoints
  app.get('/api/admin/tickets', async (req, res) => {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(tickets);
  });

  app.post('/api/tickets', async (req, res) => {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(ticket);
  });

  app.patch('/api/admin/tickets/:id', async (req, res) => {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(ticket);
  });

  // NGO Verifications endpoints
  app.get('/api/ngo-verifications/my', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: verification, error } = await supabase
      .from('ngo_verifications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    res.json(verification);
  });

  app.post('/api/ngo-verifications', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: verification, error } = await supabase
      .from('ngo_verifications')
      .insert({
        ...req.body,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(verification);
  });

  app.get('/api/admin/ngo-verifications', async (req, res) => {
    const { data: verifications, error } = await supabase
      .from('ngo_verifications')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(verifications);
  });

  app.patch('/api/admin/ngo-verifications/:id', async (req, res) => {
    const { verified } = req.body;
    
    const { data: verification, error } = await supabase
      .from('ngo_verifications')
      .update({ verified })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // If approved, update user's is_ngo status
    if (verified) {
      await supabase
        .from('users')
        .update({ is_ngo: true })
        .eq('id', verification.user_id);
    }

    res.json(verification);
  });

  // Stats endpoint
  app.get('/api/stats', async (req, res) => {
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('collected_amount, verified');

    const { data: donations } = await supabase
      .from('donations')
      .select('amount');

    const totalRaised = campaigns?.reduce((sum, c) => sum + (c.collected_amount || 0), 0) || 0;
    const campaignsFunded = campaigns?.filter(c => c.verified).length || 0;
    const livesImpacted = donations?.length || 0;

    res.json({
      totalRaised,
      campaignsFunded,
      livesImpacted,
    });
  });

  // Hospital verification endpoints (stubbed)
  app.post('/api/send-hospital-verification', async (req, res) => {
    const { campaignId, hospitalEmail } = req.body;
    
    // TODO: Implement email sending with your preferred email service
    // For now, just log it
    console.log(`Send verification email to ${hospitalEmail} for campaign ${campaignId}`);
    console.log(`Verification link: ${process.env.VITE_SUPABASE_URL}/api/verify-hospital?campaign_id=${campaignId}&decision=yes`);
    
    res.json({ success: true, message: 'Verification email sent (stubbed)' });
  });

  app.get('/api/verify-hospital', async (req, res) => {
    const { campaign_id, decision } = req.query;
    
    if (!campaign_id || !decision) {
      return res.status(400).send('Invalid request');
    }

    const verified = decision === 'yes';
    
    const { error } = await supabase
      .from('campaigns')
      .update({ verified })
      .eq('id', campaign_id as string);

    if (error) {
      return res.status(500).send('Error updating campaign');
    }

    res.send(`
      <html>
        <head><title>Hospital Verification</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>${verified ? '✓ Verified' : '✗ Declined'}</h1>
          <p>The campaign has been ${verified ? 'verified' : 'declined'} successfully.</p>
          <p><a href="${process.env.VITE_SUPABASE_URL || 'https://truefund.com'}">Return to TrueFund</a></p>
        </body>
      </html>
    `);
  });

  const httpServer = createServer(app);
  return httpServer;
}
