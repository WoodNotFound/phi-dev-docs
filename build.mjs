import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { marked } from "marked";

// Each page: src/<name>.md, its diagrams in src/img/<name>/, keyed by the caption the doc export leaves behind.
const PAGES = [
  {
    name: "athena-architecture",
    title: "Phi Athena Agent 能力架构概要设计",
    images: {
      "Phi Agent 和 Phi Nikai 的关系": "relationship.png",
      "分层架构 · 4 层": "layers.png",
      "一条消息从进入到返回的流程": "message-flow.png",
      "异步 worker 的流程": "async-worker.png",
    },
  },
  {
    name: "athena-chat",
    title: "Athena Chat 开发测试说明",
    images: {
      "Phi Agent 和 Phi Nikai 的关系": "relationship.png",
      "一条消息从进入到返回的流程": "message-flow.png",
      "异步 worker 的流程（规划中）": "async-worker.png",
    },
  },
];

const render = ({ name, images }) => {
  let source = readFileSync(`src/${name}.md`, "utf8");
  for (const [alt, file] of Object.entries(images)) {
    source = source.replace(`&#91;embedded content: ${alt}\\]`, `![${alt}](img/${file})`);
  }
  if (source.includes("embedded content")) throw new Error(`${name}: a diagram has no image`);
  return marked
    .parse(source)
    .replace(/<table>/g, '<div class="table"><table>')
    .replace(/<\/table>/g, "</table></div>");
};

const page = (title, content) => `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>
:root { color-scheme: light; --ink: #1f1f1d; --quiet: #6b6a65; --line: #e2e0d9; --tint: #f6f5f1; --link: #1f6fd1; }
* { box-sizing: border-box; }
body { margin: 0; background: #fff; color: var(--ink); font: 16px/1.75 -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif; }
main { max-width: 800px; margin: 0 auto; padding: 48px 24px 96px; }
h1 { font-size: 32px; line-height: 1.3; margin: 0 0 12px; }
h1 + p { color: var(--quiet); font-size: 14px; margin: 0 0 32px; }
h2 { font-size: 23px; line-height: 1.4; margin: 56px 0 16px; padding-top: 24px; border-top: 1px solid var(--line); }
h3 { font-size: 18px; margin: 32px 0 12px; }
p, ul, ol { margin: 0 0 16px; }
li { margin: 4px 0; }
a { color: var(--link); }
img { display: block; width: 100%; height: auto; margin: 24px 0; }
code { font: 0.875em ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background: var(--tint); border-radius: 4px; padding: 2px 5px; }
pre { background: var(--tint); border: 1px solid var(--line); border-radius: 8px; padding: 16px; overflow-x: auto; line-height: 1.55; margin: 0 0 24px; }
pre code { background: none; padding: 0; }
.table { overflow-x: auto; margin: 0 0 24px; }
table { border-collapse: collapse; width: 100%; font-size: 14px; line-height: 1.6; }
th, td { border: 1px solid var(--line); padding: 8px 12px; text-align: left; vertical-align: top; }
th { background: var(--tint); font-weight: 600; white-space: nowrap; }
@media (max-width: 600px) { main { padding: 32px 16px 64px; } h1 { font-size: 26px; } th, td { min-width: 96px; } }
</style>
</head>
<body><main>
${content}
</main></body>
</html>
`;

for (const p of PAGES) {
  mkdirSync(p.name, { recursive: true });
  cpSync(`src/img/${p.name}`, `${p.name}/img`, { recursive: true });
  writeFileSync(`${p.name}/index.html`, page(p.title, render(p)));
}
writeFileSync(
  "index.html",
  page(
    "Phi 开发文档",
    `<h1>Phi 开发文档</h1>\n<ul>${PAGES.map((p) => `<li><a href="${p.name}/">${p.title}</a></li>`).join("")}</ul>`,
  ),
);
