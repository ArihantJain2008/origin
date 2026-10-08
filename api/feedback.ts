import { createHash } from "node:crypto";

interface VercelRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
}

type FeedbackType = "bug" | "feature" | "improvement" | "general" | "question";
const allowedTypes = new Set<FeedbackType>(["bug", "feature", "improvement", "general", "question"]);
const maxBodyBytes = 20_000;
const rateWindowMs = 60 * 60 * 1000;
const rateLimit = 5;
const requestLog = new Map<string, number[]>();
const allowedBodyKeys = new Set(["type", "title", "description", "email", "additional_details", "website"]);

const detailKeys: Record<Exclude<FeedbackType, "general">, string[]> = {
  bug: ["what_happened", "expected_behavior", "steps_to_reproduce", "device", "os", "origin_version"],
  feature: ["what_would_you_like", "why_useful"],
  improvement: ["what_could_be_improved", "how_should_it_work"],
  question: ["what_are_you_trying_to_do", "what_problem_are_you_facing"],
};

function response(res: VercelResponse, status: number, body: unknown) {
  return res.status(status).setHeader("Cache-Control", "no-store").json(body);
}

function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length <= max ? value.trim() : null;
}

function getClientIp(req: VercelRequest) {
  const forwarded = req.headers["x-forwarded-for"];
  return (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(req: VercelRequest) {
  const salt = process.env.FEEDBACK_RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "origin-feedback";
  const key = createHash("sha256").update(`${salt}:${getClientIp(req)}`).digest("hex");
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter((timestamp) => now - timestamp < rateWindowMs);
  if (recent.length >= rateLimit) {
    requestLog.set(key, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return response(res, 405, { ok: false, error: "Method not allowed." });
  if (isRateLimited(req)) return response(res, 429, { ok: false, error: "Too many submissions. Please try again later." });

  const contentLength = req.headers["content-length"];
  if (contentLength && Number(contentLength) > maxBodyBytes) return response(res, 400, { ok: false, error: "Request is too large." });

  const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  if (Buffer.byteLength(rawBody, "utf8") > maxBodyBytes) return response(res, 400, { ok: false, error: "Request is too large." });

  let body: Record<string, unknown>;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body as Record<string, unknown>);
  } catch {
    return response(res, 400, { ok: false, error: "Request body must be valid JSON." });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return response(res, 400, { ok: false, error: "Request body must be an object." });
  if (typeof body.website === "string" && body.website.trim()) return response(res, 200, { ok: true });

  if (Object.keys(body).some((key) => !allowedBodyKeys.has(key))) return response(res, 400, { ok: false, error: "Request contains unsupported fields." });

  const fieldErrors: Record<string, string> = {};
  const type = body.type;
  const title = text(body.title, 120);
  const description = text(body.description, 4000);
  const email = body.email === undefined || body.email === "" ? null : text(body.email, 254);
  const details = body.additional_details;

  if (typeof type !== "string" || !allowedTypes.has(type as FeedbackType)) fieldErrors.type = "Choose a valid feedback type.";
  if (!title || title.length < 5) fieldErrors.title = "Title must be at least 5 characters.";
  if (typeof body.title !== "string" || body.title.length > 120) fieldErrors.title = "Title must be 120 characters or fewer.";
  if (!description || description.length < 20) fieldErrors.description = "Description must be at least 20 characters.";
  if (typeof body.description !== "string" || body.description.length > 4000) fieldErrors.description = "Description must be 4,000 characters or fewer.";
  if (body.email !== undefined && body.email !== "" && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) fieldErrors.email = "Enter a valid email address.";
  if (!details || typeof details !== "object" || Array.isArray(details)) fieldErrors.additional_details = "Additional details are required.";

  const feedbackType = type as FeedbackType;
  const safeDetails: Record<string, string> = {};
  if (details && typeof details === "object" && !Array.isArray(details) && feedbackType !== "general" && detailKeys[feedbackType]) {
    for (const key of detailKeys[feedbackType]) {
      const value = (details as Record<string, unknown>)[key];
      if (!text(value, 2000) || (value as string).trim().length < 3) fieldErrors[key] = "This field must be at least 3 characters.";
      else safeDetails[key] = (value as string).trim();
    }
  }
  if (Object.keys(fieldErrors).length) return response(res, 400, { ok: false, error: "Please correct the highlighted fields.", fieldErrors });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return response(res, 503, { ok: false, error: "Feedback is temporarily unavailable." });

  try {
    const insert = await fetch(`${url.replace(/\/$/, "")}/rest/v1/feedback`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ type, title, description, email, additional_details: safeDetails, device: safeDetails.device || null, os: safeDetails.os || null, origin_version: safeDetails.origin_version || null }),
    });
    if (!insert.ok) return response(res, 503, { ok: false, error: "Feedback is temporarily unavailable." });
    return response(res, 201, { ok: true });
  } catch {
    return response(res, 503, { ok: false, error: "Feedback is temporarily unavailable." });
  }
}