Param(
  [string]$Root = (Join-Path (Split-Path -Parent $PSScriptRoot) "app\src")
)

Write-Host "Scanning for any remaining React.useX…" -ForegroundColor Cyan
$patterns = @('React\.useState','React\.useEffect','React\.useMemo','React\.useCallback','React\.useRef','React\.useReducer','React\.useContext')
$files = Get-ChildItem -Path $Root -Recurse -Include *.ts,*.tsx -File
foreach ($f in $files) {
  $text = Get-Content $f.FullName -Raw
  foreach ($p in $patterns) {
    if ($text -match $p) {
      "{0}`t{1}" -f $f.FullName, $p
    }
  }
}