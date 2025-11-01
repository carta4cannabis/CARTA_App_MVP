Param(
  [string]$Root = (Join-Path (Split-Path -Parent $PSScriptRoot) "app\src")
)

Write-Host "Fixing React hooks in" $Root -ForegroundColor Cyan

# Map of React.useX -> useX tokens we will replace
$hookMap = @{
  "useState"    = "React\.useState"
  "useEffect"   = "React\.useEffect"
  "useMemo"     = "React\.useMemo"
  "useCallback" = "React\.useCallback"
  "useRef"      = "React\.useRef"
  "useReducer"  = "React\.useReducer"
  "useContext"  = "React\.useContext"
}

# Order of hook names for the import list
$importOrder = @("useState","useEffect","useMemo","useCallback","useRef","useReducer","useContext")

# Collect .ts/.tsx files
$files = Get-ChildItem -Path $Root -Recurse -Include *.ts,*.tsx -File

$changed = @()
foreach ($f in $files) {
  $text = Get-Content $f.FullName -Raw

  # Quickly skip if no React.useX occurs
  if (-not ($hookMap.Values | Where-Object { $text -match $_ })) {
    continue
  }

  $original = $text

  # (1) Replace React.useX with useX
  foreach ($kv in $hookMap.GetEnumerator()) {
    $name = [regex]::Escape($kv.Key)
    $pattern = $kv.Value
    $text = [regex]::Replace($text, $pattern, $kv.Key)
  }

  # (2) Ensure a proper import from 'react' that contains the needed names (only those used in the file)
  $usedHooks = @()
  foreach ($name in $hookMap.Keys) {
    if ($text -match "(?<!\.)\b$name\b") { $usedHooks += $name }
  }
  $usedHooks = $usedHooks | Select-Object -Unique

  # Regex for import from 'react'
  $rx = [regex]"(?ms)^\s*import\s+(?<default>React|\*\s+as\s+\w+)?\s*(?:,\s*)?(?<named>\{[^}]*\})?\s*from\s*['""]react['""]\s*;?\s*$"

  if ($text -match $rx) {
    $m = $rx.Match($text)
    $defaultPart = $m.Groups["default"].Value
    $namedPart = $m.Groups["named"].Value

    # Parse existing named list
    $existing = @()
    if ($namedPart) {
      $inside = $namedPart.Trim("{}")
      $existing = $inside.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
    }

    # Merge
    $final = @()
    foreach ($key in $importOrder) {
      if ($usedHooks -contains $key -or $existing -contains $key) { $final += $key }
    }
    $final = $final | Select-Object -Unique

    $newImport = "import "
    if ($defaultPart) { $newImport += "$defaultPart" }
    if ($defaultPart -and $final.Count -gt 0) { $newImport += ", " }
    if ($final.Count -gt 0) { $newImport += "{ " + ($final -join ", ") + " } " }
    $newImport += "from 'react';"

    # Replace the first matched react import with the new string
    $text = $rx.Replace($text, $newImport, 1)
  } else {
    # No react import found – add one at the very top with only the used hooks
    if ($usedHooks.Count -gt 0) {
      $list = ($importOrder | Where-Object { $usedHooks -contains $_ })
      $named = ""
      if ($list.Count -gt 0) { $named = "{ " + ($list -join ", ") + " } " }
      $prepend = "import React, $named" + "from 'react';`r`n"
      $text = $prepend + $text
    }
  }

  if ($text -ne $original) {
    Set-Content -Path $f.FullName -Value $text -NoNewline
    $changed += $f.FullName
  }
}

Write-Host "Updated files:" -ForegroundColor Green
$changed | ForEach-Object { Write-Host " - $_" }
Write-Host "Done." -ForegroundColor Green