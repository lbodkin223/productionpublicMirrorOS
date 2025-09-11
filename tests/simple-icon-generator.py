#!/usr/bin/env python3
"""
Simple iOS App Icon Generator using cairosvg
Creates all required iOS app icon sizes from SVG
"""

import os
import json
from pathlib import Path

# Check if cairosvg is available, install if not
try:
    import cairosvg
except ImportError:
    print("Installing cairosvg...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cairosvg"])
    import cairosvg

# Required iOS app icon sizes
IOS_ICON_SIZES = [
    # iPhone
    {"size": "20x20", "scale": "2x", "idiom": "iphone", "pixels": 40},
    {"size": "20x20", "scale": "3x", "idiom": "iphone", "pixels": 60},
    {"size": "29x29", "scale": "2x", "idiom": "iphone", "pixels": 58},
    {"size": "29x29", "scale": "3x", "idiom": "iphone", "pixels": 87},
    {"size": "40x40", "scale": "2x", "idiom": "iphone", "pixels": 80},
    {"size": "40x40", "scale": "3x", "idiom": "iphone", "pixels": 120},
    {"size": "60x60", "scale": "2x", "idiom": "iphone", "pixels": 120},
    {"size": "60x60", "scale": "3x", "idiom": "iphone", "pixels": 180},
    
    # iPad
    {"size": "20x20", "scale": "1x", "idiom": "ipad", "pixels": 20},
    {"size": "20x20", "scale": "2x", "idiom": "ipad", "pixels": 40},
    {"size": "29x29", "scale": "1x", "idiom": "ipad", "pixels": 29},
    {"size": "29x29", "scale": "2x", "idiom": "ipad", "pixels": 58},
    {"size": "40x40", "scale": "1x", "idiom": "ipad", "pixels": 40},
    {"size": "40x40", "scale": "2x", "idiom": "ipad", "pixels": 80},
    {"size": "76x76", "scale": "1x", "idiom": "ipad", "pixels": 76},
    {"size": "76x76", "scale": "2x", "idiom": "ipad", "pixels": 152},
    {"size": "83.5x83.5", "scale": "2x", "idiom": "ipad", "pixels": 167},
    
    # iOS Marketing
    {"size": "1024x1024", "scale": "1x", "idiom": "ios-marketing", "pixels": 1024}
]

# Create static SVG content (without animations for PNG conversion)
STATIC_SVG_CONTENT = '''<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0D47A1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1565C0;stop-opacity:1" />
    </linearGradient>
    
    <radialGradient id="ballGradient" cx="40%" cy="30%">
      <stop offset="0%" style="stop-color:#E3F2FD;stop-opacity:0.95" />
      <stop offset="70%" style="stop-color:#90CAF9;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#42A5F5;stop-opacity:0.6" />
    </radialGradient>
    
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="shadow">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <rect x="0" y="0" width="1024" height="1024" rx="200" ry="200" fill="url(#bgGradient)"/>
  
  <circle cx="512" cy="460" r="280" fill="url(#ballGradient)" 
          stroke="#FFFFFF" stroke-width="12" 
          filter="url(#shadow)" opacity="0.95"/>
  
  <ellipse cx="420" cy="360" rx="90" ry="140" fill="#FFFFFF" opacity="0.4"/>
  
  <text x="512" y="480" text-anchor="middle" dominant-baseline="middle" 
        font-family="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" 
        font-size="160" font-weight="800" 
        fill="#00E676" filter="url(#textGlow)">67%</text>
  
  <path d="M 120 650 Q 512 550 904 650" 
        stroke="#00E676" stroke-width="20" fill="none" 
        opacity="0.7" stroke-linecap="round"/>
  
  <circle cx="280" cy="280" r="16" fill="#FFC107" opacity="0.9"/>
  <circle cx="744" cy="320" r="14" fill="#FF5722" opacity="0.9"/>
  <circle cx="320" cy="680" r="12" fill="#2196F3" opacity="0.9"/>
  
  <circle cx="512" cy="850" r="8" fill="#00E676" opacity="0.6"/>
</svg>'''

def create_contents_json(icons_data):
    """Create the Contents.json file for AppIcon.appiconset"""
    contents = {
        "images": [],
        "info": {
            "author": "xcode",
            "version": 1
        }
    }
    
    for icon in icons_data:
        image_entry = {
            "filename": f"icon-{icon['pixels']}.png",
            "idiom": icon["idiom"],
            "scale": icon["scale"],
            "size": icon["size"]
        }
        contents["images"].append(image_entry)
    
    return contents

def main():
    current_dir = Path.cwd()
    
    # Create AppIcon.appiconset directory
    appiconset_dir = current_dir / "AppIcon.appiconset"
    appiconset_dir.mkdir(exist_ok=True)
    
    print(f"🎯 Generating iOS app icons in: {appiconset_dir}")
    
    # Generate all required sizes
    success_count = 0
    for icon in IOS_ICON_SIZES:
        output_filename = f"icon-{icon['pixels']}.png"
        output_path = appiconset_dir / output_filename
        
        try:
            # Convert SVG to PNG using cairosvg
            cairosvg.svg2png(
                bytestring=STATIC_SVG_CONTENT.encode('utf-8'),
                write_to=str(output_path),
                output_width=icon['pixels'],
                output_height=icon['pixels']
            )
            print(f"✅ Generated: {output_filename} ({icon['pixels']}x{icon['pixels']})")
            success_count += 1
        except Exception as e:
            print(f"❌ Error generating {output_filename}: {e}")
    
    # Create Contents.json
    contents_data = create_contents_json(IOS_ICON_SIZES)
    contents_path = appiconset_dir / "Contents.json"
    
    with open(contents_path, 'w') as f:
        json.dump(contents_data, f, indent=2)
    
    print(f"✅ Generated Contents.json")
    print(f"\n🎉 Successfully generated {success_count}/{len(IOS_ICON_SIZES)} app icons!")
    
    # Instructions
    print("\n📱 XCODE INTEGRATION INSTRUCTIONS:")
    print("1. Open your Xcode project")
    print("2. In the Project Navigator, find your Assets.xcassets folder")
    print("3. Right-click on Assets.xcassets → Add Files to \"Your App\"")
    print(f"4. Select the entire 'AppIcon.appiconset' folder: {appiconset_dir}")
    print("5. Make sure 'Add to target' is checked for your app target")
    print("6. Click 'Add'")
    print("\nOR manually:")
    print("1. Drag the AppIcon.appiconset folder into Assets.xcassets in Xcode")
    print("2. In your target's General settings, verify the App Icon is set to 'AppIcon'")
    
    print(f"\n📊 Generated icon sizes:")
    for icon in IOS_ICON_SIZES:
        print(f"   • {icon['pixels']}x{icon['pixels']} - {icon['idiom']} {icon['size']} @{icon['scale']}")
    
    print(f"\n📁 Files created:")
    print(f"   • {appiconset_dir}")
    for icon in IOS_ICON_SIZES:
        print(f"   • icon-{icon['pixels']}.png")
    print("   • Contents.json")

if __name__ == "__main__":
    main()