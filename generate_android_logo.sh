#!/bin/bash
# VibeLedger Android Logo Generator
# This script creates the VibeLedger app logo in all required Android densities

echo "🎨 Generating VibeLedger Android App Logo..."

# Define colors
PRIMARY_COLOR="#3498db"
SECONDARY_COLOR="#2c3e50"
ACCENT_COLOR="#27ae60"

# Create the base logo SVG
cat > /tmp/vibeledger_logo.svg << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="240" fill="#3498db" stroke="#2c3e50" stroke-width="8"/>
  
  <!-- Inner Circle -->
  <circle cx="256" cy="256" r="180" fill="#ffffff" opacity="0.1"/>
  
  <!-- VL Letter Design -->
  <g transform="translate(256, 256)">
    <!-- V Letter -->
    <path d="M -80 -60 L -40 40 L -20 40 L 20 -60 L 0 -60 L -30 20 L -60 -60 Z" 
          fill="#ffffff" stroke="#2c3e50" stroke-width="2"/>
    
    <!-- L Letter -->
    <path d="M 40 -60 L 40 20 L 80 20 L 80 40 L 20 40 L 20 -60 Z" 
          fill="#ffffff" stroke="#2c3e50" stroke-width="2"/>
  </g>
  
  <!-- Ledger Icon -->
  <g transform="translate(256, 320)">
    <!-- Ledger Lines -->
    <rect x="-60" y="-10" width="120" height="4" fill="#27ae60" opacity="0.8"/>
    <rect x="-60" y="0" width="120" height="4" fill="#27ae60" opacity="0.6"/>
    <rect x="-60" y="10" width="120" height="4" fill="#27ae60" opacity="0.4"/>
  </g>
  
  <!-- Connection Dots -->
  <circle cx="180" cy="180" r="8" fill="#27ae60"/>
  <circle cx="332" cy="180" r="8" fill="#27ae60"/>
  <circle cx="180" cy="332" r="8" fill="#27ae60"/>
  <circle cx="332" cy="332" r="8" fill="#27ae60"/>
  
  <!-- Central Glow -->
  <circle cx="256" cy="256" r="30" fill="#ffffff" opacity="0.3"/>
</svg>
EOF

echo "✅ Base SVG logo created"

# Create Android resource directories if they don't exist
ANDROID_RES="/Users/2271962/Vibe_Project/VibeLedgerApp/android/app/src/main/res"

# Install ImageMagick if not available (for PNG conversion)
if ! command -v convert &> /dev/null; then
    echo "📦 Installing ImageMagick for image conversion..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "❌ Please install ImageMagick manually to generate PNG files"
        exit 1
    fi
fi

echo "🔄 Converting SVG to PNG files for all Android densities..."

# Generate PNG files for all densities
convert /tmp/vibeledger_logo.svg -resize 72x72 "$ANDROID_RES/mipmap-hdpi/ic_launcher.png"
convert /tmp/vibeledger_logo.svg -resize 48x48 "$ANDROID_RES/mipmap-mdpi/ic_launcher.png"
convert /tmp/vibeledger_logo.svg -resize 96x96 "$ANDROID_RES/mipmap-xhdpi/ic_launcher.png"
convert /tmp/vibeledger_logo.svg -resize 144x144 "$ANDROID_RES/mipmap-xxhdpi/ic_launcher.png"
convert /tmp/vibeledger_logo.svg -resize 192x192 "$ANDROID_RES/mipmap-xxxhdpi/ic_launcher.png"

# Generate round versions (same as regular for now)
convert /tmp/vibeledger_logo.svg -resize 72x72 "$ANDROID_RES/mipmap-hdpi/ic_launcher_round.png"
convert /tmp/vibeledger_logo.svg -resize 48x48 "$ANDROID_RES/mipmap-mdpi/ic_launcher_round.png"
convert /tmp/vibeledger_logo.svg -resize 96x96 "$ANDROID_RES/mipmap-xhdpi/ic_launcher_round.png"
convert /tmp/vibeledger_logo.svg -resize 144x144 "$ANDROID_RES/mipmap-xxhdpi/ic_launcher_round.png"
convert /tmp/vibeledger_logo.svg -resize 192x192 "$ANDROID_RES/mipmap-xxxhdpi/ic_launcher_round.png"

echo "✅ Android app icons generated successfully!"
echo "📱 Icons created for densities: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi"
echo "🎯 Logo features: VL monogram, ledger lines, connection dots"
echo "🎨 Colors: Primary Blue (#3498db), Dark Blue (#2c3e50), Green (#27ae60)"

# Clean up
rm /tmp/vibeledger_logo.svg

echo "🚀 VibeLedger Android logo installation complete!"
