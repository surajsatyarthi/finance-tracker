from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    img = Image.new('RGB', (size, size), color = '#4f46e5')
    d = ImageDraw.Draw(img)
    
    # Draw a simple "F" or "$" symbol
    # Since we might not have a font, we'll just draw a circle and some lines
    
    # Draw a white circle in the middle
    margin = size // 4
    d.ellipse([margin, margin, size - margin, size - margin], outline="white", width=size//20)
    
    # Draw a text-like shape (e.g. "F")
    # Vertical line
    d.rectangle([size//3, size//3, size//3 + size//10, 2*size//3], fill="white")
    # Top horizontal
    d.rectangle([size//3, size//3, 2*size//3, size//3 + size//10], fill="white")
    # Middle horizontal
    d.rectangle([size//3, size//2, 2*size//3 - size//10, size//2 + size//10], fill="white")

    img.save(filename)
    print(f"Created {filename}")

os.makedirs('public/icons', exist_ok=True)
create_icon(192, 'public/icons/icon-192x192.png')
create_icon(512, 'public/icons/icon-512x512.png')
