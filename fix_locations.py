with open("src/pages/Locations.tsx", "r") as f:
    content = f.read()

content = content.replace("""      locs = []; // MOCK_LOCATIONS removed
        ...loc,
        atmosphere: (loc as any).atmosphere || "Mysterious",
        region: (loc as any).region || "Unknown Region"
      }));""", "      locs = [];")

with open("src/pages/Locations.tsx", "w") as f:
    f.write(content)

print("Fixed locs in Locations.tsx")
