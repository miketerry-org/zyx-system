const fs = require("fs");
const path = require("path");

const FILTER_FILE = path.join(process.cwd(), ".filter");
let filterPatterns = [];
let watching = false;

// Parse the filter lines into match functions
function parseFilters(lines) {
  return lines.map(line => {
    if (line.startsWith("*") && line.endsWith("*")) {
      const match = line.slice(1, -1).toLowerCase();
      return arg =>
        typeof arg === "string" && arg.toLowerCase().includes(match);
    } else if (line.startsWith("*")) {
      const match = line.slice(1).toLowerCase();
      return arg =>
        typeof arg === "string" && arg.toLowerCase().endsWith(match);
    } else if (line.endsWith("*")) {
      const match = line.slice(0, -1).toLowerCase();
      return arg =>
        typeof arg === "string" && arg.toLowerCase().startsWith(match);
    } else {
      const match = line.toLowerCase();
      return arg => typeof arg === "string" && arg.toLowerCase() === match;
    }
  });
}

// Load the filter file into memory
function loadFilterFile() {
  try {
    if (!fs.existsSync(FILTER_FILE)) {
      // File doesn't exist — skip filtering
      filterPatterns = []; // Clear any previous filters
      return false;
    }

    const data = fs.readFileSync(FILTER_FILE, "utf-8");
    const lines = data
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    filterPatterns = parseFilters(lines);

    return true;
  } catch {
    return false;
  }
}

// Try loading filters
const loaded = loadFilterFile();

// If successfully loaded, set up watcher
if (loaded) {
  try {
    fs.watch(FILTER_FILE, eventType => {
      if (eventType === "change") {
        loadFilterFile();
      }
    });
    watching = true;
  } catch {
    watching = false;
  }
}

// Console methods to override
const methodsToOverride = ["log", "info", "warn", "debug", "error", "trace"];
const originalConsole = {};

for (const method of methodsToOverride) {
  originalConsole[method] = console[method];

  console[method] = function (firstArg, ...restArgs) {
    if (
      typeof firstArg === "string" &&
      filterPatterns.some(fn => fn(firstArg))
    ) {
      return;
    }

    originalConsole[method](firstArg, ...restArgs);
  };
}
