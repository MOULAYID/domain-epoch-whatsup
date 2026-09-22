import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const [template, page, leads, manifest] = await Promise.all([
  fs.readFile(path.join(root, "worker/index.template.js"), "utf8"),
  fs.readFile(path.join(root, "src/index.html"), "utf8"),
  fs.readFile(path.join(root, "data/leads.json"), "utf8"),
  fs.readFile(path.join(root, ".openai/hosting.json"), "utf8"),
]);
JSON.parse(leads); JSON.parse(manifest);
const worker = template
  .replace("__PAGE_JSON__", JSON.stringify(page))
  .replace("__LEADS_JSON__", leads.trim());
const dist = path.join(root, "dist");
await fs.rm(dist, {recursive:true,force:true});
await fs.mkdir(path.join(dist, "server"), {recursive:true});
await fs.mkdir(path.join(dist, ".openai", "drizzle"), {recursive:true});
await fs.writeFile(path.join(dist, "server/index.js"), worker);
await fs.writeFile(path.join(dist, ".openai/hosting.json"), manifest);
await fs.cp(path.join(root, "drizzle"), path.join(dist, ".openai/drizzle"), {recursive:true});
console.log("Built database-backed Worker");
