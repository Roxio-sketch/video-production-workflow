---
name: remotion-studio-zh
description: 生成、验证、应用和恢复 Remotion Studio 4.0.534 简体中文显示补丁，保留编辑协议和视频源码，拒绝未知版本或资源。
---

# Remotion Studio 中文适配

工具在 video-production-workflow 仓库 tools/studio-zh。先确认用户实际工程、依赖版本、已有修改和 Studio 服务。读取 docs/studio-zh.md，停止对应服务后依次 build、verify、apply，再启动核验界面。未知版本/哈希失败立即停止，不强制覆盖或改版本号。

manage restore 恢复现场备份，不能用别人的 baseline。更新前恢复英文、保留项目修改。词典只用于 UI 显示；不翻译用户视频、输入、代码、CLI 参数或协议。外部错误和所有动态分支不保证中文。测试必须区分 AST/哈希检查、实际界面、源码编辑保存和导出结果。
