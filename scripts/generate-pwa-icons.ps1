Add-Type -AssemblyName System.Drawing
$taskPublicPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public'))
$taskImage = [System.Drawing.Image]::FromFile((Join-Path $taskPublicPath 'favicon.png'))
try {
  foreach ($taskIcon in @(
    @{ Name = 'icon-192.png'; Size = 192 },
    @{ Name = 'icon-512.png'; Size = 512 },
    @{ Name = 'icon-boulder.png'; Size = 96 },
    @{ Name = 'icon-strength.png'; Size = 96 }
  )) {
    $taskBitmap = New-Object System.Drawing.Bitmap($taskIcon.Size, $taskIcon.Size)
    $taskGraphics = [System.Drawing.Graphics]::FromImage($taskBitmap)
    try {
      $taskGraphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#0d1117'))
      $taskGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $taskInset = [int]($taskIcon.Size * 0.1)
      $taskGraphics.DrawImage($taskImage, $taskInset, $taskInset,
        $taskIcon.Size - 2 * $taskInset, $taskIcon.Size - 2 * $taskInset)
      $taskBitmap.Save((Join-Path $taskPublicPath $taskIcon.Name), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $taskGraphics.Dispose()
      $taskBitmap.Dispose()
    }
  }
} finally {
  $taskImage.Dispose()
}
