# PowerShell script to bundle the Websitebot project for Claude

$outputFile = "context_for_claude.md"
$files = @(
    "index.html",
    "dashboard.css",
    "dashboard.js",
    "widget.js",
    "widget-ui.html",
    "widget-ui.css",
    "widget-ui.js"
)

$markdown = @"
# Project Context: Websitebot (Krutrim Karta Chatbot Developer Console & Widget)

You are helping me with the **Websitebot** project, a visual configuration dashboard and embeddable chatbot widget created for Krutrim Karta.

## Project Overview
This project is built using vanilla HTML, CSS, and JavaScript (no heavy frameworks). It consists of two major parts:
1. **Developer Console (Dashboard)**: Allows developers to customize the bot's identity, preset themes, colors, position, greeting messages, and webhook URLs (like n8n). It generates an embed snippet.
2. **Embeddable Chatbot Widget**: A JavaScript wrapper script (`widget.js`) that clients add to their website to inject the chatbot iframe, and the underlying chatbot user interface (`widget-ui.html`, `widget-ui.css`, `widget-ui.js`).

## Directory Structure
- `index.html` - Developer console HTML interface.
- `dashboard.css` - Custom styling for the console.
- `dashboard.js` - Dynamic controls, state management, and embed snippet builder.
- `widget.js` - Loader script included in client websites to load and position the widget.
- `widget-ui.html` - Iframe chat interface HTML.
- `widget-ui.css` - Theme styles for the chatbot UI.
- `widget-ui.js` - Logic for sending/receiving chat messages (integrates with n8n/webhook endpoints).

Here is the source code of the files in the project:
"@

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content -Raw -Path $file
        $ext = [System.IO.Path]::GetExtension($file).Substring(1)
        if ($ext -eq "html") { $lang = "html" }
        elseif ($ext -eq "css") { $lang = "css" }
        elseif ($ext -eq "js") { $lang = "javascript" }
        else { $lang = "" }
        
        $markdown += "`n`n## File: $file`n"
        $markdown += "````$lang`n"
        $markdown += $content
        $markdown += "`n````"
    }
}

$markdown | Out-File -FilePath $outputFile -Encoding utf8
Write-Host "Context file generated successfully: $outputFile"
Write-Host "Open this file, copy its content, and paste it to Claude!"
