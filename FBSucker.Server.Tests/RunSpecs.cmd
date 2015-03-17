@echo off

setlocal enabledelayedexpansion

set REL_ROOT="..\NodeFbExpress\"
pushd %REL_ROOT%
set WATCH_ROOT=%CD%
popd
call jasmine-node --color --verbose --autotest --watch "%WATCH_ROOT%\server.js" --test-dir spec

endlocal