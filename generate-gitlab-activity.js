import fs from "fs";
import fetch from "node-fetch";

const username = "LakithKarunaratne";

// GitLab public calendar JSON
const url = `https://gitlab.com/users/${username}/calendar.json`;

// GitHub-like colors
const COLORS = [
  "#ebedf0", // no activity
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39"
];

function getColor(count) {
  if (count === 0) return COLORS[0];
  if (count < 3) return COLORS[1];
  if (count < 6) return COLORS[2];
  if (count < 10) return COLORS[3];
  return COLORS[4];
}

function generateFullYearDateList() {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  const days = [];
  let current = new Date(oneYearAgo);

  while (current <= today) {
    const d = current.toISOString().slice(0, 10);
    days.push(d);
    current.setDate(current.getDate() + 1);
  }

  return days;
}

async function generate() {
  console.log("Fetching GitLab activity…");

  const res = await fetch(url);
  if (!res.ok) throw new Error("GitLab API request failed");
  const activity = await res.json();

  const allDates = generateFullYearDateList();

  // --- Layout Settings (GitHub-like) ---
  const rectSize = 10;
  const gap = 4;
  const svgPadding = 20;

  const totalWeeks = Math.ceil(allDates.length / 7);
  const width = svgPadding * 2 + totalWeeks * (rectSize + gap);
  const height = svgPadding * 2 + 7 * (rectSize + gap);

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
<style>
text { font-size: 12px; fill: #555; font-family: sans-serif; }
</style>
`;

  allDates.forEach((date, index) => {
    const week = Math.floor(index / 7);
    const day = index % 7;

    const x = svgPadding + week * (rectSize + gap);
    const y = svgPadding + day * (rectSize + gap);

    const count = activity[date] ?? 0;
    const color = getColor(count);

    svg += `
    <rect
      x="${x}"
      y="${y}"
      width="${rectSize}"
      height="${rectSize}"
      rx="2"
      ry="2"
      fill="${color}">
      <title>${date}: ${count} contributions</title>
    </rect>
`;
  });

  svg += `</svg>`;

  fs.writeFileSync("gitlab-activity.svg", svg);
  console.log("Generated improved gitlab-activity.svg");
}

generate();
