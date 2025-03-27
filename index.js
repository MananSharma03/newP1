// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters")
});
var messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty")
});

// server/routes.ts
import fs from "fs";
import path from "path";
import axios from "axios";
async function registerRoutes(app2) {
  const apiRouter = app2.route("/api");
  app2.post("/api/chat", async (req, res) => {
    try {
      const result = messageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      const { message } = result.data;
      const systemPrompt = `
        You are a helpful assistant for John Doe's portfolio website. 
        Your role is to answer questions about John's background, skills, 
        and experience based on the following information:

        ABOUT JOHN:
        John is a Data Engineer & DevOps Specialist with over 5 years of experience.
        He transforms complex data challenges into efficient, scalable solutions.

        WORK EXPERIENCE:
        - Senior Data Engineer at TechCorp Inc. (2020-Present)
          Led the design and implementation of scalable data pipelines processing 5TB+ daily.
          Reduced processing time by 40% through optimization and parallel processing techniques.
        
        - DevOps Engineer at InnoSystems LLC (2018-2020)
          Implemented CI/CD pipelines reducing deployment time by 60%.
          Managed Kubernetes clusters and containerized applications for improved scalability and resource utilization.

        EDUCATION:
        - M.S. in Computer Science, Stanford University (2016-2018)
          Specialized in Data Systems and Cloud Computing.
          Thesis on distributed data processing systems.
        
        - B.S. in Computer Engineering, MIT (2012-2016)
          Graduated with honors. Focus on software engineering and database systems.

        SKILLS:
        - Data Engineering: SQL & NoSQL Databases (90%), ETL/ELT Pipelines (85%), 
          Data Warehousing (80%), Big Data Technologies (75%), Data Modeling (85%)
        
        - DevOps: CI/CD Pipelines (90%), Container Orchestration (85%), 
          Infrastructure as Code (80%), Cloud Platforms (85%), 
          Monitoring & Observability (75%)

        CERTIFICATIONS:
        - AWS Certified Data Analytics Specialty (2022)
        - Certified Kubernetes Administrator (2021)
        - Google Professional Data Engineer (2020)
        - Azure DevOps Engineer Expert (2019)

        TECHNOLOGIES:
        Python, SQL, AWS, Docker, Kubernetes, Git

        Keep your answers focused on the details provided. Be helpful, concise, 
        and professional. If you don't know something, say so rather than making up information.
      `;
      try {
        const apiKey = process.env.GROQ_API_KEY || "";
        if (!apiKey) {
          console.error("GROQ_API_KEY is not set");
          return res.status(500).json({ error: "API key configuration error" });
        }
        const response = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama3-8b-8192",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 1024
          },
          {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            }
          }
        );
        const assistantReply = response.data.choices[0].message.content;
        return res.json({ reply: assistantReply });
      } catch (error) {
        console.error("Error calling Groq API:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to get response from AI service" });
      }
    } catch (error) {
      console.error("Chat API error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const result = contactSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid contact form data" });
      }
      const contact = result.data;
      console.log("Contact form submission:", contact);
      return res.status(200).json({ message: "Contact form submitted successfully" });
    } catch (error) {
      console.error("Contact API error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/resume/download", (req, res) => {
    try {
      const filePath = path.join(__dirname, "resume.pdf");
      const tempFilePath = path.join(__dirname, "temp_resume.txt");
      fs.writeFileSync(tempFilePath, "John Doe's Resume - Data Engineer & DevOps Specialist");
      res.download(tempFilePath, "john_doe_resume.txt", (err) => {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        if (err) {
          console.error("Resume download error:", err);
          return res.status(500).json({ error: "Failed to download resume" });
        }
      });
    } catch (error) {
      console.error("Resume API error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname2 = dirname(__filename);
var vite_config_default = defineConfig({
  base: "/newP1/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname2, "client", "src"),
      "@shared": path2.resolve(__dirname2, "shared"),
      "@assets": path2.resolve(__dirname2, "attached_assets")
    }
  },
  root: path2.resolve(__dirname2, "client"),
  build: {
    outDir: path2.resolve(__dirname2, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname3 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname3,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname3, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
