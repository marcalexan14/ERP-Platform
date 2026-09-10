@echo off
title FinFlow (local)
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies for the first time...
  call npm install
)

node scripts\dev-local.mjs
pause
