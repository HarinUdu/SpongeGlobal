const http = require("http");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { URL } = require("url");

function loadEnvironmentFile() {
  const envPath = path.join(__dirname, ".env");

  return fs
    .readFile(envPath, "utf8")
    .then((content) => {
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
          return;
        }

        const separator = trimmed.indexOf("=");
        const key = trimmed.slice(0, separator).trim();
        let value = trimmed.slice(separator + 1).trim();

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (key && process.env[key] === undefined) {
          process.env[key] = value;
        }
      });
    })
    .catch(() => {});
}

const PUBLIC_DIRECTORY = path.join(__dirname, "public");
const RESULTS_FILE = path.join(__dirname, "data", "results.json");

const workplaceQuestions = [
  {
    id: "COL1",
    category: "Collaboration",
    text: "I actively involve colleagues when a task would benefit from different perspectives.",
    reverse: false,
  },
  {
    id: "COL2",
    category: "Collaboration",
    text: "I prefer to keep useful information to myself unless someone specifically asks for it.",
    reverse: true,
  },
  {
    id: "COL3",
    category: "Collaboration",
    text: "I support a shared team decision even when it is not my first preference.",
    reverse: false,
  },

  {
    id: "ADA1",
    category: "Adaptability",
    text: "I remain effective when priorities change unexpectedly.",
    reverse: false,
  },
  {
    id: "ADA2",
    category: "Adaptability",
    text: "I struggle to regain momentum when a familiar process is replaced.",
    reverse: true,
  },
  {
    id: "ADA3",
    category: "Adaptability",
    text: "I learn new tools and processes with a constructive attitude.",
    reverse: false,
  },

  {
    id: "ACC1",
    category: "Accountability",
    text: "I take ownership of mistakes and focus on correcting them.",
    reverse: false,
  },
  {
    id: "ACC2",
    category: "Accountability",
    text: "I sometimes wait for repeated follow-up before completing difficult commitments.",
    reverse: true,
  },
  {
    id: "ACC3",
    category: "Accountability",
    text: "I communicate early when a deadline or commitment may be at risk.",
    reverse: false,
  },

  {
    id: "COM1",
    category: "Communication",
    text: "I explain information in a way that suits the listener's level of understanding.",
    reverse: false,
  },
  {
    id: "COM2",
    category: "Communication",
    text: "I avoid asking questions when instructions are unclear.",
    reverse: true,
  },
  {
    id: "COM3",
    category: "Communication",
    text: "I communicate disagreement respectfully and constructively.",
    reverse: false,
  },

  {
    id: "PRO1",
    category: "Problem Solving",
    text: "I break complex problems into smaller and more manageable parts.",
    reverse: false,
  },
  {
    id: "PRO2",
    category: "Problem Solving",
    text: "I tend to choose the first available solution without comparing alternatives.",
    reverse: true,
  },
  {
    id: "PRO3",
    category: "Problem Solving",
    text: "After solving a problem, I consider how to prevent it from happening again.",
    reverse: false,
  },

  {
    id: "EMO1",
    category: "Emotional Intelligence",
    text: "I notice when another person's mood may be affecting a workplace conversation.",
    reverse: false,
  },
  {
    id: "EMO2",
    category: "Emotional Intelligence",
    text: "When I feel frustrated, it is difficult for me to control how I respond.",
    reverse: true,
  },
  {
    id: "EMO3",
    category: "Emotional Intelligence",
    text: "I can acknowledge another person's feelings without immediately agreeing with their view.",
    reverse: false,
  },

  {
    id: "LEA1",
    category: "Leadership Potential",
    text: "I help create clarity when a group is uncertain about what to do next.",
    reverse: false,
  },
  {
    id: "LEA2",
    category: "Leadership Potential",
    text: "I avoid taking responsibility for guiding others, even when the situation needs it.",
    reverse: true,
  },
  {
    id: "LEA3",
    category: "Leadership Potential",
    text: "I provide useful feedback while maintaining respect for the person receiving it.",
    reverse: false,
  },

  {
    id: "RES1",
    category: "Resilience",
    text: "I can recover and refocus after a setback at work.",
    reverse: false,
  },
  {
    id: "RES2",
    category: "Resilience",
    text: "A difficult interaction often affects my concentration for the rest of the day.",
    reverse: true,
  },
  {
    id: "RES3",
    category: "Resilience",
    text: "I remain composed when work becomes demanding or uncertain.",
    reverse: false,
  },

  {
    id: "DET1",
    category: "Attention to Detail",
    text: "I check important work for errors before submitting it.",
    reverse: false,
  },
  {
    id: "DET2",
    category: "Attention to Detail",
    text: "I sometimes miss small but important requirements when working quickly.",
    reverse: true,
  },
  {
    id: "DET3",
    category: "Attention to Detail",
    text: "I follow agreed procedures when accuracy or compliance is important.",
    reverse: false,
  },

  {
    id: "INI1",
    category: "Initiative",
    text: "I look for useful improvements without waiting to be instructed.",
    reverse: false,
  },
  {
    id: "INI2",
    category: "Initiative",
    text: "I usually wait for someone else to act when an issue falls outside my normal duties.",
    reverse: true,
  },
  {
    id: "INI3",
    category: "Initiative",
    text: "When I identify a realistic opportunity, I take a practical first step.",
    reverse: false,
  },
];

const thinkingQuestions = [
  {
    id: "TH1",
    text: "When starting an unfamiliar task, which approach feels more natural?",
    leftLabel: "Create a clear sequence first",
    rightLabel: "Explore possibilities as I go",
  },
  {
    id: "TH2",
    text: "When making an important decision, what do you naturally rely on more?",
    leftLabel: "Facts, criteria and comparison",
    rightLabel: "Patterns, instinct and overall feel",
  },
  {
    id: "TH3",
    text: "Which type of information is easier for you to work with?",
    leftLabel: "Specific details and measurements",
    rightLabel: "Themes, concepts and visual ideas",
  },
  {
    id: "TH4",
    text: "How do you usually organise your work?",
    leftLabel: "Planned structure and checkpoints",
    rightLabel: "Flexible flow and changing priorities",
  },
  {
    id: "TH5",
    text: "When solving a problem, what do you prefer to do first?",
    leftLabel: "Define the cause logically",
    rightLabel: "Imagine several possible outcomes",
  },
  {
    id: "TH6",
    text: "Which activity generally feels more energising?",
    leftLabel: "Analysing and improving a system",
    rightLabel: "Creating and experimenting with ideas",
  },
  {
    id: "TH7",
    text: "When learning something new, what helps you most?",
    leftLabel: "Step-by-step instructions",
    rightLabel: "Examples, stories and visualisation",
  },
  {
    id: "TH8",
    text: "When presenting information, what do you tend to emphasise?",
    leftLabel: "Evidence, accuracy and sequence",
    rightLabel: "Meaning, impact and imagination",
  },
  {
    id: "TH9",
    text: "How do you respond to rules and established methods?",
    leftLabel: "Use them for consistency",
    rightLabel: "Adapt them when a new approach may work",
  },
  {
    id: "TH10",
    text: "Which description fits your natural attention better?",
    leftLabel: "I notice components and inconsistencies",
    rightLabel: "I notice relationships and the big picture",
  },
  {
    id: "TH11",
    text: "When time is limited, which response is more typical?",
    leftLabel: "Prioritise using objective criteria",
    rightLabel: "Follow the direction that feels most promising",
  },
  {
    id: "TH12",
    text: "Which work environment tends to suit you better?",
    leftLabel: "Predictable, ordered and clearly defined",
    rightLabel: "Open, varied and creatively flexible",
  },
];

const categoryDescriptions = {
  Collaboration:
    "Contributing to shared outcomes and working constructively with different perspectives.",
  Adaptability:
    "Responding effectively to changing priorities, tools and working conditions.",
  Accountability:
    "Taking ownership, meeting commitments and communicating risks early.",
  Communication:
    "Sharing information clearly, listening carefully and handling disagreement respectfully.",
  "Problem Solving":
    "Analysing issues systematically, comparing options and preventing repeat problems.",
  "Emotional Intelligence":
    "Recognising emotions, regulating responses and responding thoughtfully to others.",
  "Leadership Potential":
    "Creating direction, supporting others and taking responsibility when guidance is needed.",
  Resilience:
    "Recovering after setbacks and maintaining effectiveness under pressure.",
  "Attention to Detail":
    "Working accurately, checking important outputs and following critical requirements.",
  Initiative:
    "Identifying opportunities and taking practical action without excessive prompting.",
};

const developmentTips = {
  Collaboration:
    "Invite a colleague into an upcoming task and agree on responsibilities, decisions and handover points.",
  Adaptability:
    "When a process changes, write down what remains stable, what must be learned and the first practical action.",
  Accountability:
    "Use a visible commitment list and raise risks before they affect the deadline.",
  Communication:
    "Practise summarising the other person's point before giving your own response.",
  "Problem Solving":
    "Use a problem statement, root-cause check and options comparison before selecting a solution.",
  "Emotional Intelligence":
    "Pause before responding in tense situations and identify the emotion, trigger and desired outcome.",
  "Leadership Potential":
    "Take responsibility for clarifying one team objective, owner and next step.",
  Resilience:
    "Create a short reset routine after setbacks: pause, assess what is controllable and select the next useful action.",
  "Attention to Detail":
    "Use a checklist for high-risk tasks and complete a final review before submission.",
  Initiative:
    "Choose one realistic improvement and take a small first step before seeking wider approval.",
};


function publicQuestion(question) {
  const { reverse, ...safeQuestion } = question;
  return safeQuestion;
}

function cleanText(value, maxLength = 120) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function validateEmployee(employee) {
  if (!employee || typeof employee !== "object") {
    return "Employee details are required.";
  }

  const name = cleanText(employee.name, 120);
  const email = cleanText(employee.email, 160);

  if (name.length < 2) {
    return "Employee name is required.";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "A valid email address is required.";
  }

  return null;
}

function validateAnswerSet(answers, questions, label) {
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return `${label} must contain ${questions.length} answers.`;
  }

  for (let index = 0; index < answers.length; index += 1) {
    const answer = answers[index];

    if (
      !answer ||
      answer.questionId !== questions[index].id ||
      !Number.isInteger(answer.value) ||
      answer.value < 1 ||
      answer.value > 5
    ) {
      return `${label} contains an invalid answer at question ${index + 1}.`;
    }
  }

  return null;
}

function scoreToPercent(average) {
  return Math.round(((average - 1) / 4) * 100);
}

function getBand(score) {
  if (score >= 80) return "Highly developed";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Balanced";
  if (score >= 35) return "Developing";
  return "Needs focused development";
}

function scoreWorkplace(answers) {
  const byCategory = {};

  workplaceQuestions.forEach((question, index) => {
    const rawValue = answers[index].value;
    const scoredValue = question.reverse ? 6 - rawValue : rawValue;

    if (!byCategory[question.category]) {
      byCategory[question.category] = [];
    }

    byCategory[question.category].push(scoredValue);
  });

  const categories = Object.entries(byCategory).map(([name, values]) => {
    const average =
      values.reduce((total, value) => total + value, 0) / values.length;
    const score = scoreToPercent(average);

    return {
      name,
      score,
      band: getBand(score),
      description: categoryDescriptions[name],
      developmentTip: developmentTips[name],
    };
  });

  const overall = Math.round(
    categories.reduce((total, category) => total + category.score, 0) /
      categories.length
  );

  const ranked = [...categories].sort((a, b) => b.score - a.score);

  return {
    overall,
    band: getBand(overall),
    categories,
    strongest: ranked[0],
    development: ranked[ranked.length - 1],
  };
}

function scoreThinking(answers) {
  const total = answers.reduce((sum, answer) => sum + answer.value, 0);
  const minimum = answers.length;
  const maximum = answers.length * 5;
  const right = Math.round(((total - minimum) / (maximum - minimum)) * 100);
  const left = 100 - right;
  const difference = Math.abs(left - right);

  let preference;

  if (difference <= 10) {
    preference = "Balanced thinking preference";
  } else if (left > right) {
    preference =
      difference >= 40
        ? "Strong analytical and structured preference"
        : "Moderate analytical and structured preference";
  } else {
    preference =
      difference >= 40
        ? "Strong creative and intuitive preference"
        : "Moderate creative and intuitive preference";
  }

  return {
    left,
    right,
    preference,
    explanation:
      left > right
        ? "You tend to favour structure, detail, logic and sequential processing, while still using intuitive or creative approaches when useful."
        : right > left
          ? "You tend to favour patterns, imagination, flexibility and intuitive processing, while still using structured analysis when useful."
          : "You show a relatively even preference for structured analysis and creative or intuitive processing.",
    disclaimer:
      "The popular left-brain/right-brain personality model is a simplified metaphor, not a neurological diagnosis. This result should be treated as a thinking-preference indicator only.",
  };
}

async function ensureResultsFile() {
  await fs.mkdir(path.dirname(RESULTS_FILE), { recursive: true });

  try {
    await fs.access(RESULTS_FILE);
  } catch {
    await fs.writeFile(RESULTS_FILE, "[]", "utf8");
  }
}

async function readResults() {
  await ensureResultsFile();

  try {
    const raw = await fs.readFile(RESULTS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let writeQueue = Promise.resolve();

function appendResult(result) {
  writeQueue = writeQueue.then(async () => {
    const results = await readResults();
    results.unshift(result);

    const temporaryFile = `${RESULTS_FILE}.tmp`;
    await fs.writeFile(
      temporaryFile,
      JSON.stringify(results, null, 2),
      "utf8"
    );
    await fs.rename(temporaryFile, RESULTS_FILE);
  });

  return writeQueue;
}

function assessmentConfig() {
  return {
    company: "Sponge Global",
    workplaceAssessment: {
      title: "Workplace Capability Assessment",
      scale: [
        { value: 1, label: "Strongly disagree" },
        { value: 2, label: "Disagree" },
        { value: 3, label: "Neither agree nor disagree" },
        { value: 4, label: "Agree" },
        { value: 5, label: "Strongly agree" },
      ],
      questions: workplaceQuestions.map(publicQuestion),
    },
    thinkingAssessment: {
      title: "Thinking Preference Assessment",
      scale: [
        { value: 1, label: "Strongly left preference" },
        { value: 2, label: "Mostly left preference" },
        { value: 3, label: "Balanced" },
        { value: 4, label: "Mostly right preference" },
        { value: 5, label: "Strongly right preference" },
      ],
      questions: thinkingQuestions,
    },
  };
}

function securityHeaders(contentType) {
  return {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; frame-ancestors 'self'",
    "Cache-Control": "no-store",
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(
    statusCode,
    securityHeaders("application/json; charset=utf-8")
  );
  response.end(JSON.stringify(payload));
}

function sendBuffer(response, statusCode, contentType, content, extraHeaders = {}) {
  response.writeHead(statusCode, {
    ...securityHeaders(contentType),
    ...extraHeaders,
  });
  response.end(content);
}

async function readJsonBody(request, maximumBytes = 250 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    request.on("data", (chunk) => {
      totalBytes += chunk.length;

      if (totalBytes > maximumBytes) {
        reject(new Error("Request body is too large."));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Request body must contain valid JSON."));
      }
    });

    request.on("error", reject);
  });
}

function hasValidAdminKey(request, adminKey) {
  return request.headers["x-admin-key"] === adminKey;
}

function escapeCsvCell(value) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function createCsv(results) {
  const headers = [
    "Assessment ID",
    "Completed At",
    "Employee Name",
    "Employee ID",
    "Department",
    "Role",
    "Email",
    "Overall Score",
    "Overall Band",
    "Left Preference",
    "Right Preference",
    "Thinking Preference",
  ];

  const rows = results.map((result) => [
    result.id,
    result.completedAt,
    result.employee.name,
    result.employee.employeeId,
    result.employee.department,
    result.employee.role,
    result.employee.email,
    result.workplaceResult.overall,
    result.workplaceResult.band,
    result.thinkingResult.left,
    result.thinkingResult.right,
    result.thinkingResult.preference,
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function serveStaticFile(response, pathname) {
  const routeMap = {
    "/": "index.html",
    "/admin": "admin.html",
  };

  const requestedFile = routeMap[pathname] || pathname.replace(/^\/+/, "");
  const normalisedPath = path.normalize(requestedFile);

  if (
    normalisedPath.startsWith("..") ||
    path.isAbsolute(normalisedPath) ||
    normalisedPath.includes(`..${path.sep}`)
  ) {
    sendJson(response, 400, { error: "Invalid path." });
    return;
  }

  const filePath = path.join(PUBLIC_DIRECTORY, normalisedPath);

  try {
    const content = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || "application/octet-stream";
    sendBuffer(response, 200, contentType, content, {
      "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=3600",
    });
  } catch {
    sendJson(response, 404, { error: "Not found." });
  }
}

async function handleAssessmentSubmission(request, response) {
  try {
    const body = await readJsonBody(request);
    const { employee, workplaceAnswers, thinkingAnswers } = body || {};

    const employeeError = validateEmployee(employee);
    if (employeeError) {
      sendJson(response, 400, { error: employeeError });
      return;
    }

    const workplaceError = validateAnswerSet(
      workplaceAnswers,
      workplaceQuestions,
      "Workplace answers"
    );
    if (workplaceError) {
      sendJson(response, 400, { error: workplaceError });
      return;
    }

    const thinkingError = validateAnswerSet(
      thinkingAnswers,
      thinkingQuestions,
      "Thinking-preference answers"
    );
    if (thinkingError) {
      sendJson(response, 400, { error: thinkingError });
      return;
    }

    const result = {
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
      employee: {
        name: cleanText(employee.name, 120),
        employeeId: cleanText(employee.employeeId, 80),
        department: cleanText(employee.department, 100),
        role: cleanText(employee.role, 100),
        email: cleanText(employee.email, 160),
      },
      workplaceResult: scoreWorkplace(workplaceAnswers),
      thinkingResult: scoreThinking(thinkingAnswers),
    };

    await appendResult(result);
    sendJson(response, 201, result);
  } catch (error) {
    console.error("Assessment submission failed:", error);
    sendJson(response, 400, {
      error: error.message || "The assessment could not be processed.",
    });
  }
}

async function startServer() {
  await loadEnvironmentFile();
  await ensureResultsFile();

  const port = Number(process.env.PORT || 3000);
  const adminKey = process.env.ADMIN_KEY || "change-this-admin-key";

  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(
      request.url,
      `http://${request.headers.host || "localhost"}`
    );
    const pathname = decodeURIComponent(requestUrl.pathname);

    try {
      if (request.method === "GET" && pathname === "/api/config") {
        sendJson(response, 200, assessmentConfig());
        return;
      }

      if (request.method === "POST" && pathname === "/api/assessments") {
        await handleAssessmentSubmission(request, response);
        return;
      }

      if (request.method === "GET" && pathname === "/api/results") {
        if (!hasValidAdminKey(request, adminKey)) {
          sendJson(response, 401, { error: "Invalid admin key." });
          return;
        }

        const results = await readResults();
        sendJson(response, 200, { count: results.length, results });
        return;
      }

      if (request.method === "GET" && pathname === "/api/results.csv") {
        if (!hasValidAdminKey(request, adminKey)) {
          sendJson(response, 401, { error: "Invalid admin key." });
          return;
        }

        const results = await readResults();
        const csv = createCsv(results);

        sendBuffer(
          response,
          200,
          "text/csv; charset=utf-8",
          Buffer.from(csv, "utf8"),
          {
            "Content-Disposition":
              'attachment; filename="sponge-global-assessment-results.csv"',
          }
        );
        return;
      }

      if (request.method === "GET") {
        await serveStaticFile(response, pathname);
        return;
      }

      sendJson(response, 405, { error: "Method not allowed." });
    } catch (error) {
      console.error("Request failed:", error);
      sendJson(response, 500, { error: "Internal server error." });
    }
  });

  server.listen(port, () => {
    console.log(`Sponge Global assessment running at http://localhost:${port}`);

    if (adminKey === "change-this-admin-key") {
      console.warn(
        "Warning: Set ADMIN_KEY in .env before using this application in production."
      );
    }
  });
}

startServer().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});
