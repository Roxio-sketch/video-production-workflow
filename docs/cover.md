# 真实素材封面

模板位于 `templates/remotion-showcase/src/CoverTemplate.tsx`、`cover-entry.tsx`。黑洞与闪电 props JSON 和真实截图已随基础工程提供。

```powershell
python skills/demo-cover-compositor/scripts/render_cover.py --project templates/remotion-showcase --entry src/cover-entry.tsx --props blackhole.example.json --output <输出目录>/黑洞封面 --ffmpeg <ffmpeg路径>
```

输出 PNG、JPG、320×180 缩略图；脚本要求 Node、安装好的 Remotion 和 FFmpeg。新封面用不同文件名，只有明确更新同一作品时才使用 overwrite。图片必须在该工程 public 内。

默认 1920×1080；亮黄主标题黑描边，白色副标题，主标题更大。两行按整图中心对齐、留明显行距；实际 UI 放在文字下层。shot.box 为窗口、shot.image 为窗口内图片位置与尺寸。其他主题重新选择真实素材和构图，不机械复制四宫格。

瞬时落雷不能取默认第一帧；extract_frames.py 支持多时点选帧，先看接触表再看原图。当前封面仅证明这两份案例，不能宣传新项目未经录制的功能。
