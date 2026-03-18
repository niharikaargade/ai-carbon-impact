const TIERS = [
  { id: "efficient", name: "Efficient small model", whPer1kTokens: 0.04 },
  { id: "standard", name: "Standard lightweight model", whPer1kTokens: 0.08 },
  { id: "heavy", name: "Heavier deployment pattern", whPer1kTokens: 0.15 }
];

const FACTORS = {
  gridKgPerKwh: 0.2976,
  carGPerMile: 393,
  woodKgCo2PerKgWood: 1.83,
  plasticKgCo2PerKgPlastic: 2.9,
  gasolineKgCo2PerLiter: 2.31,
  coalKgCo2PerKgCoal: 2.42,
  imageWhPerImage: 2.907
};

const COMPARISONS = [
  {
    id: "car",
    title: "Car driving emissions",
    convert: (co2kg) => {
      const miles = (co2kg * 1000) / FACTORS.carGPerMile;
      return {
        value: `${fmt(miles, 1)} miles`,
        sub: `${fmt(miles / 30, 1)} hours of driving at 30 mph`,
        ratio: clamp(miles / 5000, 0, 1)
      };
    }
  },
  {
    id: "wood",
    title: "Wood burning equivalent",
    convert: (co2kg) => {
      const kg = co2kg / FACTORS.woodKgCo2PerKgWood;
      return {
        value: `${fmt(kg, 1)} kg wood`,
        sub: "Approx dry wood burned",
        ratio: clamp(kg / 1000, 0, 1)
      };
    }
  },
  {
    id: "plastic",
    title: "Plastic burning equivalent",
    convert: (co2kg) => {
      const kg = co2kg / FACTORS.plasticKgCo2PerKgPlastic;
      return {
        value: `${fmt(kg, 1)} kg plastic`,
        sub: "Approx mixed plastic burned",
        ratio: clamp(kg / 250, 0, 1)
      };
    }
  },
  {
    id: "gasoline",
    title: "Gasoline combustion equivalent",
    convert: (co2kg) => {
      const liters = co2kg / FACTORS.gasolineKgCo2PerLiter;
      return {
        value: `${fmt(liters, 1)} liters of gasoline`,
        sub: "Equivalent combustion emissions",
        ratio: clamp(liters / 500, 0, 1)
      };
    }
  },
  {
    id: "coal",
    title: "Coal burning equivalent",
    convert: (co2kg) => {
      const kg = co2kg / FACTORS.coalKgCo2PerKgCoal;
      return {
        value: `${fmt(kg, 1)} kg coal`,
        sub: "Equivalent combustion emissions",
        ratio: clamp(kg / 500, 0, 1)
      };
    }
  }
];

const HEADLINES = [
  {
    region: "Europe (Ireland)",
    date: "Jul 23, 2024",
    source: "The Guardian",
    title: "Data centres overtake urban homes in electricity use in Ireland",
    impact:
      "Data center demand can overtake residential electricity use and reshape national grid priorities.",
    url: "https://www.theguardian.com/environment/article/2024/jul/23/data-centres-to-overtake-urban-households-in-electricity-use-in-ireland"
  },
  {
    region: "South America (Uruguay)",
    date: "Aug 1, 2024",
    source: "The Guardian",
    title: "Anger mounts in Uruguay over environmental cost of Google data center",
    impact:
      "Local communities raised concerns around water use and environmental pressure from large infrastructure.",
    url: "https://www.theguardian.com/world/article/2024/aug/01/anger-in-uruguay-over-environmental-cost-of-google-data-centre"
  },
  {
    region: "Southeast Asia (Malaysia)",
    date: "Feb 24, 2026",
    source: "Malay Mail (AFP)",
    title: "Malaysia freezes new non-AI data centres over power and water concerns",
    impact:
      "Policy-level response to power and water constraints linked to fast data center expansion.",
    url: "https://www.malaymail.com/news/malaysia/2026/02/24/malaysia-freezes-new-non-ai-data-centres-over-power-and-water-concerns-says-anwar/210287"
  },
  {
    region: "Oceania (Australia)",
    date: "Mar 14, 2026",
    source: "The Guardian",
    title: "The environmental cost of datacentres is rising. Is it time to quit AI?",
    impact:
      "Reports rising concern that AI and data center growth can increase electricity demand and water stress.",
    url: "https://www.theguardian.com/australia-news/2026/mar/13/ai-datacentres-environmental-impacts"
  },
  {
    region: "North America (U.S. Georgia)",
    date: "Dec 19, 2025",
    source: "AP News",
    title: "Georgia regulators approve major utility expansion tied to data center demand",
    impact:
      "Regulators approved significant utility expansion driven by projected data center load growth.",
    url: "https://apnews.com/article/georgia-power-electricity-data-centers-psc-bills-0b377d6a4a57c9353c0eb577b8951af3"
  }
];

const el = {
  requests: document.getElementById("requests"),
  requestsLabel: document.getElementById("requestsLabel"),
  tokens: document.getElementById("tokens"),
  tokensLabel: document.getElementById("tokensLabel"),
  tier: document.getElementById("tier"),
  imagesPerDay: document.getElementById("imagesPerDay"),
  imagesLabel: document.getElementById("imagesLabel"),
  videosPerDay: document.getElementById("videosPerDay"),
  videosLabel: document.getElementById("videosLabel"),
  videoWhPerClip: document.getElementById("videoWhPerClip"),
  videoWhLabel: document.getElementById("videoWhLabel"),
  todayCo2: document.getElementById("todayCo2"),
  todayKwh: document.getElementById("todayKwh"),
  todayHeat: document.getElementById("todayHeat"),
  monthCo2: document.getElementById("monthCo2"),
  monthKwh: document.getElementById("monthKwh"),
  monthHeat: document.getElementById("monthHeat"),
  yearCo2: document.getElementById("yearCo2"),
  yearKwh: document.getElementById("yearKwh"),
  yearHeat: document.getElementById("yearHeat"),
  comparisonGrid: document.getElementById("comparisonGrid"),
  severityFill: document.getElementById("severityFill"),
  severityText: document.getElementById("severityText"),
  impactBullets: document.getElementById("impactBullets"),
  headlineGrid: document.getElementById("headlineGrid")
};

let activeComparisonIndex = 0;
let comparisonTimer = null;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fmt(value, decimals = 2) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function populateInputs() {
  TIERS.forEach((tier) => {
    const option = document.createElement("option");
    option.value = tier.id;
    option.textContent = `${tier.name} (~${tier.whPer1kTokens} Wh / 1k tokens)`;
    el.tier.appendChild(option);
  });
  el.tier.value = "standard";

}

function renderComparison(yearCo2Kg) {
  el.comparisonGrid.innerHTML = COMPARISONS.map((comparison, index) => {
    const out = comparison.convert(yearCo2Kg);
    return `
      <div class="cmp ${index === activeComparisonIndex ? "active" : ""}" style="animation-delay:${index * 90}ms">
        <p>${comparison.title}</p>
        <p class="cmp-big">${out.value}</p>
        <p class="small">${out.sub} for the annual scenario</p>
        <div class="bar"><span style="width:${out.ratio * 100}%"></span></div>
      </div>
    `;
  }).join("");
}

function tickComparisonFocus() {
  activeComparisonIndex = (activeComparisonIndex + 1) % COMPARISONS.length;
  const cards = Array.from(el.comparisonGrid.querySelectorAll(".cmp"));
  cards.forEach((card, index) => {
    card.classList.toggle("active", index === activeComparisonIndex);
  });
}

function renderSeverity(yearCo2Kg) {
  const ratio = clamp(yearCo2Kg / 2000, 0, 1);
  el.severityFill.style.width = `${ratio * 100}%`;

  let level = "low";
  if (yearCo2Kg >= 100 && yearCo2Kg < 500) level = "moderate";
  if (yearCo2Kg >= 500 && yearCo2Kg < 1500) level = "high";
  if (yearCo2Kg >= 1500) level = "severe";
  el.severityText.textContent = `Impact level: ${level}`;

  const bullets = [
    `At this usage level, AI workload emits about ${fmt(yearCo2Kg, 1)} kg CO2e per year.`,
    "Most electricity consumed by compute ends up as heat in and around infrastructure.",
    "When usage scales from one user to teams, products, and always-on automation, impact compounds quickly."
  ];

  el.impactBullets.innerHTML = bullets.map((item) => `<li>${item}</li>`).join("");
}

function renderHeadlines() {
  el.headlineGrid.innerHTML = HEADLINES.map((item) => {
    return `
      <article class="headline-card">
        <h3><a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a></h3>
        <p class="headline-meta">${item.region} | ${item.source} | ${item.date}</p>
        <p class="headline-impact">${item.impact}</p>
      </article>
    `;
  }).join("");
}

function compute() {
  const requests = Number(el.requests.value);
  const tokens = Number(el.tokens.value);
  const imagesPerDay = Number(el.imagesPerDay.value);
  const videosPerDay = Number(el.videosPerDay.value);
  const videoWhPerClip = Number(el.videoWhPerClip.value);
  const tier = TIERS.find((item) => item.id === el.tier.value) || TIERS[1];

  el.requestsLabel.textContent = fmt(requests, 0);
  el.tokensLabel.textContent = fmt(tokens, 0);
  el.imagesLabel.textContent = fmt(imagesPerDay, 0);
  el.videosLabel.textContent = fmt(videosPerDay, 0);
  el.videoWhLabel.textContent = fmt(videoWhPerClip, 0);

  const textWh = (requests * tokens * tier.whPer1kTokens) / 1000;
  const imageWh = imagesPerDay * FACTORS.imageWhPerImage;
  const videoWh = videosPerDay * videoWhPerClip;
  const dailyWh = textWh + imageWh + videoWh;
  const dailyKwh = dailyWh / 1000;
  const dailyHeatMj = dailyKwh * 3.6;
  const dailyCo2Kg = dailyKwh * FACTORS.gridKgPerKwh;

  const monthKwh = dailyKwh * 30;
  const monthHeatMj = dailyHeatMj * 30;
  const monthCo2Kg = dailyCo2Kg * 30;

  const yearKwh = dailyKwh * 365;
  const yearHeatMj = dailyHeatMj * 365;
  const yearCo2Kg = dailyCo2Kg * 365;

  el.todayCo2.textContent = fmt(dailyCo2Kg, 4);
  el.todayKwh.textContent = fmt(dailyKwh, 4);
  el.todayHeat.textContent = fmt(dailyHeatMj, 4);

  el.monthCo2.textContent = fmt(monthCo2Kg, 3);
  el.monthKwh.textContent = fmt(monthKwh, 3);
  el.monthHeat.textContent = fmt(monthHeatMj, 3);

  el.yearCo2.textContent = fmt(yearCo2Kg, 2);
  el.yearKwh.textContent = fmt(yearKwh, 2);
  el.yearHeat.textContent = fmt(yearHeatMj, 2);

  renderComparison(yearCo2Kg);
  renderSeverity(yearCo2Kg);
}

function setupEvents() {
  ["input", "change"].forEach((ev) => {
    el.requests.addEventListener(ev, compute);
    el.tokens.addEventListener(ev, compute);
    el.tier.addEventListener(ev, compute);
    el.imagesPerDay.addEventListener(ev, compute);
    el.videosPerDay.addEventListener(ev, compute);
    el.videoWhPerClip.addEventListener(ev, compute);
  });
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
}

function init() {
  populateInputs();
  setupEvents();
  setupReveal();
  renderHeadlines();
  compute();
  if (comparisonTimer) clearInterval(comparisonTimer);
  comparisonTimer = setInterval(tickComparisonFocus, 1500);
}

init();
