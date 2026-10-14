param([switch]$NoNarration)
$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
New-Item -ItemType Directory -Force -Path '../exports' | Out-Null
$nodeExe='E:\nodejs\node.exe'
$cli='node_modules/@remotion/cli/remotion-cli.js'
$suffix=if($NoNarration){'无配音版'}else{'曼波配音版'}
$propsPath=Join-Path (Get-Location) 'logs/render-props.json'
@{narration=(-not $NoNarration.IsPresent)} | ConvertTo-Json | Set-Content -LiteralPath $propsPath -Encoding utf8
& $nodeExe $cli render CustomBlackHole "../exports/自定义黑洞与白洞-$suffix.mp4" "--props=$propsPath" --codec=h264 --crf=16 --x264-preset=medium --pixel-format=yuv420p --color-space=bt709 --audio-bitrate=320k --image-format=png --concurrency=4
if($LASTEXITCODE -ne 0){throw 'Black hole render failed'}
& $nodeExe $cli render CustomLightning "../exports/自定义闪电与雷劫-$suffix.mp4" "--props=$propsPath" --codec=h264 --crf=16 --x264-preset=medium --pixel-format=yuv420p --color-space=bt709 --audio-bitrate=320k --image-format=png --concurrency=4
if($LASTEXITCODE -ne 0){throw 'Lightning render failed'}
