# run-all.ps1
Write-Host "Starting StudentOS Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\mvnw.cmd spring-boot:run"

Write-Host "Starting StudentOS Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Both services are launching in new windows." -ForegroundColor Yellow
