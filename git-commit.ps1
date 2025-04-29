Write-Host "Git Commit Helper Script" -ForegroundColor Cyan

# Try to find Git installation
$gitPaths = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Git\cmd\git.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Git\bin\git.exe",
    "C:\Users\$env:USERNAME\scoop\apps\git\current\bin\git.exe"
)

$gitExe = $null
foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $gitExe = $path
        Write-Host "Git found at: $gitExe" -ForegroundColor Green
        break
    }
}

if (-not $gitExe) {
    Write-Host "Git executable not found in common locations. Please make sure Git is installed." -ForegroundColor Red
    exit 1
}

# Function to run Git commands with the found executable
function Run-Git {
    param (
        [string]$command
    )
    
    $result = & $gitExe $command.Split(" ")
    return $result
}

# Function to get changed files
function Get-ChangedFiles {
    try {
        $output = & $gitExe status --porcelain
        return $output
    } catch {
        Write-Host "Error getting changed files: $_" -ForegroundColor Red
        return $null
    }
}

# Function to stage all changes
function Stage-Changes {
    try {
        & $gitExe add .
    } catch {
        Write-Host "Error staging changes: $_" -ForegroundColor Red
    }
}

# Function to commit changes with proper format
function Commit-Changes {
    param (
        [string]$type,
        [string]$title,
        [string]$body
    )
    
    $commitMessage = "$type`: $title`n`n$body`n`n-Agent Generated Commit Message"
    
    # Create a temporary file for the commit message
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $commitMessage
    
    try {
        # Commit with the message from the file
        $result = & $gitExe commit -F "$tempFile"
    } catch {
        Write-Host "Error committing changes: $_" -ForegroundColor Red
        $result = $null
    } finally {
        # Clean up
        Remove-Item -Path $tempFile -ErrorAction SilentlyContinue
    }
    
    return $result
}

# Function to push changes
function Push-Changes {
    try {
        $result = & $gitExe push
        return $result
    } catch {
        Write-Host "Error pushing changes: $_" -ForegroundColor Red
        return $null
    }
}

# Main execution
Write-Host "Checking for changes..." -ForegroundColor Yellow
$changes = Get-ChangedFiles
if (-not $changes) {
    Write-Host "No changes detected to commit." -ForegroundColor Green
    exit 0
}

Write-Host "Changes detected:" -ForegroundColor Green
$changes | ForEach-Object { Write-Host $_ }

Write-Host "`nStaging all changes..." -ForegroundColor Yellow
Stage-Changes

# Get commit details from user
Write-Host "`nCommit Type Options:" -ForegroundColor Cyan
Write-Host "1. feat: new feature"
Write-Host "2. fix: bug fix"
Write-Host "3. docs: documentation changes"
Write-Host "4. style: formatting, missing semi colons, etc"
Write-Host "5. refactor: code restructuring"
Write-Host "6. test: adding tests"
Write-Host "7. chore: maintenance tasks"

$typeNumber = Read-Host "`nSelect commit type (1-7)"
$types = @("feat", "fix", "docs", "style", "refactor", "test", "chore")
if ([int]$typeNumber -ge 1 -and [int]$typeNumber -le 7) {
    $type = $types[[int]$typeNumber - 1]
} else {
    Write-Host "Invalid selection. Using 'chore' as default." -ForegroundColor Yellow
    $type = "chore"
}

$title = Read-Host "Enter brief commit title (max 72 chars)"
$body = Read-Host "Enter detailed description of changes"

Write-Host "`nCommitting changes..." -ForegroundColor Yellow
$commitResult = Commit-Changes -type $type -title $title -body $body
Write-Host $commitResult

$pushPrompt = Read-Host "`nDo you want to push changes? (y/n)"
if ($pushPrompt -eq "y") {
    Write-Host "`nPushing changes..." -ForegroundColor Yellow
    $pushResult = Push-Changes
    Write-Host $pushResult
}

Write-Host "`nDone!" -ForegroundColor Green 