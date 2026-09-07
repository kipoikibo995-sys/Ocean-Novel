/**
 * Utility to process uploaded image files (resize and compress to base64)
 * to ensure fast client-side rendering and protect against localStorage quota limits.
 */
export async function fileToOptimizedDataUrl(
  file: File,
  maxWidth = 960,
  maxHeight = 960,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // For SVG or GIF (to preserve animation/vectors), return direct data URL
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => {
        resolve(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const FANTASY_PRESET_PORTRAITS = [
  {
    label: "Young Rogue / Scout",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/05_defiant_young_rogue_portrait_vmydle.webp",
  },
  {
    label: "Elder Druid / Shaman",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/06_elder_druid_of_the_whispering_woods_ki2zso.webp",
  },
  {
    label: "Dwarf Warrior / Guardian",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638037/08_stern_dwarf_warrior_in_braided_armor_bljexb.webp",
  },
  {
    label: "Elven Noble / Diplomat",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/02_enigmatic_woodland_elven_noble_kf6umg.webp",
  },
  {
    label: "Astral Wizard / Archmage",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/03_elderly_wizard_with_astral_amulet_dvtdh5.webp",
  },
  {
    label: "Sun Knight / Paladin",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788638038/04_noble_sun_knight_portrait_iehl2w.webp",
  },
];

export const FANTASY_PRESET_LOCATIONS = [
  {
    label: "Golden Oasis City",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/06_golden_oasis_city_at_sunset_so7xdx.jpg",
  },
  {
    label: "Volcanic Citadel",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/04_volcanic_citadel_at_sunset_yafvd7.jpg",
  },
  {
    label: "Enchanted Woods",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/08_enchanted_forest_of_older_paths_azvbp4.jpg",
  },
  {
    label: "Frostgate Citadel",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/02_frostgate_citadel_in_the_snowstorm_zy2pb8.jpg",
  },
  {
    label: "Stormlit Harbor",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769187/09_stormlit_harbor_of_the_cliffside_citadel_jpisuj.jpg",
  },
  {
    label: "Ruined Emerald Citadel",
    url: "https://res.cloudinary.com/mekoxs1q/image/upload/v1788769186/07_ruined_citadel_beneath_the_green_storm_po3es7.jpg",
  },
];
