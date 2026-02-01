import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { securityHeaders } from "./middleware/security.middleware.js";

const app = express();

// Trust proxy for production (Replit uses reverse proxy)
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// SECURITY: Require SESSION_SECRET in production - no default fallback
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  console.error('[SECURITY] SESSION_SECRET not configured in production - this is a critical security risk');
  process.exit(1);
}

// Configure session middleware - SECURITY hardened configuration
app.use(session({
  secret: sessionSecret || 'dev-only-secret-do-not-use-in-production',
  resave: false, // SECURITY: Prevent race conditions with concurrent requests
  saveUninitialized: false, // SECURITY: Don't create sessions until needed
  rolling: true,
  proxy: true,
  name: 'sessionId', // SECURITY: Use generic name instead of default 'connect.sid'
  cookie: {
    secure: process.env.NODE_ENV === 'production', // SECURITY: Only require HTTPS in production
    httpOnly: true, // SECURITY: Prevent XSS access to cookie
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // SECURITY: Strict in production
  }
}));

// SECURITY: Add CSP and security headers
app.use(securityHeaders);

// SECURITY: Sensitive fields to redact from logs
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken', 'authorization'];

// Recursively redact sensitive fields from objects
function redactSensitive(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitive);

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      result[key] = redactSensitive(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

app.use((req, res, next) => {
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
        // SECURITY: Redact sensitive fields before logging
        const safeResponse = redactSensitive(capturedJsonResponse);
        logLine += ` :: ${JSON.stringify(safeResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Start follow-up automation service (sends review requests)
  try {
    const { startFollowUpAutomation } = await import('./services/follow-up-automation.js');
    startFollowUpAutomation();
  } catch (err) {
    console.error('[Index] Failed to start follow-up automation:', err);
  }

  // Start retry queue worker
  try {
    const { startRetryQueueWorker } = await import('./services/retry-queue-worker.js');
    startRetryQueueWorker();
  } catch (err) {
    console.error('[Index] Failed to start retry queue worker:', err);
  }
})();
