# 内容和复用范围

- 四个制作 Skill：总流程、Studio 中文适配、功能介绍视频、封面拼接。
- 中文工具：build（版本和源哈希检查）、verify（语法及标识符/属性结构）、manage（应用/恢复/状态）、launch（模板快捷启动）。词典 1614 条，参考补丁 552 文件/3011 静态替换。
- 可运行基础工程：横竖版中文可编辑图层、依赖锁、封面组件、两个 props 示例及真实截图/UI。
- 历史剪辑：横版、竖版、字幕、音频混合、自然解说、媒体/配音检查与发布文案。
- Minecraft 隔离录制源码：实际 framebuffer、调参控件和镜头调度。输出、FFmpeg、存档和雷劫配方改为显式 Gradle/system property 配置。依赖该示例 Mod，不是任意 Minecraft 的通用接口。录制会建立/修改专用世界，只能在隔离客户端使用。
- 技术检查：inspect_video.py、extract_frames.py、render_cover.py；具体参数运行 --help。
- 原记录：制作结果、音频来源和中文验收。记录的旧时间、固定路径和未分发媒体不构成新机器配置。

未分发完整成片、原始视频、BGM、TTS 模型、游戏存档、node_modules、构建缓存和汉化后的 Remotion 整库。历史 shader-showcase 不具备所有媒体，需补足实际录制后运行。基础模板可以独立安装。
