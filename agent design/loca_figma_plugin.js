// ──────────────────────────────────────────────────
// LOCA Mobile UI — Figma Plugin Script
// 실행 방법: Figma 메뉴 → Plugins → Development →
//            Open Console → 아래 코드 전체 붙여넣기 → Enter
// ──────────────────────────────────────────────────

(async () => {
  // ── 1. 대상 페이지 선택 (현재 페이지에 생성) ──
  const page = figma.currentPage;

  // ── 2. 디자인 토큰 ──
  const B = {
    // Brand Black
    r: 0.039,
    g: 0.039,
    b: 0.039,
    a: 1,
  };
  const W = { r: 0.98, g: 0.98, b: 0.98, a: 1 }; // Brand White
  const GRAY1 = { r: 0.957, g: 0.957, b: 0.957, a: 1 }; // #F4F4F4
  const GRAY2 = { r: 0.91, g: 0.91, b: 0.91, a: 1 }; // #E8E8E8
  const GRAY3 = { r: 0.467, g: 0.467, b: 0.467, a: 1 }; // #777
  const TRANSPARENT = { r: 0, g: 0, b: 0, a: 0 };

  const FRAME_W = 390;
  const FRAME_H = 844;
  const GAP = 80;

  // ── 헬퍼: 폰트 로드 ──
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "ExtraBold" });

  // ── 헬퍼 함수들 ──
  function makeFrame(name, x, y, w = FRAME_W, h = FRAME_H) {
    const f = figma.createFrame();
    f.name = name;
    f.resize(w, h);
    f.x = x;
    f.y = y;
    f.fills = [{ type: "SOLID", color: W }];
    f.cornerRadius = 0;
    f.clipsContent = true;
    page.appendChild(f);
    return f;
  }

  function rect(parent, x, y, w, h, color, radius = 0, name = "rect") {
    const r = figma.createRectangle();
    r.name = name;
    r.resize(w, h);
    r.x = x;
    r.y = y;
    r.fills = [{ type: "SOLID", color }];
    r.cornerRadius = radius;
    parent.appendChild(r);
    return r;
  }

  function txt(
    parent,
    content,
    x,
    y,
    size,
    color,
    weight = "Bold",
    width = null,
    align = "LEFT",
  ) {
    const t = figma.createText();
    t.fontName = { family: "Inter", style: weight };
    t.characters = content;
    t.fontSize = size;
    t.fills = [{ type: "SOLID", color }];
    t.x = x;
    t.y = y;
    if (width) {
      t.textAutoResize = "HEIGHT";
      t.resize(width, 40);
    }
    t.textAlignHorizontal = align;
    parent.appendChild(t);
    return t;
  }

  function chip(parent, label, x, y, active = false) {
    const g = figma.createFrame();
    g.name = `Chip: ${label}`;
    g.layoutMode = "HORIZONTAL";
    g.primaryAxisAlignItems = "CENTER";
    g.counterAxisAlignItems = "CENTER";
    g.paddingLeft = 14;
    g.paddingRight = 14;
    g.paddingTop = 7;
    g.paddingBottom = 7;
    g.cornerRadius = 999;
    g.strokeWeight = 1.5;
    g.strokes = [{ type: "SOLID", color: active ? B : GRAY2 }];
    g.fills = [{ type: "SOLID", color: active ? B : W }];
    g.x = x;
    g.y = y;
    const t = figma.createText();
    t.fontName = { family: "Inter", style: "Bold" };
    t.characters = label;
    t.fontSize = 13;
    t.fills = [{ type: "SOLID", color: active ? W : GRAY3 }];
    g.appendChild(t);
    parent.appendChild(g);
    g.primaryAxisSizingMode = "AUTO";
    g.counterAxisSizingMode = "AUTO";
    return g;
  }

  function divider(parent, y, color = GRAY2) {
    return rect(parent, 0, y, FRAME_W, 1, color, 0, "Divider");
  }

  function bottomNav(parent) {
    const nav = figma.createFrame();
    nav.name = "Bottom Nav";
    nav.resize(FRAME_W, 80);
    nav.x = 0;
    nav.y = FRAME_H - 80;
    nav.fills = [
      {
        type: "SOLID",
        color: W,
        opacity: 0.92,
      },
    ];
    nav.strokes = [{ type: "SOLID", color: GRAY2 }];
    nav.strokeWeight = 1;
    nav.strokeAlign = "INSIDE";
    parent.appendChild(nav);

    const items = [
      { label: "홈", active: false },
      { label: "탐색", active: false },
      { label: "지도", active: false },
      { label: "For You", active: false },
      { label: "마이", active: false },
    ];
    const itemW = FRAME_W / items.length;
    items.forEach((item, i) => {
      const dot = rect(
        nav,
        itemW * i + itemW / 2 - 3,
        12,
        6,
        6,
        item.active ? B : GRAY2,
        3,
        "dot",
      );
      txt(
        nav,
        item.label,
        itemW * i + 2,
        30,
        10,
        item.active ? B : GRAY3,
        "Bold",
        itemW - 4,
        "CENTER",
      );
    });
    return nav;
  }

  // ════════════════════════════════════════════════
  // SCREEN 1: LOGIN
  // ════════════════════════════════════════════════
  const loginFrame = makeFrame("🔑 Login", 0, 0);

  // Black hero (top 55%)
  rect(loginFrame, 0, 0, FRAME_W, 460, B, 0, "Hero BG");

  // Decorative circle
  const deco = figma.createEllipse();
  deco.resize(200, 200);
  deco.x = FRAME_W - 80;
  deco.y = -60;
  deco.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 0.04 } }];
  loginFrame.appendChild(deco);

  // Logo area
  const logoBox = rect(
    loginFrame,
    28,
    60,
    32,
    32,
    { r: 1, g: 1, b: 1, a: 0.12 },
    9,
    "Logo Box",
  );
  txt(loginFrame, "📍", 32, 62, 18, W, "Regular");
  txt(loginFrame, "LOCA", 68, 64, 18, W, "ExtraBold");

  // Headline
  const headline = figma.createText();
  headline.fontName = { family: "Inter", style: "ExtraBold" };
  headline.characters = "당신의 장소를\n발견하고\n기록하는\n새로운 방법";
  headline.fontSize = 34;
  headline.fills = [{ type: "SOLID", color: W }];
  headline.lineHeight = { unit: "PERCENT", value: 120 };
  headline.x = 28;
  headline.y = 130;
  headline.textAutoResize = "HEIGHT";
  headline.resize(320, 200);
  loginFrame.appendChild(headline);

  txt(
    loginFrame,
    "PUBLIC PLACE · PRIVATE PLACE",
    28,
    340,
    11,
    { r: 1, g: 1, b: 1, a: 0.45 },
    "Bold",
  );

  // White form area
  rect(loginFrame, 0, 456, FRAME_W, FRAME_H - 456, W, 0, "Form BG");

  txt(loginFrame, "다시 만나 반가워요 👋", 28, 480, 22, B, "ExtraBold");
  txt(
    loginFrame,
    "LOCA 계정으로 로그인하고 기록을 이어가세요.",
    28,
    510,
    13,
    GRAY3,
    "Medium",
    334,
  );

  // Email field
  rect(loginFrame, 28, 556, FRAME_W - 56, 52, W, 12, "Email Field");
  const emailField = figma.createRectangle();
  emailField.resize(FRAME_W - 56, 52);
  emailField.x = 28;
  emailField.y = 556;
  emailField.fills = [{ type: "SOLID", color: W }];
  emailField.cornerRadius = 12;
  emailField.strokeWeight = 1.5;
  emailField.strokes = [{ type: "SOLID", color: GRAY2 }];
  loginFrame.appendChild(emailField);
  txt(loginFrame, "이메일", 28, 538, 12, B, "Bold");
  txt(
    loginFrame,
    "loca@example.com",
    44,
    572,
    14,
    { r: 0.65, g: 0.65, b: 0.65, a: 1 },
    "Medium",
  );

  // Password field
  const pwField = figma.createRectangle();
  pwField.resize(FRAME_W - 56, 52);
  pwField.x = 28;
  pwField.y = 640;
  pwField.fills = [{ type: "SOLID", color: W }];
  pwField.cornerRadius = 12;
  pwField.strokeWeight = 1.5;
  pwField.strokes = [{ type: "SOLID", color: GRAY2 }];
  loginFrame.appendChild(pwField);
  txt(loginFrame, "비밀번호", 28, 622, 12, B, "Bold");
  txt(
    loginFrame,
    "••••••••",
    44,
    657,
    14,
    { r: 0.65, g: 0.65, b: 0.65, a: 1 },
    "Medium",
  );

  // CTA Button
  rect(loginFrame, 28, 712, FRAME_W - 56, 52, B, 12, "CTA Button");
  txt(loginFrame, "로그인", 28, 728, 15, W, "Bold", FRAME_W - 56, "CENTER");

  // Social
  const socialBtn = figma.createRectangle();
  socialBtn.resize(FRAME_W - 56, 52);
  socialBtn.x = 28;
  socialBtn.y = 776;
  socialBtn.fills = [{ type: "SOLID", color: GRAY1 }];
  socialBtn.cornerRadius = 12;
  socialBtn.strokeWeight = 1.5;
  socialBtn.strokes = [{ type: "SOLID", color: GRAY2 }];
  loginFrame.appendChild(socialBtn);
  txt(
    loginFrame,
    "카카오로 계속하기",
    28,
    792,
    14,
    B,
    "Bold",
    FRAME_W - 56,
    "CENTER",
  );

  // ════════════════════════════════════════════════
  // SCREEN 2: ONBOARDING (Step 1)
  // ════════════════════════════════════════════════
  const onbFrame = makeFrame("✨ Onboarding", FRAME_W + GAP, 0);

  // Progress bar
  [0, 1, 2].forEach((i) => {
    rect(
      onbFrame,
      28 + i * 116,
      60,
      105,
      3,
      i === 0 ? B : GRAY2,
      2,
      `Progress ${i + 1}`,
    );
  });

  txt(onbFrame, "🌟", 28, 100, 36, B, "Regular");

  const onbTitle = figma.createText();
  onbTitle.fontName = { family: "Inter", style: "ExtraBold" };
  onbTitle.characters = "취향에 맞는 장소를\n발견해 보세요";
  onbTitle.fontSize = 28;
  onbTitle.fills = [{ type: "SOLID", color: B }];
  onbTitle.lineHeight = { unit: "PERCENT", value: 125 };
  onbTitle.x = 28;
  onbTitle.y = 158;
  onbTitle.textAutoResize = "HEIGHT";
  onbTitle.resize(334, 120);
  onbFrame.appendChild(onbTitle);

  const onbBody = figma.createText();
  onbBody.fontName = { family: "Inter", style: "Medium" };
  onbBody.characters =
    "LOCA는 카페, 맛집, 산책 코스처럼 다양한 장소를 당신의 취향과 기록 흐름에 맞춰 보여줍니다.";
  onbBody.fontSize = 14;
  onbBody.fills = [{ type: "SOLID", color: GRAY3 }];
  onbBody.lineHeight = { unit: "PERCENT", value: 165 };
  onbBody.x = 28;
  onbBody.y = 258;
  onbBody.textAutoResize = "HEIGHT";
  onbBody.resize(334, 100);
  onbFrame.appendChild(onbBody);

  // Visual card area
  const visualCard = figma.createFrame();
  visualCard.name = "Visual Card";
  visualCard.resize(334, 260);
  visualCard.x = 28;
  visualCard.y = 380;
  visualCard.fills = [{ type: "SOLID", color: GRAY1 }];
  visualCard.cornerRadius = 20;
  visualCard.clipsContent = true;
  onbFrame.appendChild(visualCard);

  // Mini place cards in visual
  const miniCards = [
    "☕ 성수 카페",
    "🌿 망원 공원",
    "🎭 홍대 갤러리",
    "🍜 연남 맛집",
  ];
  miniCards.forEach((label, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mc = figma.createFrame();
    mc.resize(148, 80);
    mc.x = 14 + col * 158;
    mc.y = 14 + row * 90;
    mc.fills = [{ type: "SOLID", color: i === 0 ? B : W }];
    mc.cornerRadius = 12;
    mc.strokeWeight = 1.5;
    mc.strokes = [{ type: "SOLID", color: i === 0 ? B : GRAY2 }];
    const t = figma.createText();
    t.fontName = { family: "Inter", style: "Bold" };
    t.characters = label;
    t.fontSize = 13;
    t.fills = [{ type: "SOLID", color: i === 0 ? W : B }];
    t.x = 12;
    t.y = 28;
    mc.appendChild(t);
    visualCard.appendChild(mc);
  });

  // Next button
  rect(onbFrame, 28, 680, FRAME_W - 56, 52, B, 12, "Next Button");
  txt(onbFrame, "다음", 28, 696, 15, W, "Bold", FRAME_W - 56, "CENTER");

  // Skip link
  txt(onbFrame, "건너뛰기", 0, 748, 14, GRAY3, "Bold", FRAME_W, "CENTER");

  // ════════════════════════════════════════════════
  // SCREEN 3: HOME
  // ════════════════════════════════════════════════
  const homeFrame = makeFrame("🏠 Home", (FRAME_W + GAP) * 2, 0);

  // Top bar
  const logoArea = figma.createFrame();
  logoArea.name = "Top Bar";
  logoArea.resize(FRAME_W, 60);
  logoArea.x = 0;
  logoArea.y = 0;
  logoArea.fills = [{ type: "SOLID", color: W }];
  homeFrame.appendChild(logoArea);

  const pinBox = rect(logoArea, 20, 16, 28, 28, B, 8, "Pin Box");
  txt(logoArea, "📍", 22, 16, 16, W, "Regular");
  txt(logoArea, "LOCA", 54, 19, 17, B, "ExtraBold");

  // Bell icon
  const bell = figma.createEllipse();
  bell.resize(36, 36);
  bell.x = FRAME_W - 64;
  bell.y = 12;
  bell.fills = [{ type: "SOLID", color: GRAY1 }];
  bell.strokes = [{ type: "SOLID", color: GRAY2 }];
  bell.strokeWeight = 1.5;
  logoArea.appendChild(bell);
  txt(logoArea, "🔔", FRAME_W - 62, 14, 14, B, "Regular");

  // Avatar
  const avatar = figma.createEllipse();
  avatar.resize(36, 36);
  avatar.x = FRAME_W - 22;
  avatar.y = 12;
  avatar.fills = [{ type: "SOLID", color: B }];
  logoArea.appendChild(avatar);
  txt(logoArea, "진", FRAME_W - 17, 17, 13, W, "Bold");

  // Greeting
  txt(homeFrame, "안녕하세요, 진우님 👋", 20, 72, 13, GRAY3, "Bold");
  const greetTitle = figma.createText();
  greetTitle.fontName = { family: "Inter", style: "ExtraBold" };
  greetTitle.characters = "오늘은 어떤 장소를\n디깅할까요?";
  greetTitle.fontSize = 24;
  greetTitle.fills = [{ type: "SOLID", color: B }];
  greetTitle.lineHeight = { unit: "PERCENT", value: 125 };
  greetTitle.x = 20;
  greetTitle.y = 94;
  greetTitle.textAutoResize = "HEIGHT";
  greetTitle.resize(320, 80);
  homeFrame.appendChild(greetTitle);

  // Search bar
  const searchBar = figma.createRectangle();
  searchBar.resize(FRAME_W - 40, 50);
  searchBar.x = 20;
  searchBar.y = 188;
  searchBar.fills = [{ type: "SOLID", color: W }];
  searchBar.cornerRadius = 999;
  searchBar.strokeWeight = 1.5;
  searchBar.strokes = [{ type: "SOLID", color: GRAY2 }];
  homeFrame.appendChild(searchBar);
  txt(homeFrame, "🔍", 36, 200, 14, GRAY3, "Regular");
  txt(
    homeFrame,
    "장소 이름, 분위기, 키워드로 검색",
    62,
    200,
    13,
    { r: 0.65, g: 0.65, b: 0.65, a: 1 },
    "Medium",
  );

  // Quick cards (For You / Explore)
  const forYouCard = figma.createFrame();
  forYouCard.resize(165, 100);
  forYouCard.x = 20;
  forYouCard.y = 256;
  forYouCard.fills = [{ type: "SOLID", color: B }];
  forYouCard.cornerRadius = 16;
  homeFrame.appendChild(forYouCard);
  txt(forYouCard, "✨", 16, 14, 22, W, "Regular");
  txt(
    forYouCard,
    "PERSONALIZED",
    16,
    50,
    9,
    { r: 1, g: 1, b: 1, a: 0.5 },
    "Bold",
  );
  txt(forYouCard, "For You", 16, 66, 16, W, "ExtraBold");

  const exploreCard = figma.createFrame();
  exploreCard.resize(185, 100);
  exploreCard.x = 195;
  exploreCard.y = 256;
  exploreCard.fills = [{ type: "SOLID", color: W }];
  exploreCard.cornerRadius = 16;
  exploreCard.strokeWeight = 1.5;
  exploreCard.strokes = [{ type: "SOLID", color: GRAY2 }];
  homeFrame.appendChild(exploreCard);
  txt(exploreCard, "🔍", 16, 14, 22, B, "Regular");
  txt(exploreCard, "DISCOVER", 16, 50, 9, GRAY3, "Bold");
  txt(exploreCard, "Explore", 16, 66, 16, B, "ExtraBold");

  // Mood section
  txt(homeFrame, "오늘의 기분", 20, 376, 16, B, "ExtraBold");
  const moodChips = ["✨ 전체", "🔇 조용한", "🌟 새로운", "🌿 자연"];
  let chipX = 20;
  moodChips.forEach((m, i) => {
    const c = chip(homeFrame, m, chipX, 406, i === 0);
    chipX += i === 0 ? 90 : 88;
  });

  // Hero place card
  const heroCard = figma.createFrame();
  heroCard.name = "Hero Place Card";
  heroCard.resize(FRAME_W - 40, 180);
  heroCard.x = 20;
  heroCard.y = 450;
  heroCard.cornerRadius = 16;
  heroCard.clipsContent = true;
  heroCard.fills = [
    { type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.12, a: 1 } },
  ];
  homeFrame.appendChild(heroCard);
  // gradient overlay
  const heroGrad = figma.createRectangle();
  heroGrad.resize(FRAME_W - 40, 180);
  heroGrad.x = 0;
  heroGrad.y = 0;
  heroGrad.fills = [
    {
      type: "GRADIENT_LINEAR",
      gradientTransform: [
        [0, 1, 0],
        [-1, 0, 1],
      ],
      gradientStops: [
        { position: 0, color: { r: 0, g: 0, b: 0, a: 0.6 } },
        { position: 0.5, color: { r: 0, g: 0, b: 0, a: 0 } },
      ],
    },
  ];
  heroCard.appendChild(heroGrad);
  txt(heroCard, "CAFE", 16, 16, 10, { r: 1, g: 1, b: 1, a: 0.6 }, "Bold");
  txt(heroCard, "성수 어반스탠드", 16, 136, 18, W, "ExtraBold");

  // 2-col mini cards
  const miniPlaces = ["카페 리브레", "망원 포차", "연남 책방", "홍대 갤러리"];
  miniPlaces.forEach((name, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mc = figma.createFrame();
    mc.name = name;
    mc.resize(165, 80);
    mc.x = 20 + col * 175;
    mc.y = 646 + row * 90;
    mc.fills = [{ type: "SOLID", color: GRAY1 }];
    mc.cornerRadius = 14;
    mc.strokeWeight = 1.5;
    mc.strokes = [{ type: "SOLID", color: GRAY2 }];
    homeFrame.appendChild(mc);
    txt(mc, name, 12, 50, 12, B, "Bold");
    txt(mc, "카페", 12, 68, 10, GRAY3, "Medium");
  });

  // Bottom Nav
  bottomNav(homeFrame);

  // ════════════════════════════════════════════════
  // SCREEN 4: EXPLORE
  // ════════════════════════════════════════════════
  const explFrame = makeFrame("🔍 Explore", (FRAME_W + GAP) * 3, 0);

  // Sticky frosted header
  const header = figma.createFrame();
  header.name = "Sticky Header";
  header.resize(FRAME_W, 120);
  header.x = 0;
  header.y = 0;
  header.fills = [{ type: "SOLID", color: W, opacity: 0.92 }];
  explFrame.appendChild(header);
  rect(header, 0, 119, FRAME_W, 1, GRAY2, 0, "Border");

  txt(header, "Explore", 20, 16, 22, B, "ExtraBold");

  // Map button
  const mapBtn = figma.createFrame();
  mapBtn.resize(96, 36);
  mapBtn.x = FRAME_W - 116;
  mapBtn.y = 14;
  mapBtn.fills = [{ type: "SOLID", color: GRAY1 }];
  mapBtn.cornerRadius = 10;
  mapBtn.strokeWeight = 1.5;
  mapBtn.strokes = [{ type: "SOLID", color: GRAY2 }];
  header.appendChild(mapBtn);
  txt(mapBtn, "🗺 지도 보기", 8, 9, 12, B, "Bold");

  // Search bar in header
  const explSearch = figma.createRectangle();
  explSearch.resize(FRAME_W - 40, 44);
  explSearch.x = 20;
  explSearch.y = 58;
  explSearch.fills = [{ type: "SOLID", color: W }];
  explSearch.cornerRadius = 999;
  explSearch.strokeWeight = 1.5;
  explSearch.strokes = [{ type: "SOLID", color: GRAY2 }];
  header.appendChild(explSearch);
  txt(
    header,
    "🔍  장소 이름, 분위기로 검색",
    38,
    68,
    13,
    { r: 0.65, g: 0.65, b: 0.65, a: 1 },
    "Medium",
  );

  // Sort tabs
  const sortTabs = ["추천", "인기", "신규", "컬렉션"];
  let tabX = 20;
  sortTabs.forEach((tab, i) => {
    const isActive = i === 0;
    const t = figma.createText();
    t.fontName = { family: "Inter", style: "Bold" };
    t.characters = tab;
    t.fontSize = 14;
    t.fills = [{ type: "SOLID", color: isActive ? B : GRAY3 }];
    t.x = tabX;
    t.y = 128;
    explFrame.appendChild(t);
    tabX += t.width + 20;
    if (isActive) {
      const underline = rect(
        explFrame,
        t.x,
        148,
        t.width,
        2.5,
        B,
        1,
        "Active underline",
      );
    }
  });

  // Category chips
  const cats = ["🗺 전체", "☕ 카페", "🍜 맛집", "🎨 문화", "🌿 자연"];
  let catX = 20;
  cats.forEach((c, i) => {
    const cw = chip(explFrame, c, catX, 162, i === 0);
    catX += c.length < 6 ? 80 : 95;
  });

  // Results label
  txt(explFrame, "장소 12개", 20, 210, 13, GRAY3, "Bold");

  // 2-col grid
  const placeNames = [
    ["성수 어반스탠드", "☕ 카페"],
    ["망원 포차", "🍺 술집"],
    ["홍대 갤러리X", "🎨 문화"],
    ["연남 책방", "📚 문화"],
    ["한강 피크닉", "🌿 자연"],
    ["이태원 브런치", "🍳 맛집"],
  ];
  placeNames.forEach(([name, cat], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const card = figma.createFrame();
    card.resize(165, 190);
    card.x = 20 + col * 175;
    card.y = 230 + row * 200;
    card.cornerRadius = 14;
    card.fills = [{ type: "SOLID", color: GRAY1 }];
    card.strokeWeight = 1.5;
    card.strokes = [{ type: "SOLID", color: GRAY2 }];
    card.clipsContent = true;
    explFrame.appendChild(card);
    // Image area
    rect(card, 0, 0, 165, 110, { r: 0.82, g: 0.82, b: 0.84, a: 1 }, 0, "Img");
    // Gradient
    const cg = figma.createRectangle();
    cg.resize(165, 60);
    cg.x = 0;
    cg.y = 50;
    cg.fills = [
      {
        type: "GRADIENT_LINEAR",
        gradientTransform: [
          [0, 1, 0],
          [-1, 0, 1],
        ],
        gradientStops: [
          { position: 0, color: { r: 0, g: 0, b: 0, a: 0.4 } },
          { position: 1, color: { r: 0, g: 0, b: 0, a: 0 } },
        ],
      },
    ];
    card.appendChild(cg);
    txt(card, cat, 10, 118, 10, GRAY3, "Bold");
    txt(card, name, 10, 132, 13, B, "ExtraBold");
    txt(card, "⭐ 4.5  · 0.3km", 10, 158, 10, GRAY3, "Medium");
  });

  bottomNav(explFrame);

  // ════════════════════════════════════════════════
  // SCREEN 5: PLACE DETAIL
  // ════════════════════════════════════════════════
  const detailFrame = makeFrame("📍 Place Detail", (FRAME_W + GAP) * 4, 0);

  // Hero image
  const heroImg = figma.createRectangle();
  heroImg.resize(FRAME_W, 280);
  heroImg.x = 0;
  heroImg.y = 0;
  heroImg.fills = [
    { type: "SOLID", color: { r: 0.14, g: 0.14, b: 0.16, a: 1 } },
  ];
  detailFrame.appendChild(heroImg);

  // Gradient on hero
  const hGrad = figma.createRectangle();
  hGrad.resize(FRAME_W, 280);
  hGrad.x = 0;
  hGrad.y = 0;
  hGrad.fills = [
    {
      type: "GRADIENT_LINEAR",
      gradientTransform: [
        [0, 1, 0],
        [-1, 0, 1],
      ],
      gradientStops: [
        { position: 0, color: { r: 0, g: 0, b: 0, a: 0.6 } },
        { position: 0.45, color: { r: 0, g: 0, b: 0, a: 0 } },
        { position: 0.6, color: { r: 0, g: 0, b: 0, a: 0 } },
        { position: 1, color: { r: 0, g: 0, b: 0, a: 0.65 } },
      ],
    },
  ];
  detailFrame.appendChild(hGrad);

  // Back button (glassmorphism)
  const backBtn = figma.createEllipse();
  backBtn.resize(40, 40);
  backBtn.x = 16;
  backBtn.y = 16;
  backBtn.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 0.85 } }];
  detailFrame.appendChild(backBtn);
  txt(detailFrame, "←", 22, 22, 16, B, "Bold");

  // Share + Bookmark
  [FRAME_W - 60, FRAME_W - 108].forEach((x, i) => {
    const btn = figma.createEllipse();
    btn.resize(40, 40);
    btn.x = x;
    btn.y = 16;
    btn.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 0.85 } }];
    detailFrame.appendChild(btn);
    txt(detailFrame, i === 0 ? "🔖" : "↗", x + 10, 22, 15, B, "Regular");
  });

  // Place name overlay
  txt(detailFrame, "CAFE", 20, 234, 10, { r: 1, g: 1, b: 1, a: 0.6 }, "Bold");
  txt(detailFrame, "성수 어반스탠드", 20, 250, 20, W, "ExtraBold");

  // Quick stats bar
  const statsBar = figma.createFrame();
  statsBar.resize(FRAME_W, 50);
  statsBar.x = 0;
  statsBar.y = 280;
  statsBar.fills = [{ type: "SOLID", color: W }];
  statsBar.strokeWeight = 1;
  statsBar.strokes = [{ type: "SOLID", color: GRAY2 }];
  statsBar.strokeAlign = "INSIDE";
  detailFrame.appendChild(statsBar);
  txt(
    statsBar,
    "⭐ 4.8  (12)  •  📍 0.3km  •  🕐 11:00 - 22:00",
    20,
    16,
    12,
    GRAY3,
    "Medium",
  );

  // Tabs
  const tabs = ["정보", "기록", "주변"];
  const tabBar = figma.createFrame();
  tabBar.resize(FRAME_W, 48);
  tabBar.x = 0;
  tabBar.y = 330;
  tabBar.fills = [{ type: "SOLID", color: W }];
  detailFrame.appendChild(tabBar);
  tabs.forEach((tab, i) => {
    txt(tabBar, tab, i * 130 + 48, 15, 14, i === 0 ? B : GRAY3, "Bold");
  });
  rect(tabBar, 34, 46, 62, 2.5, B, 1, "Active tab");
  rect(tabBar, 0, 47, FRAME_W, 1, GRAY2, 0, "Tab border");

  // Tags
  const tagLabels = ["카페", "#조용한", "#혼자", "#포토스팟"];
  let tX = 20;
  tagLabels.forEach((tl, i) => {
    chip(detailFrame, tl, tX, 396, i === 0);
    tX += tl.length * 9 + 30;
  });

  // Info rows
  const infoCard = figma.createFrame();
  infoCard.resize(FRAME_W - 40, 130);
  infoCard.x = 20;
  infoCard.y = 444;
  infoCard.cornerRadius = 14;
  infoCard.fills = [{ type: "SOLID", color: GRAY1 }];
  infoCard.strokeWeight = 1.5;
  infoCard.strokes = [{ type: "SOLID", color: GRAY2 }];
  detailFrame.appendChild(infoCard);

  txt(infoCard, "주소", 16, 14, 11, GRAY3, "Bold");
  txt(infoCard, "서울특별시 성동구 성수이로 78", 16, 30, 14, B, "Medium");
  rect(infoCard, 0, 60, FRAME_W - 40, 1, GRAY2, 0);
  txt(infoCard, "영업시간", 16, 74, 11, GRAY3, "Bold");
  txt(infoCard, "월~금 11:00 - 22:00", 16, 90, 14, B, "Medium");

  // Description
  const desc = figma.createText();
  desc.fontName = { family: "Inter", style: "Medium" };
  desc.characters =
    "성수동 골목 안에 자리한 빈티지 감성의 카페. 조용한 분위기와 좋은 커피로 많은 로컬들이 즐겨 찾는 곳입니다.";
  desc.fontSize = 14;
  desc.fills = [{ type: "SOLID", color: GRAY3 }];
  desc.lineHeight = { unit: "PERCENT", value: 165 };
  desc.x = 20;
  desc.y = 594;
  desc.textAutoResize = "HEIGHT";
  desc.resize(350, 80);
  detailFrame.appendChild(desc);

  // CTA sticky button
  const ctaArea = figma.createFrame();
  ctaArea.resize(FRAME_W, 76);
  ctaArea.x = 0;
  ctaArea.y = FRAME_H - 76 - 64;
  ctaArea.fills = [{ type: "SOLID", color: W, opacity: 0.92 }];
  detailFrame.appendChild(ctaArea);
  rect(ctaArea, 0, 0, FRAME_W, 1, GRAY2, 0, "Top border");
  rect(ctaArea, 20, 14, FRAME_W - 40, 48, B, 12, "CTA Btn");
  txt(
    ctaArea,
    "✍️ 이 장소 기록하기",
    20,
    28,
    15,
    W,
    "Bold",
    FRAME_W - 40,
    "CENTER",
  );

  bottomNav(detailFrame);

  // ════════════════════════════════════════════════
  // SCREEN 6: MY PAGE
  // ════════════════════════════════════════════════
  const myFrame = makeFrame("👤 My Page", (FRAME_W + GAP) * 5, 0);

  // Header
  txt(myFrame, "마이페이지", 20, 24, 22, B, "ExtraBold");
  const settingsCirc = figma.createEllipse();
  settingsCirc.resize(40, 40);
  settingsCirc.x = FRAME_W - 56;
  settingsCirc.y = 14;
  settingsCirc.fills = [{ type: "SOLID", color: GRAY1 }];
  settingsCirc.strokes = [{ type: "SOLID", color: GRAY2 }];
  settingsCirc.strokeWeight = 1.5;
  myFrame.appendChild(settingsCirc);
  txt(myFrame, "⚙️", FRAME_W - 52, 20, 18, B, "Regular");

  // Profile card
  const profileCard = figma.createFrame();
  profileCard.resize(FRAME_W - 40, 168);
  profileCard.x = 20;
  profileCard.y = 72;
  profileCard.cornerRadius = 18;
  profileCard.fills = [{ type: "SOLID", color: W }];
  profileCard.strokeWeight = 1.5;
  profileCard.strokes = [{ type: "SOLID", color: GRAY2 }];
  myFrame.appendChild(profileCard);

  // Avatar
  const myAvatar = figma.createEllipse();
  myAvatar.resize(60, 60);
  myAvatar.x = 20;
  myAvatar.y = 20;
  myAvatar.fills = [{ type: "SOLID", color: B }];
  profileCard.appendChild(myAvatar);
  txt(profileCard, "진", 38, 32, 18, W, "Bold");

  txt(profileCard, "이진우", 96, 22, 17, B, "ExtraBold");
  txt(profileCard, "@loca_jinu", 96, 44, 13, GRAY3, "Bold");
  const titlePill = figma.createFrame();
  titlePill.resize(90, 24);
  titlePill.x = 96;
  titlePill.y = 64;
  titlePill.cornerRadius = 999;
  titlePill.fills = [{ type: "SOLID", color: GRAY1 }];
  profileCard.appendChild(titlePill);
  txt(titlePill, "로컬 디거 🔍", 8, 5, 10, GRAY3, "Bold");

  // Edit button
  const editBtn = figma.createFrame();
  editBtn.resize(56, 30);
  editBtn.x = FRAME_W - 96;
  editBtn.y = 30;
  editBtn.cornerRadius = 8;
  editBtn.fills = [{ type: "SOLID", color: GRAY1 }];
  editBtn.strokeWeight = 1.5;
  editBtn.strokes = [{ type: "SOLID", color: GRAY2 }];
  profileCard.appendChild(editBtn);
  txt(editBtn, "편집", 10, 7, 12, B, "Bold");

  rect(profileCard, 0, 108, FRAME_W - 40, 1, GRAY2, 0);

  // Follower stats
  [
    ["29", "팔로워"],
    ["13", "팔로잉"],
    ["3개", "이번 주"],
  ].forEach(([val, lbl], i) => {
    txt(profileCard, val, 30 + i * 110, 118, 16, B, "ExtraBold");
    txt(profileCard, lbl, 30 + i * 110, 138, 10, GRAY3, "Bold");
  });

  // Stats row
  const statLabels = [
    ["기록", "12개", true],
    ["장소들", "8개", false],
    ["임시저장", "3개", false],
  ];
  statLabels.forEach(([lbl, val, acc], i) => {
    const sc = figma.createFrame();
    sc.resize(104, 76);
    sc.x = 20 + i * 114;
    sc.y = 256;
    sc.cornerRadius = 14;
    sc.fills = [{ type: "SOLID", color: acc ? B : W }];
    sc.strokeWeight = acc ? 0 : 1.5;
    sc.strokes = [{ type: "SOLID", color: GRAY2 }];
    myFrame.appendChild(sc);
    txt(sc, val, 14, 12, 22, acc ? W : B, "ExtraBold");
    txt(
      sc,
      lbl,
      14,
      48,
      11,
      acc ? { r: 1, g: 1, b: 1, a: 0.6 } : GRAY3,
      "Bold",
    );
  });

  // Heatmap label
  txt(myFrame, "기록 캘린더", 20, 348, 14, B, "ExtraBold");
  txt(myFrame, "2026.08", FRAME_W - 72, 348, 12, GRAY3, "Bold");

  // Calendar grid (simplified)
  const weekdays2 = ["월", "화", "수", "목", "금", "토", "일"];
  weekdays2.forEach((d, i) => {
    txt(myFrame, d, 20 + i * 50, 372, 10, GRAY3, "Bold");
  });
  // Day cells
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      const day = row * 7 + col + 1;
      if (day > 31) break;
      const hasRecord = [3, 7, 10, 14, 17, 21, 25].includes(day);
      const dc = figma.createRectangle();
      dc.resize(40, 32);
      dc.x = 20 + col * 50;
      dc.y = 390 + row * 38;
      dc.cornerRadius = 6;
      dc.fills = [
        {
          type: "SOLID",
          color: hasRecord
            ? { r: 0.1, g: 0.1, b: 0.1, a: hasRecord ? 0.85 : 1 }
            : GRAY1,
        },
      ];
      myFrame.appendChild(dc);
      txt(
        myFrame,
        String(day),
        20 + col * 50 + 12,
        397 + row * 38,
        10,
        hasRecord ? W : GRAY3,
        "Bold",
      );
    }
  }

  // Tabs
  const myTabBar = figma.createFrame();
  myTabBar.resize(FRAME_W, 48);
  myTabBar.x = 0;
  myTabBar.y = 592;
  myTabBar.fills = [{ type: "SOLID", color: W }];
  myFrame.appendChild(myTabBar);
  ["기록", "장소들", "임시저장"].forEach((tab, i) => {
    txt(myTabBar, tab, i * 130 + 26, 15, 14, i === 0 ? B : GRAY3, "Bold");
  });
  rect(myTabBar, 20, 46, 44, 2.5, B, 1);
  rect(myTabBar, 0, 47, FRAME_W, 1, GRAY2, 0);

  // Record list items
  const recordItems = [
    ["조용한 오후의 카페", "성수 어반스탠드"],
    ["친구와 함께한 뒷골목", "연남 맛집"],
  ];
  recordItems.forEach(([title, place], i) => {
    const ri = figma.createFrame();
    ri.resize(FRAME_W - 40, 68);
    ri.x = 20;
    ri.y = 652 + i * 78;
    ri.cornerRadius = 14;
    ri.fills = [{ type: "SOLID", color: W }];
    ri.strokeWeight = 1.5;
    ri.strokes = [{ type: "SOLID", color: GRAY2 }];
    myFrame.appendChild(ri);

    const thumb = figma.createRectangle();
    thumb.resize(52, 52);
    thumb.x = 10;
    thumb.y = 8;
    thumb.cornerRadius = 10;
    thumb.fills = [{ type: "SOLID", color: GRAY2 }];
    ri.appendChild(thumb);
    txt(ri, "📸", 18, 18, 18, B, "Regular");

    txt(ri, title, 74, 14, 14, B, "ExtraBold");
    txt(ri, place, 74, 36, 12, GRAY3, "Medium");
  });

  bottomNav(myFrame);

  // ════════════════════════════════════════════════
  // 완료 — 모든 프레임 선택 및 뷰 포커스
  // ════════════════════════════════════════════════
  const allFrames = [
    loginFrame,
    onbFrame,
    homeFrame,
    explFrame,
    detailFrame,
    myFrame,
  ];
  figma.currentPage.selection = allFrames;
  figma.viewport.scrollAndZoomIntoView(allFrames);

  figma.notify("✅ LOCA 모바일 UI 6개 화면이 생성됐습니다!", { timeout: 4000 });
  figma.closePlugin();
})();
