Set oShell = CreateObject ("Wscript.Shell")
Dim strArgs
strArgs = "cmd /c text.bat"
oShell.Run strArgs, 0, false