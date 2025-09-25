"use strict";

// src/main.ts
function roundToStep(v, step = 0.5) {
  return Math.round(v / step) * step;
}
function isNum(n) {
  return typeof n === "number" && isFinite(n);
}
function pxToDp(px, dpi, step = 0.5) {
  return roundToStep(px * 160 / dpi, step);
}
function annotate(node, dpi, step, out) {
  const rec = { id: node.id, name: node.name, type: node.type };
  const anyNode = node;
  const w = anyNode.width;
  const h = anyNode.height;
  const x = anyNode.x;
  const y = anyNode.y;
  if (isNum(w)) rec.width_dp = pxToDp(w, dpi, step);
  if (isNum(h)) rec.height_dp = pxToDp(h, dpi, step);
  if (isNum(x)) rec.x_dp = pxToDp(x, dpi, step);
  if (isNum(y)) rec.y_dp = pxToDp(y, dpi, step);
  const cr = anyNode.cornerRadius;
  if (isNum(cr)) rec.corner_dp = pxToDp(cr, dpi, step);
  const sw = anyNode.strokeWeight;
  if (isNum(sw)) rec.stroke_dp = pxToDp(sw, dpi, step);
  if (node.type === "TEXT") {
    const fs = node.fontSize;
    if (isNum(fs)) rec.font_sp = pxToDp(fs, dpi, step);
  }
  const bits = [node.name];
  if (isNum(rec.width_dp) && isNum(rec.height_dp)) bits.push(`(${rec.width_dp}\xD7${rec.height_dp}dp)`);
  node.name = bits.join(" ");
  out.push(rec);
}
function walk(node, dpi, step, out) {
  annotate(node, dpi, step, out);
  if ("children" in node) for (const c of node.children) walk(c, dpi, step, out);
}
figma.showUI(__html__, { width: 300, height: 260 });
var last = [];
var annotationRegex = /\s*\(\d+(\.\d+)?×\d+(\.\d+)?dp\)$/;
function cleanWalk(node) {
  node.name = node.name.replace(annotationRegex, "").trim();
  if ("children" in node) {
    for (const child of node.children) {
      cleanWalk(child);
    }
  }
}
figma.ui.onmessage = (msg) => {
  if (msg.type === "run") {
    const sel = figma.currentPage.selection;
    if (sel.length !== 1 || !("children" in sel[0])) {
      figma.ui.postMessage({ log: "\uC790\uC2DD\uC774 \uC788\uB294 \uD504\uB808\uC784/\uADF8\uB8F9 1\uAC1C\uB97C \uC120\uD0DD\uD558\uC138\uC694." });
      return;
    }
    const dpi = Math.max(72, Number(msg.dpi) || 160);
    const step = Math.max(0.1, Number(msg.step) || 0.5);
    last = [];
    walk(sel[0], dpi, step, last);
    figma.ui.postMessage({ log: `\uC644\uB8CC: ${last.length}\uAC1C \uB178\uB4DC \uBCC0\uD658  \u2022  dpi=${dpi}, step=${step}` });
  }
  if (msg.type === "clean") {
    const sel = figma.currentPage.selection;
    if (sel.length !== 1 || !("children" in sel[0])) {
      figma.ui.postMessage({ log: "\uC790\uC2DD\uC774 \uC788\uB294 \uD504\uB808\uC784/\uADF8\uB8F9 1\uAC1C\uB97C \uC120\uD0DD\uD558\uC138\uC694." });
      return;
    }
    cleanWalk(sel[0]);
    figma.ui.postMessage({ log: "\uC8FC\uC11D\uC744 \uBAA8\uB450 \uC81C\uAC70\uD588\uC2B5\uB2C8\uB2E4." });
  }
};
