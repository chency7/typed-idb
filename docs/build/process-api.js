import fs from "fs-extra";
import path from "path";
import { glob } from "glob";

async function processAPI() {
  const source = path.resolve(process.cwd(), "./docs/temp-markdown");
  const target = path.resolve(process.cwd(), "./docs/markdown");

  try {
    // 清理旧文件
    await fs.remove(target);
    console.log("🧹 已清理旧 API 文档");

    // 移动文件
    await fs.move(source, target, { overwrite: true });
    console.log("🚚 已移动 API 文档");

    // 修改 HTML 结构
    const htmlFiles = await glob(path.join(target, "**/*.html"));

    await Promise.all(
      htmlFiles.map(async (file) => {
        let content = await fs.readFile(file, "utf8");

        // 添加 VitePress 容器
        content = content
          .replace(/<body class=/, '<body class="vp-doc ')
          .replace(
            /<\/head>/,
            `
          <link rel="stylesheet" href="/theme/typedoc.css">
          </head>
        `
          );

        await fs.writeFile(file, content);
      })
    );

    console.log("✨ API 文档处理完成");
  } catch (err) {
    console.error("❌ 文档处理失败:", err);
    process.exit(1);
  }
}

processAPI();
