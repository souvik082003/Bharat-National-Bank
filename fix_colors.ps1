$basePath = "c:\Users\souvi\Downloads\Bharat-National-Bank-main\Bharat-National-Bank-main\client\src"
$files = @(
    "$basePath\pages\Dashboard.jsx",
    "$basePath\pages\FundTransfer.jsx",
    "$basePath\pages\PayBills.jsx",
    "$basePath\pages\History.jsx",
    "$basePath\pages\Services.jsx",
    "$basePath\pages\Loans.jsx",
    "$basePath\pages\SIPCalculator.jsx",
    "$basePath\components\Layout\Header.jsx"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $c = [System.IO.File]::ReadAllText($f)
        $c = $c.Replace("indigo-900","orange-900")
        $c = $c.Replace("indigo-800","orange-800")
        $c = $c.Replace("indigo-700","orange-700")
        $c = $c.Replace("indigo-600","orange-600")
        $c = $c.Replace("indigo-500","orange-500")
        $c = $c.Replace("indigo-400","orange-400")
        $c = $c.Replace("indigo-300","orange-300")
        $c = $c.Replace("indigo-200","orange-200")
        $c = $c.Replace("indigo-100","orange-100")
        $c = $c.Replace("indigo-50","orange-50")
        $c = $c.Replace("violet-700","amber-700")
        $c = $c.Replace("violet-600","amber-600")
        $c = $c.Replace("violet-500","amber-500")
        $c = $c.Replace("violet-400","amber-400")
        [System.IO.File]::WriteAllText($f, $c)
        Write-Host "Updated: $f"
    } else {
        Write-Host "NOT FOUND: $f"
    }
}
Write-Host "Done!"
