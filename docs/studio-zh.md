# Remotion Studio 中文适配

支持官方 npm Remotion 4.0.534。只发布词典和适配工具，不分发汉化后的整个 Remotion dist。`build.cjs` 对官方资源做哈希核验，AST 只修改展示文案，并补动态显示映射和限定 UI 的 DOM 文案。视频画布、输入、代码、协议名和属性标识符保留。

```powershell
node tools/studio-zh/build.cjs --project <你的Remotion工程>
node tools/studio-zh/verify.cjs --project <你的Remotion工程>
node tools/studio-zh/manage.cjs apply --project <你的Remotion工程>
```

先关闭该工程的 Studio，应用后重新启动。原文备份位于工程 `.video-workflow/studio-zh/baseline`，所有文件预检后才写入。恢复：

```powershell
node tools/studio-zh/manage.cjs restore --project <你的Remotion工程>
node tools/studio-zh/manage.cjs status --project <你的Remotion工程>
```

模板中 `npm run studio:zh` 自动生成、核验、应用并启动；`npm run studio:en` 恢复英文再启动。升级前恢复原资源，再更新依赖；旧词典和资源不能直接覆盖未知版本。生成输出已存在时使用新的输出目录或已有经过核验的补丁，不删除旧备份来绕过检查。

历史 2026-10-10 记录包含菜单、设置、编辑保存和 MP4 导出实测；本次复核是重新从 npm 依赖生成 552 个文件、语法和 AST 结构检查、应用/恢复及模板 TypeScript 检查。没有把历史全 UI 验收冒充本次重新执行。
