// api/submit-campaign.js
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/*
This endpoint expects a POST JSON body:
{
  user_id, title, description, goal_amount, location, cause, category, image_url, is_temporary
}
*/
app.post("/", async (req, res) => {
  try {
    const p = req.body;
    const userId = p.user_id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    if (!p.title || !p.goal_amount)
      return res.status(400).json({ error: "Missing fields" });

    // fetch user to check KYC/NGO
    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .select("id,kyc_verified,is_ngo")
      .eq("id", userId)
      .single();

    if (userErr || !user)
      return res.status(404).json({ error: "User not found" });
    if (!user.kyc_verified)
      return res
        .status(403)
        .json({ error: "KYC required to start a campaign" });
    if (p.cause === "Disaster Relief" && !user.is_ngo) {
      return res.status(403).json({
        error: "Only verified NGOs can create Disaster Relief campaigns",
      });
    }

    const code =
      "TF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(code)}`;

    const insert = {
      title: p.title,
      description: p.description || "",
      image_url: p.image_url || null,
      location: p.location || "",
      cause: p.cause || "",
      category: p.category || null,
      goal_amount: p.goal_amount,
      collected_amount: 0,
      unique_code: code,
      qr_url: qrUrl,
      verified: false,
      is_temporary: !!p.is_temporary,
      created_by: userId,
    };

    const { data, error } = await supabaseAdmin
      .from("campaigns")
      .insert(insert)
      .select()
      .single();
    if (error) throw error;

    return res.json({ ok: true, campaign: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "server error" });
  }
});

export default app;
