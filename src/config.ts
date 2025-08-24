import fs from "fs"; // File system module for reading config files
import path from "path"; // Path utilities
import { pathToFileURL } from "url"; // Convert file paths to URLs for dynamic import
import { PdfConfig } from "."; // Import PDF configuration interface

/**
 * Load PDF configuration from `pdf-markup.config.js` or `.json`.
 *
 * Supports:
 * - JSON files (synchronously read and parse)
 * - JS modules (import dynamically and use `default` export if available)
 *
 * @returns Promise resolving to PdfConfig object
 */
export async function loadConfig(): Promise<PdfConfig> {
  // Possible config file paths
  const configPaths = [
    path.join(process.cwd(), "pdf-markup.config.js"), // JS module
    path.join(process.cwd(), "pdf-markup.config.json"), // JSON file
  ];

  // Try to find a valid config file
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      if (configPath.endsWith(".json")) {
        // Load JSON config
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
      } else {
        // Load JS module dynamically
        const mod = await import(pathToFileURL(configPath).href);
        return mod.default || mod; // Support both default and named exports
      }
    }
  }

  // If no config file is found, return empty object
  return {};
}
