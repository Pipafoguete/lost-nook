 (async() => {
  const starter=[
    {name:"GitHub",url:"https://github.com",description:"Código e projetos em andamento.",category:"Desenvolvimento"},
    {name:"Blender",url:"https://www.blender.org",description:"Criação 3D, animação e arte.",category:"Ferramentas"},
    {name:"Roblox",url:"https://www.roblox.com",description:"Experiências e mundos interativos.",category:"Jogos"},
    {name:"Minecraft",url:"https://www.minecraft.net",description:"Construções e aventuras em blocos.",category:"Jogos"},
    {name:"Discord",url:"https://discord.com",description:"Comunidades e conversas.",category:"Comunidade"},
    {name:"YouTube",url:"https://youtube.com",description:"Vídeos, referências e descobertas.",category:"Vídeo"},
    {name:"Instagram",url:"https://instagram.com",description:"Pequenos registros pelo caminho.",category:"Redes sociais"},
    {name:"Pinterest",url:"https://pinterest.com",description:"Referências para ideias futuras.",category:"Inspiração"},
    {name:"Spotify",url:"https://spotify.com",description:"Trilhas para trabalhar de madrugada.",category:"Áudio"},
    {name:"itch.io",url:"https://itch.io",description:"Jogos independentes e experimentos.",category:"Jogos"},
    {name:"MDN",url:"https://developer.mozilla.org",description:"Documentação para desenvolvimento web.",category:"Aprendizado"},
    {name:"Are.na",url:"https://www.are.na",description:"Coleções, referências e conexões.",category:"Inspiração"}
  ];
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safeHref=value=>{try{const url=new URL(value);return ["http:","https:"].includes(url.protocol)?url.href:"#social";}catch{return "#social";}};
  let links=starter;try{let response=await fetch("/api/site-data",{cache:"no-store"});if(!response.ok)response=await fetch("public-data.json",{cache:"no-store"});if(response.ok){const data=await response.json();if(Array.isArray(data.socials))links=data.socials;}}catch{try{const stored=JSON.parse(localStorage.getItem("lostnook-socials")||"null");if(Array.isArray(stored))links=stored;}catch{}}
  links=links.filter(l=>l.isPublic!==false);
  const grid=document.querySelector("#social-grid"),filters=document.querySelector("#social-filters"),search=document.querySelector("#social-search"),empty=document.querySelector("#social-empty");
  if(!grid)return;
  const cats=["Tudo",...new Set(links.map(x=>x.category).filter(Boolean))];let selected="Tudo";
  filters.innerHTML=cats.map(c=>`<button type="button" class="social-filter ${c==="Tudo"?"active":""}" data-category="${esc(c)}">${esc(c)}</button>`).join("");
  function render(){const term=search.value.trim().toLocaleLowerCase("pt-BR");const matches=links.filter(l=>(selected==="Tudo"||l.category===selected)&&`${l.name} ${l.description} ${l.category}`.toLocaleLowerCase("pt-BR").includes(term));grid.innerHTML=matches.map((l,i)=>`<a class="social-card directory-card" href="${esc(safeHref(l.url))}" target="_blank" rel="noopener noreferrer"><span class="social-card-number">${String(i+1).padStart(2,"0")}</span><div class="social-card-content"><span class="social-card-label">${esc(l.category||"OUTROS")}</span><h3>${esc(l.name)}</h3><p>${esc(l.description||"Um canto para explorar.")}</p></div><span class="social-arrow">↗</span><span class="directory-open">ABRIR CANTO</span></a>`).join("");empty.hidden=matches.length>0;}
  filters.addEventListener("click",e=>{const button=e.target.closest("[data-category]");if(!button)return;selected=button.dataset.category;filters.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===button));render();});search.addEventListener("input",render);render();
})();
