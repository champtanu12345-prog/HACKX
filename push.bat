@echo off
echo ===================================================
echo  Pushing HACKX to GitHub
echo  Repository: https://github.com/champtanu12345-prog/HACKX.git
echo ===================================================

git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ===================================================
    echo If GitHub rejected the push because the remote repository
    echo already has files (like a README or License), run:
    echo    git push -u origin main --force
    echo or:
    echo    git pull origin main --allow-unrelated-histories --rebase
    echo    git push -u origin main
    echo ===================================================
)

echo.
pause
