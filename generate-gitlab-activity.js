import fs from "fs";
import fetch from "node-fetch";

const username = "LakithKarunaratne";
const url = `https://gitlab.com/users/${username}/calendar.json`;

// GitHub contribution colors (light + dark mode)
const COLORS = {
  light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
};

function getColor(count, mode) {
  const c = COLORS[mode];
  if (count === 0) return c[0];
  if (count < 3) return c[1];
  if (count < 6) return c[2];
  if (count < 10) return c[3];
  return c[4];
}

function generateFullYearDates() {
  const today = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 365);

  const days = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function monthLabelPositions(dates) {
  const months = {};
  dates.forEach((date, index) => {
    const d = new Date(date);
    const month = d.toLocaleString("en-US", { month: "short" });

    if (d.getDate() === 1) {
      const week = Math.floor(index / 7);
      if (!(month in months)) months[month] = week;
    }
  });
  return months;
}

async function generate() {
  const res = await fetch(url);
  const activity = await res.json();

  const dates = generateFullYearDates();
  const months = monthLabelPositions(dates);

  // --- GitHub exact layout ---
  const cell = 10;
  const gap = 2;
  const totalWeeks = Math.ceil(dates.length / 7);
  const paddingLeft = 40;
  const paddingTop = 20;

  const width = paddingLeft + totalWeeks * (cell + gap);
  const height = paddingTop + 7 * (cell + gap) + 20;

  // Start SVG
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    text {
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
      font-size: 10px;
      fill: #767676;
    }

    @media (prefers-color-scheme: dark) {
      text { fill: #8b949e; }
    }
  </style>
`;

  // Month Labels (GitHub style)
  for (const [month, week] of Object.entries(months)) {
    const x = paddingLeft + week * (cell + gap);
    svg += `<text x="${x}" y="12">${month}</text>`;
  }

  // Weekday Labels (Mon, Wed, Fri — same as GitHub)
  const weekdayLabels = { 1: "Mon", 3: "Wed", 5: "Fri" };
  for (const [dayIndex, label] of Object.entries(weekdayLabels)) {
    svg += `<text x="0" y="${paddingTop + dayIndex * (cell + gap) + 7}">${label}</text>`;
  }

  // Draw squares (light + dark mode using <g> with CSS)
  svg += `
  <g class="light-mode">
  <style>
    @media (prefers-color-scheme: dark) { .light-mode { display: none } }
  </style>
`;

  dates.forEach((date, index) => {
    const week = Math.floor(index / 7);
    const day = index % 7;
    const count = activity[date] ?? 0;
    const color = getColor(count, "light");

    const x = paddingLeft + week * (cell + gap);
    const y = paddingTop + day * (cell + gap);

    svg += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" ry="2" fill="${color}">
      <title>${date}: ${count} contributions</title>
    </rect>`;
  });

  svg += `
  </g>
  <g class="dark-mode">
  <style>
    .dark-mode { display:none }
    @media (prefers-color-scheme: dark) { .dark-mode { display:inline } }
  </style>
`;

  dates.forEach((date, index) => {
    const week = Math.floor(index / 7);
    const day = index % 7;
    const count = activity[date] ?? 0;
    const color = getColor(count, "dark");

    const x = paddingLeft + week * (cell + gap);
    const y = paddingTop + day * (cell + gap);

    svg += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" ry="2" fill="${color}">
      <title>${date}: ${count} contributions</title>
    </rect>`;
  });

  svg += `
  </g>
</svg>
`;

  fs.writeFileSync("gitlab-activity.svg", svg);
  console.log("Generated EXACT GitHub-style dark/light SVG");
}

generate();
