import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
if (path.dirname(output) !== root || path.basename(output) !== "dist") throw new Error("Destino de build inválido.");
const data = JSON.parse(await readFile(path.join(root, "public-data.json"), "utf8"));
const projects = Array.isArray(data.projects) ? data.projects : [];
const socials = Array.isArray(data.socials) ? data.socials : [];
const publicData = { projects, socials };
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of ["style.css", "social.css", "ambient.js", "social.js", "script.js"]) {
  await cp(path.join(root, file), path.join(output, file));
}
await cp(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });
await writeFile(path.join(output, "public-data.json"), `${JSON.stringify(publicData, null, 2)}\n`);

let home = await readFile(path.join(root, "index.html"), "utf8");
home = home.replace(/\s*<a href="central\.html" class="nav-central">[\s\S]*?<\/a>/, "");
home = home.replace(/\s*<a href="central\.html">CENTRAL PRIVADA ↗<\/a>/, "");
await writeFile(path.join(output, "index.html"), home);

const slugify = value => String(value || "projeto").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "projeto";
const usedSlugs = new Set();
let projectTemplate = await readFile(path.join(root, "project.html"), "utf8");
let projectScript = await readFile(path.join(root, "project-page.js"), "utf8");
projectTemplate = projectTemplate
  .replaceAll('href="/assets/', 'href="../../assets/')
  .replaceAll('href="/style.css', 'href="../../style.css')
  .replaceAll('href="/project-page.css', 'href="../../project-page.css')
  .replaceAll('href="/"', 'href="../../index.html"')
  .replaceAll('href="/#projetos"', 'href="../../index.html#projetos"')
  .replaceAll('src="/project-page.js', 'src="../../project-page.js');
projectScript = projectScript
  .replace('fetch("/api/site-data", { cache: "no-store" })', 'fetch("../../public-data.json", { cache: "no-store" })')
  .replace('href="/#projetos"', 'href="../../index.html#projetos"');
await cp(path.join(root, "project-page.css"), path.join(output, "project-page.css"));
await writeFile(path.join(output, "project-page.js"), projectScript);

for (const project of projects) {
  if (!project || typeof project !== "object" || project.isPublic === false) continue;
  const base = slugify(project.slug || project.name);
  let slug = base;
  let suffix = 2;
  while (usedSlugs.has(slug)) slug = `${base}-${suffix++}`;
  usedSlugs.add(slug);
  const directory = path.join(output, "projetos", slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), projectTemplate);
}

console.log(`GitHub Pages pronto em dist/ (${usedSlugs.size} páginas de projeto públicas).`);
