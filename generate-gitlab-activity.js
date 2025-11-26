import fs from "fs";
import fetch from "node-fetch";

const username = "LakithKarunaratne";
const url = `https://gitlab.com/users/${username}/calendar.json`;

const COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

function getColor(count) {
  if (count === 0) return COLORS[0];
  if (count < 3) return COLORS[1];
  if (count < 6) return COLORS[2];
  if (count < 10) return COLORS[3];
  return COLORS[4];
}

async function generate() {
  try {
    console.log("Fetching GitLab activity…");

    const res = await fetch(url);
    if (!res.ok) throw new Error("GitLab API request failed");

    const data = await res.json();

    const rectSize = 12;
    const gap = 3;

    const dates = Object.entries(data);
    const width = 53 * (rectSize + gap);
    const height = 7 * (rectSize + gap);

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

    let i = 0;
    for (const [date, count] of dates) {
      const week = Math.floor(i / 7);
      const day = i % 7;

      const x = week * (rectSize + gap);
      const y = day * (rectSize + gap);

      svg += `
      <rect
        x="${x}"
        y="${y}"
        width="${rectSize}"
        height="${rectSize}"
        fill="${getColor(count)}">
        <title>${date}: ${count} contributions</title>
      </rect>`;

      i++;
    }

    svg += `</svg>`;

    fs.writeFileSync("gitlab-activity.svg", svg);
    console.log("Generated gitlab-activity.svg");
  } catch (err) {
    console.error("Error generating GitLab activity:", err);
  }
}

generate();
