;Butter
;Installer Source for NSIS 3.0 or higher

;Enable Unicode encoding
Unicode True

;Include Modern UI
!include "MUI2.nsh"
!include "FileFunc.nsh"


;Check file paths
!if /FILEEXISTS "..\package.json"
    ;File exists!
    !define WIN_PATHS
!else
    ;File does NOT exist!
!endif

;Parse package.json
!ifdef WIN_PATHS
    !searchparse /file "..\package.json" '"version": "' POWDER_VERSION '",'
!else
    !searchparse /file "../package.json" '"version": "' POWDER_VERSION '",'
!endif
!searchreplace POWDER_VERSION_CLEAN "${POWDER_VERSION}" "-" ".0"
!ifdef WIN_PATHS
    !searchparse /file "..\package.json" '"homepage": "' APP_URL '",'
    !searchparse /file "..\package.json" '"name": "' DATA_FOLDER '",'
!else
    !searchparse /file "../package.json" '"homepage": "' APP_URL '",'
    !searchparse /file "../package.json" '"name": "' DATA_FOLDER '",'
!endif

; ------------------- ;
;      Settings       ;
; ------------------- ;
;General Settings

!define COMPANY_NAME "Powder"
!define PRODUCT_VERSION "${POWDER_VERSION}" 
!define APP_NAME "Powder Player"


Name "${APP_NAME}"
Caption "${APP_NAME} ${POWDER_VERSION}"
BrandingText "${APP_NAME} ${POWDER_VERSION}"
VIAddVersionKey "ProductName" "${APP_NAME}"
VIAddVersionKey "ProductVersion" "${POWDER_VERSION}"
VIAddVersionKey "FileDescription" "${APP_NAME} ${POWDER_VERSION} Installer"
VIAddVersionKey "FileVersion" "${POWDER_VERSION}"
VIAddVersionKey "CompanyName" "${COMPANY_NAME}"
VIAddVersionKey "LegalCopyright" "${APP_URL}"
VIProductVersion "${POWDER_VERSION_CLEAN}.0"
!ifdef WIN_PATHS
    OutFile "..\dist\${APP_NAME}-${POWDER_VERSION}-Windows-ia32-Setup.exe"
!else
    OutFile "../dist/${APP_NAME}-${POWDER_VERSION}-Windows-ia32-Setup.exe"
!endif

CRCCheck on
SetCompressor /SOLID lzma

;Default installation folder
InstallDir "$LOCALAPPDATA\${APP_NAME}"

;Request application privileges
RequestExecutionLevel user

!define APP_LAUNCHER "${APP_NAME}.exe"
!define UNINSTALL_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"

; ------------------- ;
;     UI Settings     ;
; ------------------- ;
;Define UI settings
!ifdef WIN_PATHS
    !define MUI_UI_HEADERIMAGE_RIGHT "..\images\POWDER_icon.ico"
    !define MUI_ICON "..\images\POWDER_icon.ico"
    !define MUI_UNICON "..\images\POWDER_icon.ico"
    !define MUI_WELCOMEFINISHPAGE_BITMAP "images\installer-image.bmp"
    !define MUI_UNWELCOMEFINISHPAGE_BITMAP "images\installer-image.bmp"
!else
    !define MUI_UI_HEADERIMAGE_RIGHT "../images/POWDER_icon.ico"
    !define MUI_ICON "../images/POWDER_icon.ico"
    !define MUI_UNICON "../images/POWDER_icon.ico"
    !define MUI_WELCOMEFINISHPAGE_BITMAP "images/installer-image.bmp"
    !define MUI_UNWELCOMEFINISHPAGE_BITMAP "images/installer-image.bmp"
!endif
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_LINK "${APP_URL}"
!define MUI_FINISHPAGE_LINK_LOCATION "${APP_URL}"
!define MUI_FINISHPAGE_RUN "$INSTDIR\Powder Player.exe"
!define MUI_FINISHPAGE_SHOWREADME ""
!define MUI_FINISHPAGE_SHOWREADME_CHECKED
!define MUI_FINISHPAGE_SHOWREADME_TEXT "$(desktopShortcut)"
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION finishpageaction

;Define the pages
!insertmacro MUI_PAGE_WELCOME
!ifdef WIN_PATHS
    !insertmacro MUI_PAGE_LICENSE "..\LICENSE"
!else
    !insertmacro MUI_PAGE_LICENSE "../LICENSE"
!endif
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

;Define uninstall pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

;Load Language Files
!insertmacro MUI_LANGUAGE "English"

; ------------------- ;
;    Localization     ;
; ------------------- ;
LangString removeDataFolder ${LANG_ENGLISH} "Remove all databases and configuration files?"

LangString noRoot ${LANG_ENGLISH} "You cannot install ${APP_NAME} in a directory that requires administrator permissions"

LangString desktopShortcut ${LANG_ENGLISH} "Desktop Shortcut"

; ------------------- ;
;    Check Process    ;
; ------------------- ;
!macro isRunning un
    Function ${un}isRunning
        FindWindow $0 "" "${APP_NAME}"
        StrCmp $0 0 notRunning
        MessageBox MB_YESNO|MB_ICONEXCLAMATION "${APP_NAME} is currently running.$\r$\nDo you want to close it now?" /SD IDYES IDNO userQuit
            SendMessage $0 ${WM_CLOSE} "" "${APP_NAME}"
            ;SendMessage $0 ${WM_DESTROY} "" "${APP_NAME}"
            Goto notRunning
        userQuit:
            Abort
        notRunning:
    FunctionEnd
!macroend
!insertmacro isRunning ""
!insertmacro isRunning "un."

; ------------------- ;
;    Install code     ;
; ------------------- ;
Function .onInit ; check for previous version
    Call isRunning
    ReadRegStr $0 HKCU "${UNINSTALL_KEY}" "InstallString"
    StrCmp $0 "" done
    StrCpy $INSTDIR $0
    done:
FunctionEnd

; ------------------- ;
;      App Files      ;
; ------------------- ;
Section
    ;Set output path to InstallDir
    SetOutPath "$INSTDIR\"

    ;Add the files
    !ifdef WIN_PATHS
        File /r "..\dist\Powder Player-win32-ia32\"
    !endif

    ;Create uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

; ------------------- ;
;      Shortcuts      ;
; ------------------- ;
Section
    ;Working Directory
    SetOutPath "$INSTDIR"

    ;Start Menu Shortcut
    RMDir /r "$SMPROGRAMS\${APP_NAME}"
    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\Powder Player.exe" "" "$INSTDIR\resources\app\images\POWDER_icon.ico" "" "" "" "${APP_NAME} ${POWDER_VERSION}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\resources\app\images\POWDER_icon.ico" "" "" "" "Uninstall ${APP_NAME}"

    ;Desktop Shortcut
    Delete "$DESKTOP\${APP_NAME}.lnk"

    ;Add/remove programs uninstall entry
    ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
    IntFmt $0 "0x%08X" $0
    WriteRegDWORD HKCU "${UNINSTALL_KEY}" "EstimatedSize" "$0"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayName" "${APP_NAME}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayVersion" "${POWDER_VERSION}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "DisplayIcon" "$INSTDIR\resources\app\images\POWDER_icon.ico"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "Publisher" "${COMPANY_NAME}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "InstallString" "$INSTDIR"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "URLInfoAbout" "${APP_URL}"
    WriteRegStr HKCU "${UNINSTALL_KEY}" "HelpLink" "https://discuss.dloa.net"

    ;File association
    WriteRegStr HKCU "Software\Classes\Applications\${APP_LAUNCHER}" "FriendlyAppName" "${APP_NAME}"
    WriteRegStr HKCU "Software\Classes\Applications\${APP_LAUNCHER}\shell\open\command" "" '"$INSTDIR\${APP_LAUNCHER}" "%1"'

    ;Refresh shell icons
    System::Call "shell32::SHChangeNotify(i,i,i,i) (0x08000000, 0x1000, 0, 0)"
SectionEnd

; ------------------- ;
;     Uninstaller     ;
; ------------------- ;
Section "uninstall" 
    Call un.isRunning
    RMDir /r "$INSTDIR"
    RMDir /r "$SMPROGRAMS\${APP_NAME}"
    Delete "$DESKTOP\${APP_NAME}.lnk"
    
    MessageBox MB_YESNO|MB_ICONQUESTION "$(removeDataFolder)" IDNO NoUninstallData
        RMDir /r "$LOCALAPPDATA\${DATA_FOLDER}"
    NoUninstallData:
        DeleteRegKey HKCU "${UNINSTALL_KEY}"
        DeleteRegKey HKCU "Software\Chromium" ;workaround for Chromium leftovers
        DeleteRegKey HKCU "Software\Classes\Applications\${APP_LAUNCHER}" ;file association
SectionEnd

; ------------------- ;
;  Check if writable  ;
; ------------------- ;
Function IsWritable
    !define IsWritable `!insertmacro IsWritableCall`
    !macro IsWritableCall _PATH _RESULT
        Push `${_PATH}`
        Call IsWritable
        Pop ${_RESULT}
    !macroend
    Exch $R0
    Push $R1
    start:
        StrLen $R1 $R0
        StrCmp $R1 0 exit
        ${GetFileAttributes} $R0 "DIRECTORY" $R1
        StrCmp $R1 1 direxists
        ${GetParent} $R0 $R0
        Goto start
    direxists:
        ${GetFileAttributes} $R0 "DIRECTORY" $R1
        StrCmp $R1 0 ok
        StrCmp $R0 $PROGRAMFILES64 notok
        StrCmp $R0 $WINDIR notok
        ${GetFileAttributes} $R0 "READONLY" $R1
        Goto exit
    notok:
        StrCpy $R1 1
        Goto exit
    ok:
        StrCpy $R1 0
    exit:
        Exch
        Pop $R0
        Exch $R1
FunctionEnd

; ------------------- ;
;  Check install dir  ;
; ------------------- ;
Function CloseBrowseForFolderDialog
    !ifmacrodef "_P<>" ; NSIS 3+
        System::Call 'USER32::GetActiveWindow()p.r0'
        ${If} $0 P<> $HwndParent
    !else
        System::Call 'USER32::GetActiveWindow()i.r0'
        ${If} $0 <> $HwndParent
    !endif
        SendMessage $0 ${WM_CLOSE} 0 0
        ${EndIf}
FunctionEnd

Function .onVerifyInstDir
    Push $R1
    ${IsWritable} $INSTDIR $R1
    IntCmp $R1 0 pathgood
    Pop $R1
    Call CloseBrowseForFolderDialog
    MessageBox MB_OK|MB_USERICON "$(noRoot)"
        Abort
    pathgood:
        Pop $R1
FunctionEnd

; ------------------ ;
;  Desktop Shortcut  ;
; ------------------ ;
Function finishpageaction
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\Powder Player.exe" "" "$INSTDIR\resources\app\images\POWDER_icon.ico" "" "" "" "${APP_NAME} ${POWDER_VERSION}"
FunctionEnd
