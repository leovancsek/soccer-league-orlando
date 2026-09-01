export const ROSTER_CONFIG = {
  casual: [
    { key: "dropIns", label: "Drop-in players", sub: "One-off, pay per game", priceKey: "dropInFee", unit: "/game" },
    { key: "monthlyPlayers", label: "Regular players", sub: "Monthly payment, same weekly slot", priceKey: "monthlyFee", unit: "/mo" },
  ],
  league: [
    { key: "leaguePlayers", label: "League players", sub: "Full season roster", priceKey: "leagueFee", unit: "/season" },
    { key: "substitutes", label: "Substitutes", sub: "Fill in for a single match as needed", priceKey: "subFee", unit: "/game" },
  ],
};

export const initialGames = [
  {
    id: 1, format: "5v5", listingType: "casual", title: "Tuesday Night Turf League",
    venue: "Orlando Turf Club", address: "2100 W Colonial Dr, Orlando",
    date: "Tue, Aug 25", time: "20:00", price: "$15", spotsTotal: 10, spotsFilled: 7,
    level: "Intermediate", organizer: { name: "Marcus Webb", rating: 4.8 },
    players: ["MW", "JR", "LC", "JP", "SA", "TN", "KB"],
    dropIns: [], monthlyPlayers: [], leaguePlayers: [], substitutes: [],
    pricing: { dropInFee: "$15", monthlyFee: "$45", leagueFee: "$150", subFee: "$20" },
    image: null,
  },
  {
    id: 2, format: "7v7", listingType: "casual", title: "Sunday Morning Pickup",
    venue: "Blanchard Park Fields", address: "2451 Dean Rd, Orlando",
    date: "Sun, Aug 30", time: "09:30", price: "$12", spotsTotal: 14, spotsFilled: 13,
    level: "All levels", organizer: { name: "Camila Ruiz", rating: 4.9 },
    players: ["CR", "MP", "AG", "FT", "JL", "BQ", "NV", "OS", "PW", "QD", "RE", "SF", "UH"],
    dropIns: [], monthlyPlayers: [], leaguePlayers: [], substitutes: [],
    pricing: { dropInFee: "$12", monthlyFee: "$36", leagueFee: "$150", subFee: "$20" },
    image: null,
  },
  {
    id: 3, format: "11v11", listingType: "league", title: "Full Pitch Friendly",
    venue: "Orlando City Youth Complex", address: "3211 S Econlockhatchee Trail, Orlando",
    date: "Wed, Aug 26", time: "19:00", price: "$18", spotsTotal: 22, spotsFilled: 9,
    level: "Advanced", organizer: { name: "Tom Ibarra", rating: 4.6 },
    players: ["TI", "GH", "MZ", "LK", "VC", "XB", "YN", "QP", "RS"],
    dropIns: [], monthlyPlayers: [], leaguePlayers: [], substitutes: [],
    pricing: { dropInFee: "$18", monthlyFee: "$54", leagueFee: "$150", subFee: "$20" },
    image: null,
  },
  {
    id: 4, format: "5v5", listingType: "casual", title: "Futsal Fridays",
    venue: "Dr. Phillips Community Park", address: "8249 Buenavista Woods Blvd, Orlando",
    date: "Fri, Aug 28", time: "21:00", price: "$10", spotsTotal: 10, spotsFilled: 4,
    level: "Beginner friendly", organizer: { name: "Lucía Méndez", rating: 5.0 },
    players: ["LM", "AC", "BD", "EF"],
    dropIns: [], monthlyPlayers: [], leaguePlayers: [], substitutes: [],
    pricing: { dropInFee: "$10", monthlyFee: "$30", leagueFee: "$150", subFee: "$20" },
    image: null,
  },
  {
    id: 5, format: "7v7", listingType: "casual", title: "Midweek Mixers",
    venue: "Baldwin Park Soccer Fields", address: "4770 New Broad St, Orlando",
    date: "Thu, Aug 27", time: "18:30", price: "$12", spotsTotal: 14, spotsFilled: 14,
    level: "Intermediate", organizer: { name: "Nico Alvarez", rating: 4.7 },
    players: ["NA", "OB", "PC", "QD", "RE", "SF", "TG", "UH", "VI", "WJ", "XK", "YL", "ZM", "AN"],
    dropIns: [], monthlyPlayers: [], leaguePlayers: [], substitutes: [],
    pricing: { dropInFee: "$12", monthlyFee: "$36", leagueFee: "$150", subFee: "$20" },
    image: null,
  },
];

export const initialUsers = [
  { id: 1, name: "Marcus Webb", email: "marcus.webb@email.com", status: "active", joined: "Jan 2024", gamesPlayed: 38 },
  { id: 2, name: "Camila Ruiz", email: "camila.ruiz@email.com", status: "active", joined: "Mar 2024", gamesPlayed: 22 },
  { id: 3, name: "Tom Ibarra", email: "tom.ibarra@email.com", status: "active", joined: "May 2024", gamesPlayed: 15 },
  { id: 4, name: "Lucía Méndez", email: "lucia.mendez@email.com", status: "active", joined: "Feb 2024", gamesPlayed: 41 },
  { id: 5, name: "Nico Alvarez", email: "nico.alvarez@email.com", status: "suspended", joined: "Nov 2023", gamesPlayed: 9 },
];

export const initialFeatures = [
  { id: "booking", icon: "⚽", name: "Game Booking", desc: "Players can browse and book pickup games.", enabled: true },
  { id: "tournaments", icon: "🏆", name: "Tournaments", desc: "Allow organizers to publish tournament brackets.", enabled: true },
  { id: "messaging", icon: "💬", name: "Messaging", desc: "In-app chat between players and organizers.", enabled: true },
  { id: "ratings", icon: "⭐", name: "Player Ratings", desc: "Show skill ratings and post-game reviews.", enabled: true },
  { id: "payments", icon: "💳", name: "In-App Payments", desc: "Charge cards at checkout instead of pay-on-site.", enabled: false },
  { id: "waitlist", icon: "⏳", name: "Waitlists", desc: "Let players join a waitlist when a game is full.", enabled: false },
];

export const initialConversations = [
  {
    id: 1, name: "Diego Fernández", game: "Tuesday Night Turf League", unread: true,
    messages: [
      { from: "them", text: "Hey! Thanks for booking. We kick off at 20:00 sharp, please arrive 10 min early.", time: "10:14" },
      { from: "them", text: "Also — bring a light and dark shirt, we split teams on site.", time: "10:15" },
    ],
  },
  {
    id: 2, name: "Camila Ruiz", game: "Sunday Morning Pickup", unread: false,
    messages: [
      { from: "me", text: "Hi Camila, is there parking near the venue?", time: "Yesterday" },
      { from: "them", text: "Yes, free lot right behind the field entrance 👍", time: "Yesterday" },
    ],
  },
];

export const initialProfile = {
  name: "Mateo Alvarez",
  position: "Midfielder",
  level: "Intermediate",
  city: "Orlando, FL",
  bio: "Playing pickup soccer every week for the last 3 years. Always up for a 5v5 or 7v7.",
  gamesPlayed: 47,
  rating: 4.7,
  wins: 29,
};
