function roundToStep(v: number, step = 0.5) {
  return Math.round(v / step) * step;
}
function isNum(n: unknown): n is number { return typeof n === 'number' && isFinite(n); }

// ★ dpi 기반 변환식: px -> dp
function pxToDp(px: number, dpi: number, step = 0.5) {
  return roundToStep(px * 160 / dpi, step);
}

function annotate(node: SceneNode, dpi: number, step: number, out: any[]) {
  const rec: any = { id: node.id, name: node.name, type: node.type };
  const anyNode = node as any;

  const w = anyNode.width as number | undefined;
  const h = anyNode.height as number | undefined;
  const x = anyNode.x as number | undefined;
  const y = anyNode.y as number | undefined;

  if (isNum(w)) rec.width_dp  = pxToDp(w, dpi, step);
  if (isNum(h)) rec.height_dp = pxToDp(h, dpi, step);
  if (isNum(x)) rec.x_dp      = pxToDp(x, dpi, step);
  if (isNum(y)) rec.y_dp      = pxToDp(y, dpi, step);

  const cr = anyNode.cornerRadius as number | undefined;
  if (isNum(cr)) rec.corner_dp = pxToDp(cr, dpi, step);

  const sw = anyNode.strokeWeight as number | undefined;
  if (isNum(sw)) rec.stroke_dp = pxToDp(sw, dpi, step);

  if (node.type === 'TEXT') {
    const fs = (node as TextNode).fontSize as number | undefined;
    if (isNum(fs)) rec.font_sp = pxToDp(fs, dpi, step);
  }

  // 이름 주석
  const bits = [node.name];
  if (isNum(rec.width_dp) && isNum(rec.height_dp)) bits.push(`(${rec.width_dp}×${rec.height_dp}dp)`);
  node.name = bits.join(' ');

  out.push(rec);
}

function walk(node: SceneNode, dpi: number, step: number, out: any[]) {
  annotate(node, dpi, step, out);
  if ("children" in node) for (const c of (node as ChildrenMixin).children) walk(c as SceneNode, dpi, step, out);
}

figma.showUI(__html__, { width: 300, height: 260 });

let last: any[] = [];

const annotationRegex = /\s*\(\d+(\.\d+)?×\d+(\.\d+)?dp\)$/;

function cleanWalk(node: SceneNode) {
  node.name = node.name.replace(annotationRegex, '').trim();
  if ("children" in node) {
    for (const child of (node as ChildrenMixin).children) {
      cleanWalk(child as SceneNode);
    }
  }
}

figma.ui.onmessage = (msg) => {
  if (msg.type === 'run') {
    const sel = figma.currentPage.selection;
    if (sel.length !== 1 || !('children' in sel[0])) {
      figma.ui.postMessage({ log: '자식이 있는 프레임/그룹 1개를 선택하세요.' });
      return;
    }
    const dpi = Math.max(72, Number(msg.dpi) || 160);
    const step = Math.max(0.1, Number(msg.step) || 0.5);
    last = [];
    walk(sel[0] as SceneNode, dpi, step, last);
    figma.ui.postMessage({ log: `완료: ${last.length}개 노드 변환  •  dpi=${dpi}, step=${step}` });
  }

  if (msg.type === 'clean') {
    const sel = figma.currentPage.selection;
    if (sel.length !== 1 || !('children' in sel[0])) {
      figma.ui.postMessage({ log: '자식이 있는 프레임/그룹 1개를 선택하세요.' });
      return;
    }
    cleanWalk(sel[0] as SceneNode);
    figma.ui.postMessage({ log: '주석을 모두 제거했습니다.' });
  }
};