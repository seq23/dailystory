// ============= CULTURAL LANDMARKS SHARED MODULE =============
// Moved from runware-simple-fallback to prevent duplication

export const CULTURAL_LANDMARKS = {
  spanish: {
    indoor: ["with Spanish tile patterns", "in Mediterranean style interior", "with Spanish cultural elements", "in warm villa setting", "with Spanish decor"],
    outdoor: ["with Spanish villa backdrop", "near Mediterranean courtyard", "with Spanish architecture", "in colorful plaza", "with Spanish garden elements"]
  },
  french: {
    indoor: ["in charming Parisian café", "with French interior design", "in elegant French setting", "with French cultural elements", "in cozy French environment"],
    outdoor: ["near Eiffel Tower", "by Seine River", "near Louvre gardens", "in charming café district", "with Parisian park backdrop"]
  },
  chinese: {
    indoor: ["in Chinese garden pavilion", "with traditional Chinese decor", "in serene tea house", "with Chinese cultural elements", "in elegant Chinese setting"],
    outdoor: ["near Great Wall", "in bamboo garden", "near traditional pagoda", "in cherry blossom park", "with Chinese garden backdrop"]
  },
  japanese: {
    indoor: ["in traditional tatami room", "with Japanese minimalist design", "in serene tea ceremony space", "with Japanese cultural elements", "in peaceful Japanese setting"],
    outdoor: ["near Mount Fuji", "in cherry blossom garden", "near traditional temple", "in peaceful zen garden", "with Japanese landscape backdrop"]
  },
  italian: {
    indoor: ["in cozy Italian trattoria", "with Renaissance art backdrop", "in elegant Italian villa", "with Italian cultural elements", "in warm Italian setting"],
    outdoor: ["near Colosseum", "in Tuscan countryside", "near Vatican gardens", "in charming piazza", "with Italian architecture backdrop"]
  },
  german: {
    indoor: ["in cozy German cottage", "with traditional German decor", "in warm German setting", "with German cultural elements", "in charming German environment"],
    outdoor: ["near Neuschwanstein Castle", "in Black Forest", "near Rhine Valley", "in traditional German village", "with German landscape backdrop"]
  },
  african: {
    indoor: ["in traditional African home", "with vibrant African textiles", "in warm African setting", "with African cultural elements", "in colorful African environment"],
    outdoor: ["with savanna backdrop", "near acacia trees", "in traditional African village", "with African landscape", "near beautiful African scenery"]
  },
  indian: {
    indoor: ["in colorful Indian home", "with traditional Indian decor", "in vibrant Indian setting", "with Indian cultural elements", "in warm Indian environment"],
    outdoor: ["near Taj Mahal", "in spice garden", "near traditional temple", "in bustling Indian market", "with Indian architecture backdrop"]
  },
  mexican: {
    indoor: ["in colorful Mexican home", "with traditional Mexican decor", "in vibrant Mexican setting", "with Mexican cultural elements", "in warm Mexican environment"],
    outdoor: ["near ancient pyramids", "in desert landscape", "near traditional hacienda", "in colorful Mexican plaza", "with Mexican architecture backdrop"]
  },
  brazilian: {
    indoor: ["in vibrant Brazilian home", "with tropical Brazilian decor", "in colorful Brazilian setting", "with Brazilian cultural elements", "in warm Brazilian environment"],
    outdoor: ["near Christ the Redeemer", "in tropical rainforest", "on beautiful Brazilian beach", "in Rio carnival setting", "with Brazilian landscape backdrop"]
  },
  russian: {
    indoor: ["in traditional Russian home", "with Russian folk art", "in cozy Russian setting", "with Russian cultural elements", "in warm Russian environment"],
    outdoor: ["near Red Square", "in snowy Russian landscape", "near traditional Russian church", "in Siberian forest", "with Russian architecture backdrop"]
  },
  korean: {
    indoor: ["in traditional Korean home", "with Korean cultural decor", "in peaceful Korean setting", "with Korean elements", "in harmonious Korean environment"],
    outdoor: ["near Korean palace", "in Korean mountain landscape", "near traditional Korean temple", "in Korean garden", "with Korean architecture backdrop"]
  },
  middle_eastern: {
    indoor: ["in traditional Middle Eastern home", "with Middle Eastern decor", "in ornate Middle Eastern setting", "with cultural elements", "in warm Middle Eastern environment"],
    outdoor: ["near ancient monuments", "in desert oasis", "near traditional architecture", "in Middle Eastern bazaar", "with Middle Eastern landscape backdrop"]
  }
};

export function getCulturalLandmarks(culture, isIndoor = false) {
  const landmarks = CULTURAL_LANDMARKS[culture];
  if (!landmarks) return [];
  
  return isIndoor ? (landmarks.indoor || []) : (landmarks.outdoor || []);
}