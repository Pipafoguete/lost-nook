(() => {
  const canvas = document.querySelector("#hero-rain-scene");
  if (!canvas) return;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0, height = 0, frame = 0, rain = [], lamps = [];
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    width = rect.width; height = rect.height;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    rain = Array.from({ length: Math.max(55, Math.round(width / 8)) }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      length: 7 + Math.random() * 22, speed: .7 + Math.random() * 2,
      alpha: .08 + Math.random() * .22,
    }));
    lamps = Array.from({ length: 85 }, (_, i) => ({
      x: (i % 17) / 17, y: .24 + Math.floor(i / 17) * .14 + Math.random() * .035,
      size: 1 + Math.random() * 4, warm: Math.random() > .35,
    }));
    draw(0);
  };

  function draw(time) {
    context.clearRect(0, 0, width, height);
    const w = width, h = height;
    if (!w || !h) return;

    // A cidade distante e desfocada do lado de fora da janela.
    const night = context.createLinearGradient(0, 0, w * .6, h);
    night.addColorStop(0, "rgba(37,31,36,.25)");
    night.addColorStop(.48, "rgba(43,48,57,.67)");
    night.addColorStop(1, "rgba(16,20,27,.9)");
    context.fillStyle = night;
    context.fillRect(w * .24, h * .08, w * .76, h * .75);

    const moon = context.createRadialGradient(w * .73, h * .18, 2, w * .73, h * .18, w * .28);
    moon.addColorStop(0, "rgba(219,173,126,.2)"); moon.addColorStop(1, "rgba(219,173,126,0)");
    context.fillStyle = moon; context.fillRect(w * .42, 0, w * .58, h * .56);

    // Prédios baixos, luzes acesas e alguns pontos suaves de céu.
    const horizon = h * .69;
    for (let i = 0; i < 18; i++) {
      const bx = w * (.26 + i * .045);
      const bh = h * (.1 + ((i * 37) % 13) / 100);
      context.fillStyle = i % 3 === 0 ? "rgba(27,30,35,.78)" : "rgba(22,25,31,.8)";
      context.fillRect(bx, horizon - bh, w * .05, bh + h * .12);
      for (let row = 0; row < 4; row++) for (let col = 0; col < 2; col++) {
        if ((i * 3 + row + col) % 4 === 0) continue;
        context.fillStyle = (i + row + col) % 3 === 0 ? "rgba(225,170,112,.32)" : "rgba(165,184,192,.2)";
        context.fillRect(bx + w * (.012 + col * .019), horizon - bh + h * (.025 + row * .027), 2, 3);
      }
    }
    const glow = context.createRadialGradient(w * .68, horizon, 0, w * .68, horizon, w * .35);
    glow.addColorStop(0, "rgba(184,112,72,.2)"); glow.addColorStop(1, "rgba(184,112,72,0)");
    context.fillStyle = glow; context.fillRect(w * .3, h * .3, w * .7, h * .5);

    context.save();
    context.beginPath(); context.rect(w * .25, h * .08, w * .74, h * .75); context.clip();
    for (const drop of rain) {
      context.strokeStyle = `rgba(205,215,220,${drop.alpha})`;
      context.lineWidth = .8; context.beginPath();
      context.moveTo(drop.x, drop.y); context.lineTo(drop.x - 2, drop.y + drop.length); context.stroke();
      if (!reducedMotion) { drop.y += drop.speed; drop.x -= .12; }
      if (drop.y > h * .84) { drop.y = h * .08 - drop.length; drop.x = Math.random() * w; }
    }
    context.restore();

    // Caixilho antigo com reflexo âmbar, como uma janela de café na madrugada.
    const frameX = w * .27, frameY = h * .08, frameW = w * .72, frameH = h * .76;
    context.strokeStyle = "rgba(189,139,97,.24)"; context.lineWidth = Math.max(2, w * .003);
    context.strokeRect(frameX, frameY, frameW, frameH);
    context.strokeStyle = "rgba(224,174,126,.19)"; context.lineWidth = Math.max(4, w * .008);
    context.beginPath(); context.moveTo(frameX + frameW * .52, frameY); context.lineTo(frameX + frameW * .52, frameY + frameH); context.stroke();
    context.beginPath(); context.moveTo(frameX, frameY + frameH * .53); context.lineTo(frameX + frameW, frameY + frameH * .53); context.stroke();
    context.fillStyle = "rgba(43,30,25,.9)"; context.fillRect(frameX - w * .018, frameY + frameH, frameW + w * .036, h * .035);
    context.fillStyle = "rgba(155,98,63,.23)"; context.fillRect(frameX - w * .018, frameY + frameH, frameW + w * .036, h * .008);

    // Plantinha em vaso de terracota, com folhas e nervuras delicadas.
    const sillY = frameY + frameH + h * .035;
    const plantX = w * .85, potWidth = w * .052, potTop = sillY - h * .025, potHeight = h * .07;
    const pot = context.createLinearGradient(plantX - potWidth / 2, 0, plantX + potWidth / 2, 0);
    pot.addColorStop(0, "rgba(91,60,45,.92)"); pot.addColorStop(.48, "rgba(139,91,62,.96)"); pot.addColorStop(1, "rgba(82,53,41,.94)");
    context.fillStyle = pot;
    context.beginPath(); context.roundRect(plantX - potWidth / 2, potTop, potWidth, potHeight, [3, 3, 8, 8]); context.fill();
    context.fillStyle = "rgba(35,27,22,.88)";
    context.beginPath(); context.ellipse(plantX, potTop + 2, potWidth * .48, Math.max(2, h * .006), 0, 0, Math.PI * 2); context.fill();
    context.strokeStyle = "rgba(220,168,124,.28)"; context.lineWidth = Math.max(1, w * .0012);
    context.beginPath(); context.moveTo(plantX - potWidth * .38, potTop + potHeight * .72); context.lineTo(plantX + potWidth * .38, potTop + potHeight * .72); context.stroke();

    const leafSpecs = [
      [-.058, -.115, .027], [-.043, -.175, .024], [-.019, -.13, .026],
      [.012, -.205, .027], [.036, -.15, .03], [.06, -.105, .026], [.006, -.255, .022],
    ];
    const plantBaseY = potTop + 3;
    context.lineCap = "round";
    context.strokeStyle = "rgba(91,126,91,.82)"; context.lineWidth = Math.max(1.2, w * .0018);
    for (const [dx, dy] of leafSpecs) {
      const tipX = plantX + w * dx, tipY = plantBaseY + h * dy;
      context.beginPath(); context.moveTo(plantX, plantBaseY);
      context.quadraticCurveTo(plantX + w * dx * .45, plantBaseY + h * dy * .52, tipX, tipY); context.stroke();
    }
    leafSpecs.forEach(([dx, dy, leafWidth], index) => {
      const baseX = plantX + w * dx * .42, baseY = plantBaseY + h * dy * .48;
      const tipX = plantX + w * dx, tipY = plantBaseY + h * dy;
      const vx = tipX - baseX, vy = tipY - baseY, length = Math.hypot(vx, vy) || 1;
      const nx = -vy / length * w * leafWidth * .5, ny = vx / length * w * leafWidth * .5;
      const midX = (baseX + tipX) / 2, midY = (baseY + tipY) / 2;
      context.fillStyle = ["rgba(97,132,95,.9)", "rgba(118,145,99,.86)", "rgba(77,116,83,.9)"][index % 3];
      context.beginPath(); context.moveTo(baseX, baseY);
      context.quadraticCurveTo(midX + nx, midY + ny, tipX, tipY);
      context.quadraticCurveTo(midX - nx, midY - ny, baseX, baseY); context.fill();
      context.strokeStyle = "rgba(202,192,139,.38)"; context.lineWidth = Math.max(.7, w * .0008);
      context.beginPath(); context.moveTo(baseX, baseY); context.lineTo(tipX, tipY); context.stroke();
    });

    // Xícara quente com três fios de vapor que ondulam e sobem devagar.
    const cupX = w * .74, cupY = sillY - h * .006;
    context.fillStyle = "rgba(202,164,127,.74)";
    context.beginPath(); context.roundRect(cupX, cupY, w * .045, h * .045, 4); context.fill();
    context.strokeStyle = "rgba(202,164,127,.65)"; context.lineWidth = 2;
    context.beginPath(); context.arc(cupX + w * .05, cupY + h * .02, h * .014, -1.3, 1.3); context.stroke();
    context.fillStyle = "rgba(40,28,23,.9)"; context.fillRect(cupX + 2, cupY + 2, w * .04, h * .008);
    const steamTime = time * .001;
    const steamHeight = Math.max(20, h * .085);
    for (let i = 0; i < 3; i++) {
      const phase = steamTime * 1.15 + i * 2.05;
      const sway = Math.sin(phase) * Math.max(3, w * .004);
      context.globalAlpha = .28 + (Math.sin(phase * .7) + 1) * .12;
      context.strokeStyle = i === 1 ? "rgba(242,218,190,.66)" : "rgba(228,184,141,.52)";
      context.lineWidth = Math.max(1, w * .0015); context.lineCap = "round";
      context.beginPath();
      context.moveTo(cupX + w * (.014 + i * .013), cupY - h * .008);
      context.bezierCurveTo(cupX + w * (.004 + i * .012) + sway, cupY - steamHeight * .34, cupX + w * (.032 + i * .01) - sway, cupY - steamHeight * .62, cupX + w * (.018 + i * .012) + sway * .35, cupY - steamHeight);
      context.stroke();
    }
    context.globalAlpha = 1;
    // Reflexo quente no interior da sala.
    const lamp = context.createRadialGradient(w * .92, h * .8, 1, w * .92, h * .8, w * .2);
    lamp.addColorStop(0, "rgba(193,128,77,.18)"); lamp.addColorStop(1, "rgba(193,128,77,0)");
    context.fillStyle = lamp; context.fillRect(w * .65, h * .55, w * .35, h * .45);
    // Mantém o vapor vivo mesmo com movimento reduzido; a chuva continua parada nesse modo.
    frame = requestAnimationFrame(draw);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  if (document.fonts?.ready) document.fonts.ready.then(resize);
})();
