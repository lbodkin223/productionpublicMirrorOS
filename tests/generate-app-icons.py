#!/usr/bin/env python3
"""
iOS App Icon Generator
Converts SVG to all required iOS app icon sizes and creates proper folder structure
"""

import os
import subprocess
import json
from pathlib import Path

# Required iOS app icon sizes (size, scale, idiom, role)
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

def check_dependencies():
    """Check if required tools are installed"""
    try:
        # Try using rsvg-convert (librsvg)
        result = subprocess.run(['rsvg-convert', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            return 'rsvg-convert'
    except FileNotFoundError:
        pass
    
    try:
        # Try using ImageMagick convert
        result = subprocess.run(['convert', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            return 'convert'
    except FileNotFoundError:
        pass
    
    try:
        # Try using Inkscape
        result = subprocess.run(['inkscape', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            return 'inkscape'
    except FileNotFoundError:
        pass
    
    return None

def install_dependencies():
    """Install required dependencies using Homebrew"""
    print("Installing dependencies...")
    try:
        # Install librsvg which includes rsvg-convert
        subprocess.run(['brew', 'install', 'librsvg'], check=True)
        return 'rsvg-convert'
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Could not install dependencies. Please install manually:")
        print("brew install librsvg")
        return None

def convert_svg_to_png(svg_path, output_path, size, converter):
    """Convert SVG to PNG at specified size"""
    try:
        if converter == 'rsvg-convert':
            cmd = [
                'rsvg-convert',
                '-w', str(size),
                '-h', str(size),
                '-o', output_path,
                svg_path
            ]
        elif converter == 'convert':
            cmd = [
                'convert',
                '-background', 'transparent',
                '-size', f'{size}x{size}',
                svg_path,
                output_path
            ]
        elif converter == 'inkscape':
            cmd = [
                'inkscape',
                '--export-png', output_path,
                '--export-width', str(size),
                '--export-height', str(size),
                svg_path
            ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Generated: {output_path} ({size}x{size})")
            return True
        else:
            print(f"❌ Error generating {output_path}: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Exception generating {output_path}: {e}")
        return False

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
    # Get current directory and paths
    current_dir = Path.cwd()
    svg_path = current_dir / "app-icon.svg"
    
    # Check if SVG exists
    if not svg_path.exists():
        print(f"❌ SVG file not found: {svg_path}")
        return
    
    # Check dependencies
    converter = check_dependencies()
    if not converter:
        print("SVG conversion tool not found. Installing...")
        converter = install_dependencies()
        if not converter:
            print("❌ Could not install dependencies. Exiting.")
            return
    
    print(f"Using converter: {converter}")
    
    # Create AppIcon.appiconset directory
    appiconset_dir = current_dir / "AppIcon.appiconset"
    appiconset_dir.mkdir(exist_ok=True)
    
    print(f"\n🎯 Generating iOS app icons in: {appiconset_dir}")
    
    # Generate all required sizes
    success_count = 0
    for icon in IOS_ICON_SIZES:
        output_filename = f"icon-{icon['pixels']}.png"
        output_path = appiconset_dir / output_filename
        
        if convert_svg_to_png(str(svg_path), str(output_path), icon['pixels'], converter):
            success_count += 1
    
    # Create Contents.json
    contents_data = create_contents_json(IOS_ICON_SIZES)
    contents_path = appiconset_dir / "Contents.json"
    
    with open(contents_path, 'w') as f:
        json.dump(contents_data, f, indent=2)
    
    print(f"✅ Generated Contents.json: {contents_path}")
    
    print(f"\n🎉 Successfully generated {success_count}/{len(IOS_ICON_SIZES)} app icons!")
    print(f"📁 App icon set ready at: {appiconset_dir}")
    
    # Instructions
    print("\n📱 INTEGRATION INSTRUCTIONS:")
    print("1. Open your Xcode project")
    print("2. Navigate to your app target settings")
    print("3. Go to the 'General' tab")
    print("4. In the 'App Icons and Launch Screen' section:")
    print(f"   - Drag the entire 'AppIcon.appiconset' folder into the App Icon field")
    print("   - Or manually copy the folder to your project's Assets.xcassets")
    print("5. Build and run your project to see the new icon")
    
    # Additional info
    print(f"\n📊 Generated icon sizes:")
    for icon in IOS_ICON_SIZES:
        print(f"   • {icon['pixels']}x{icon['pixels']} - {icon['idiom']} {icon['size']} @{icon['scale']}")

if __name__ == "__main__":
    main()