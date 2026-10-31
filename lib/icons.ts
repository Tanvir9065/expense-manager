// Category icons: 24x24 line icons drawn with currentColor.
// iconFor() picks one from the category name, so a custom category such as
// "Gym", "Petrol" or "Rent" gets a fitting icon automatically.

export const ICON_PATHS: Record<string, string> = {
  food: '<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Zm0 0v7"/>',
  coffee:
    '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2v3M12 2v3"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.5L22 7H6"/>',
  car: '<path d="M19 17h2a1 1 0 0 0 1-1v-3a2 2 0 0 0-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3a2.5 2.5 0 0 0-1.8-.7H5a1.5 1.5 0 0 0-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4a1 1 0 0 0 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  fuel: '<path d="M4 22V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v17"/><path d="M3 22h12"/><path d="M6 8h6"/><path d="M14 11h2a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V9l-3-3"/>',
  transit:
    '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14"/><path d="M9 21l2-4M15 21l-2-4"/><path d="M9 14h.01M15 14h.01"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
  droplet:
    '<path d="M12 22a7 7 0 0 0 7-7c0-4-7-13-7-13S5 11 5 15a7 7 0 0 0 7 7Z"/>',
  wifi: '<path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M12 20h.01"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  tv: '<rect x="2" y="7" width="20" height="13" rx="2"/><path d="m17 2-5 5-5-5"/>',
  film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>',
  music:
    '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  game: '<path d="M6 11h4M8 9v4"/><path d="M15 12h.01M18 10h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/>',
  health:
    '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/><path d="M3.2 12h4l1.3-2.5 2 5 1.7-2.5h4"/>',
  gym: '<path d="M6.5 6.5v11M17.5 6.5v11"/><path d="M3.5 9v6M20.5 9v6"/><path d="M6.5 12h11"/>',
  school:
    '<path d="M22 10 12 5 2 10l10 5Z"/><path d="M6 12v5c3 2.5 9 2.5 12 0v-5"/><path d="M22 10v6"/>',
  shirt:
    '<path d="M16 3l5 3-2 4-3-1v12H8V9l-3 1-2-4 5-3a4 4 0 0 0 8 0Z"/>',
  scissors:
    '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  paw: '<circle cx="5" cy="11" r="2"/><circle cx="9.5" cy="6" r="2"/><circle cx="14.5" cy="6" r="2"/><circle cx="19" cy="11" r="2"/><path d="M12 12c-3 0-5.5 3-5.5 5.5 0 1.7 1.3 2.5 3 2.5 1 0 1.6-.4 2.5-.4s1.5.4 2.5.4c1.7 0 3-.8 3-2.5C17.5 15 15 12 12 12Z"/>',
  smile:
    '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
  laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
  wrench:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9Z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  bank: '<path d="M3 22h18"/><path d="M6 18v-7M10 18v-7M14 18v-7M18 18v-7"/><path d="M12 2 3 8h18Z"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  wallet:
    '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z"/><path d="M16 14.5h.01"/>',
  money:
    '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  briefcase:
    '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  store:
    '<path d="M3 9 4.5 4h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>',
  receipt:
    '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z"/><circle cx="7.5" cy="7.5" r="1" fill="currentColor"/>',
  repeat:
    '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
};

// Words that point to an icon. Earlier rows win, so specific words come first.
// Words of 3 letters or fewer must match a whole word; longer ones match the start of a word
// ("grocer" matches "groceries"). Includes common Hindi/Hinglish words.
const RULES: [icon: string, words: string[]][] = [
  ["paw", ["pet", "dog", "cat", "vet"]],
  ["smile", ["kid", "child", "baby", "toy", "daycare"]],
  ["cart", ["grocer", "vegetable", "veggie", "fruit", "milk", "kirana", "sabzi", "doodh", "ration", "supermarket", "mart", "bigbasket", "blinkit", "zepto", "instamart"]],
  ["coffee", ["coffee", "tea", "chai", "cafe", "starbucks", "snack", "bakery"]],
  ["food", ["food", "restaurant", "dining", "dinner", "lunch", "breakfast", "meal", "eating", "swiggy", "zomato", "pizza", "burger", "biryani", "tiffin", "canteen", "dhaba", "khana"]],
  ["fuel", ["fuel", "petrol", "diesel", "gas", "cng", "ev", "charging"]],
  ["transit", ["transport", "bus", "metro", "train", "railway", "cab", "taxi", "uber", "ola", "rapido", "auto", "rickshaw", "commute", "fare"]],
  ["car", ["travel", "car", "bike", "scooter", "vehicle", "parking", "toll", "fastag", "driving"]],
  ["pin", ["trip", "holiday", "vacation", "hotel", "stay", "tour", "flight", "airline", "booking", "resort"]],
  ["zap", ["electric", "bijli", "power", "light", "current"]],
  ["droplet", ["water", "laundry", "washing", "dhobi", "paani"]],
  ["wifi", ["internet", "wifi", "broadband", "fiber", "data"]],
  ["phone", ["mobile", "phone", "recharge", "prepaid", "postpaid", "sim", "telecom"]],
  ["tv", ["tv", "netflix", "hotstar", "prime", "ott", "subscription", "cable", "dth", "youtube", "streaming"]],
  ["film", ["movie", "cinema", "film", "theatre", "entertainment", "fun"]],
  ["music", ["music", "spotify", "concert", "song"]],
  ["game", ["game", "gaming", "playstation", "steam", "xbox"]],
  ["health", ["medical", "medicine", "health", "doctor", "hospital", "pharmacy", "dawai", "clinic", "dental", "checkup", "lab", "therapy"]],
  ["gym", ["gym", "fitness", "workout", "yoga", "sport", "cricket", "football", "badminton", "swimming"]],
  ["school", ["school", "college", "education", "fees", "tuition", "course", "book", "stationery", "exam", "study", "class"]],
  ["shirt", ["cloth", "fashion", "apparel", "shoe", "footwear", "dress", "jeans"]],
  ["scissors", ["salon", "haircut", "beauty", "grooming", "parlour", "parlor", "spa", "barber", "makeup"]],
  ["laptop", ["laptop", "computer", "electronic", "gadget", "software", "tech", "hosting", "domain", "cloud", "app"]],
  ["wrench", ["repair", "service", "mechanic", "plumber", "electrician", "fix", "garage"]],
  ["shield", ["insurance", "policy", "premium", "lic"]],
  ["bank", ["loan", "emi", "bank", "credit", "debt"]],
  ["trend", ["invest", "stock", "mutual", "sip", "fd", "saving", "dividend", "interest", "crypto", "share", "gold", "returns"]],
  ["gift", ["gift", "donation", "charity", "present", "birthday", "wedding", "party", "festival", "celebration", "puja"]],
  ["money", ["bonus", "cashback", "refund", "reward", "commission", "incentive", "tips"]],
  ["wallet", ["wallet", "pocket", "allowance", "cash", "atm", "withdrawal"]],
  ["home", ["rent", "kiraya", "home", "house", "furniture", "decor", "appliance", "maintenance", "society", "mortgage"]],
  ["briefcase", ["salary", "payroll", "wages", "stipend", "pension", "job", "work", "office", "freelance", "consulting", "income"]],
  ["bag", ["shopping", "amazon", "flipkart", "myntra", "purchase", "online"]],
  ["store", ["business", "shop", "store", "sales", "sale", "vendor", "customer", "profit"]],
  ["receipt", ["bill", "tax", "gst", "fine", "penalty", "challan", "utility", "utilities", "invoice"]],
  ["box", ["other", "misc", "miscellaneous", "general", "unknown"]],
];

function hasWord(tokens: string[], word: string): boolean {
  return word.length <= 3 ? tokens.includes(word) : tokens.some((t) => t.startsWith(word));
}

// "Gym" -> "gym", "Electricity bill" -> "zap", "Something new" -> "tag"
export function iconFor(name: string): string {
  if (name === "__repeat") return "repeat";
  const tokens = name.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  for (const [icon, words] of RULES) {
    if (words.some((w) => hasWord(tokens, w))) return icon;
  }
  return "tag";
}
