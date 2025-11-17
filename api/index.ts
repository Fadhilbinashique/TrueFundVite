import express, { type Request, Response, NextFunction } from "express";
// We fix the import paths to go "up one level" to the root
import { registerRoutes } from "../server/routes";
import { log } from "../server/vite";

// This will be our cached Express app
let app: express.Express | null = null;

// This async function sets up our app one time
async function setupApp() {
  // If the app is already set up, just return it
  if (app) {
    return app;
  }

  // Create the app and all your middleware
  const newApp = express();

  declare module 'http' {
    interface IncomingMessage {
      rawBody: unknown
    }
  }
  newApp.use(express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  newApp.use(express.urlencoded({ extended: false }));

  // Your custom logging middleware
  newApp.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }
        log(logLine);
      }
    });

    next();
  });

  // We call your async function to add all API routes
  await registerRoutes(newApp);

  // Add your error handler
  newApp.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err); // Log the error
  });

  // Cache the app and return it
  app = newApp;
  return app;
}

// This is the function Vercel will call on every API request
export default async function handler(req: Request, res: Response) {
  // It waits for the app to be set up (if it's the first request)
  // Then, it passes the request to your Express app
  const expressApp = await setupApp();
  return expressApp(req, res);
}