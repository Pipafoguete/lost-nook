(() => {
  const root = document.querySelector("#project-page-content");
  const slug = (() => {
    try { return decodeURIComponent(location.pathname.replace(/\/+$/, "").split("/").pop() || "").toLowerCase(); }
    catch { return ""; }
  })();
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const imageUrl = value => {
    try { const url = new URL(value, location.origin); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; }
    catch { return ""; }
  };

  const showError = () => {
    document.title = "Projeto não encontrado — Lost Nook";
    root.innerHTML = `<section class="project-error"><p class="project-meta">UM CANTO AINDA ESCONDIDO</p><h1>Esse projeto não apareceu por aqui.</h1><p>Talvez ele esteja privado ou o endereço tenha mudado.</p><a href="/#projetos">← VOLTAR AO UNIVERSO</a></section>`;
  };

  fetch("/api/site-data", { cache: "no-store" })
    .then(response => { if (!response.ok) throw new Error("Falha ao carregar catálogo."); return response.json(); })
    .then(({ projects = [] }) => {
      const project = projects.find(item => String(item.slug || item.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slug);
      if (!project) { showError(); return; }

      const name = escapeHTML(project.name || "Projeto");
      const description = escapeHTML(project.longDescription || project.description || "Este cantinho ainda está começando a ganhar forma.");
      const cover = imageUrl(project.coverImage);
      const gallery = (Array.isArray(project.gallery) ? project.gallery : []).map(imageUrl).filter(Boolean).slice(0, 30);
      const title = `${project.name || "Projeto"} — Lost Nook`;
      document.title = title;
      document.querySelector('meta[name="description"]').content = String(project.tagline || project.description || "Um projeto do universo Lost Nook.").slice(0, 250);
      const coverMarkup = cover ? `<img class="project-cover" src="${escapeHTML(cover)}" alt="${name}" fetchpriority="high">` : `<span class="cover-placeholder">${name}</span>`;
      root.innerHTML = `<article class="project-detail"><header><div class="project-meta"><span>${escapeHTML(project.category || "Projeto pessoal")}</span>${project.status ? `<span>${escapeHTML(project.status)}</span>` : ""}</div><h1 class="project-title">${name}</h1>${project.tagline ? `<p class="project-tagline">${escapeHTML(project.tagline)}</p>` : ""}</header><div class="project-cover-wrap">${coverMarkup}</div><div class="project-body"><div class="project-description">${description}</div><aside class="project-aside"><small>NO UNIVERSO LOST NOOK</small><strong>${name}</strong><small style="margin-top:18px">CATEGORIA</small><strong>${escapeHTML(project.category || "Projeto pessoal")}</strong>${project.status ? `<small style="margin-top:18px">MOMENTO ATUAL</small><strong>${escapeHTML(project.status)}</strong>` : ""}</aside></div>${gallery.length ? `<section class="project-gallery"><h2>Pequenos registros pelo caminho</h2><div class="project-gallery-grid">${gallery.map((src, i) => `<figure><img src="${escapeHTML(src)}" alt="${name} — imagem ${i + 1}" loading="lazy"></figure>`).join("")}</div></section>` : ""}</article>`;
    })
    .catch(error => { console.error("Lost Nook: não foi possível abrir o projeto.", error); showError(); });
})();
