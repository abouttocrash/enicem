@echo off
echo All parameters: %1
setlocal

set "filename=dump_%1"
SET BACKUP_DIR="./backups/%filename%"
echo %BACKUP_DIR%
echo The current directory is: %CD%
mongodump  --db "icem" --out "%BACKUP_DIR%"
echo BACKUP COMPLETED AT %DATE% %TIME%