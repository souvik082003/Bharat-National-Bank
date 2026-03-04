$basePath = "c:\Users\souvi\Downloads\Bharat-National-Bank-main\Bharat-National-Bank-main\client\src"
$files = @(
    "$basePath\pages\FundTransfer.jsx",
    "$basePath\pages\PayBills.jsx",
    "$basePath\pages\History.jsx",
    "$basePath\pages\Services.jsx",
    "$basePath\pages\Loans.jsx",
    "$basePath\pages\SIPCalculator.jsx"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $c = [System.IO.File]::ReadAllText($f)
        # Fix invisible borders - remove opacity
        $c = $c.Replace("border-slate-200/60", "border-slate-200")
        # Upgrade shadows from sm to visible
        $c = $c.Replace("shadow-sm", "shadow-md")
        # Fix card backgrounds to have solid borders
        $c = $c.Replace("bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden", "bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden")
        $c = $c.Replace("bg-white rounded-2xl border border-slate-200 shadow-md p-5", "bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-5")
        $c = $c.Replace("bg-white rounded-2xl border border-slate-200 shadow-md p-6", "bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6")
        # Style the hero bars with stronger styling
        $c = $c.Replace("indigo-950", "slate-900")
        # Fix focus-ring (might not be defined)
        $c = $c.Replace("focus-ring", "focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500")
        [System.IO.File]::WriteAllText($f, $c)
        Write-Host "Fixed: $f"
    }
}
Write-Host "Done!"
