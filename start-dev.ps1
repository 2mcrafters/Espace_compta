$ErrorActionPreference = "Stop"

function Start-Window($title, $command) {
  Start-Process -FilePath "powershell.exe" -ArgumentList @('-NoExit', '-Command', "Write-Host `$Host.UI.RawUI.WindowTitle='$title'; $command") | Out-Null
}

# Backend: Laravel via PHP built-in server on 127.0.0.1:8002
$backendPublic = "${PSScriptRoot}\backend\public"
if (-not (Test-Path $backendPublic)) { throw "Backend public directory not found: $backendPublic" }
Start-Window "Espace Compta - Backend" "Set-Location `$([IO.Path]::GetFullPath($backendPublic)); php -S 127.0.0.1:8002 index.php"

# Frontend: Vite dev server (port 5173)
$frontend = "${PSScriptRoot}\frontend"
if (-not (Test-Path $frontend)) { throw "Frontend directory not found: $frontend" }
Start-Window "Espace Compta - Frontend" "Set-Location `$([IO.Path]::GetFullPath($frontend)); npm run dev"

Start-Sleep -Seconds 2
Write-Host "Opening frontend: http://localhost:5173"
Start-Process "http://localhost:5173" | Out-Null
