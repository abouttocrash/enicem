@echo off
setlocal

set "currentTime=%TIME%"
set /A "hours=(1%currentTime:~0,2%-100)*360000"
set /A "minutes=(1%currentTime:~3,2%-100)*6000"
set /A "seconds=(1%currentTime:~6,2%-100)*100"
set /A "centiseconds=(1%currentTime:~9,2%-100)"

set /A "totalCentiseconds=hours + minutes + seconds + centiseconds"
set /a "milliseconds=totalCentiseconds * 10"
set "filename=dump_%milliseconds%"
SET BACKUP_DIR="./backups/%filename%"
echo %BACKUP_DIR%
echo The current directory is: %CD%
mongodump  --db "icem" --out "%BACKUP_DIR%"
echo BACKUP COMPLETED AT %DATE% %TIME%