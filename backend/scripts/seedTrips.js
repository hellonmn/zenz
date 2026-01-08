const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Trip = require('../models/Trip');

dotenv.config();

const sampleTrips = [
  {
    placeName: "Amber Fort",
    city: "Jaipur",
    country: "India",
    flag: "🇮🇳",
    category: "Historical",
    description: "A magnificent fort with stunning architecture and rich history. Experience the grandeur of Rajputana era.",
    artImg: "/3.png",
    images: [
      "/historic_place.png",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.9,
    reviews: 112,
    duration: "1 day",
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-04-01'),
    price: 49,
    currency: "USD",
    maxParticipants: 50,
    availableSlots: 50,
    status: "active",
    inclusions: [
      { icon: "fi fi-rr-ticket", label: "Entry Ticket", included: true },
      { icon: "fi fi-rr-car", label: "Transportation", included: true },
      { icon: "fi fi-rr-user", label: "Guide", included: true }
    ],
    weather: {
      icon: "fi fi-rr-clouds-sun",
      label: "Sunny",
      temp: 32,
      time: "8:40 AM"
    },
    itinerary: [
      {
        day: 1,
        title: "Amber Fort Tour",
        description: "Full day tour of the magnificent Amber Fort",
        activities: ["Morning pickup", "Fort exploration", "Elephant ride", "Light & Sound show"]
      }
    ],
    highlights: [
      "Sheesh Mahal (Mirror Palace)",
      "Elephant ride to fort entrance",
      "Panoramic views of Maota Lake",
      "Light and Sound show"
    ],
    whatToExpect: "An unforgettable journey through Rajput history and architecture",
    importantInfo: [
      "Valid ID required",
      "Comfortable walking shoes recommended",
      "Photography allowed",
      "Duration: 6-7 hours"
    ],
    cancellationPolicy: "Full refund if cancelled 7+ days before trip date",
    featured: true,
    popular: true
  },
  {
    placeName: "Jantar Mantar",
    city: "Jaipur",
    country: "India",
    flag: "🇮🇳",
    category: "Historical",
    description: "UNESCO World Heritage astronomical observatory built by Maharaja Jai Singh II in 1734.",
    artImg: "/2.png",
    images: [
      "/historic_place.png",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.7,
    reviews: 98,
    duration: "Half day",
    startDate: new Date('2026-04-05'),
    endDate: new Date('2026-04-05'),
    price: 29,
    currency: "USD",
    maxParticipants: 40,
    availableSlots: 40,
    status: "active",
    inclusions: [
      { icon: "fi fi-rr-ticket", label: "Entry Ticket", included: true },
      { icon: "fi fi-rr-user", label: "Guide", included: true }
    ],
    highlights: [
      "World's largest stone sundial",
      "19 astronomical instruments",
      "UNESCO World Heritage Site",
      "Scientific marvel of 18th century"
    ],
    cancellationPolicy: "Full refund if cancelled 5+ days before",
    featured: false,
    popular: true
  },
  {
    placeName: "Golden Temple",
    city: "Amritsar",
    country: "India",
    flag: "🇮🇳",
    category: "Spiritual",
    description: "The holiest Gurdwara of Sikhism, known for its golden dome and serene atmosphere.",
    artImg: "/3.png",
    images: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.9,
    reviews: 215,
    duration: "2 days",
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-05-02'),
    price: 149,
    currency: "USD",
    maxParticipants: 30,
    availableSlots: 30,
    status: "active",
    inclusions: [
      { icon: "fi fi-rr-hotel", label: "Hotel Stay", included: true },
      { icon: "fi fi-rr-restaurant", label: "Meals", included: true },
      { icon: "fi fi-rr-car", label: "Transportation", included: true }
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Golden Temple Visit",
        description: "Visit the Golden Temple and witness the evening ceremony",
        activities: ["Hotel check-in", "Golden Temple visit", "Langar experience", "Evening ceremony"]
      },
      {
        day: 2,
        title: "Wagah Border & Departure",
        description: "Experience the famous border ceremony",
        activities: ["Jallianwala Bagh", "Wagah Border ceremony", "Departure"]
      }
    ],
    highlights: [
      "World's largest community kitchen",
      "24/7 Kirtan (devotional music)",
      "Stunning architecture",
      "Spiritual experience"
    ],
    cancellationPolicy: "Full refund if cancelled 7+ days before",
    featured: true,
    popular: true
  },
  {
    placeName: "Beaches of Goa",
    city: "Goa",
    country: "India",
    flag: "🇮🇳",
    category: "Beaches",
    description: "Experience the pristine beaches, water sports, and vibrant nightlife of Goa.",
    artImg: "/4.png",
    images: [
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.8,
    reviews: 320,
    duration: "5 days",
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-05'),
    price: 499,
    currency: "USD",
    maxParticipants: 25,
    availableSlots: 25,
    status: "active",
    inclusions: [
      { icon: "fi fi-rr-hotel", label: "Beach Resort", included: true },
      { icon: "fi fi-rr-restaurant", label: "Breakfast", included: true },
      { icon: "fi fi-rr-swimmer", label: "Water Sports", included: true },
      { icon: "fi fi-rr-plane", label: "Transfers", included: true }
    ],
    highlights: [
      "Visit famous beaches - Baga, Calangute, Anjuna",
      "Water sports activities",
      "Portuguese heritage tour",
      "Beach parties and nightlife",
      "Spice plantation visit"
    ],
    cancellationPolicy: "50% refund if cancelled 7-14 days before, Full refund if 14+ days",
    featured: true,
    popular: true
  },
  {
    placeName: "Taj Mahal",
    city: "Agra",
    country: "India",
    flag: "🇮🇳",
    category: "Historical",
    description: "One of the Seven Wonders of the World - a symbol of eternal love.",
    artImg: "/3.png",
    images: [
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 5.0,
    reviews: 450,
    duration: "1 day",
    startDate: new Date('2026-04-15'),
    endDate: new Date('2026-04-15'),
    price: 79,
    currency: "USD",
    maxParticipants: 60,
    availableSlots: 60,
    status: "active",
    inclusions: [
      { icon: "fi fi-rr-ticket", label: "Entry Ticket", included: true },
      { icon: "fi fi-rr-car", label: "Transportation", included: true },
      { icon: "fi fi-rr-user", label: "Guide", included: true },
      { icon: "fi fi-rr-restaurant", label: "Lunch", included: true }
    ],
    highlights: [
      "Sunrise view of Taj Mahal",
      "Agra Fort visit",
      "Marble inlay workshop",
      "Local handicrafts shopping"
    ],
    cancellationPolicy: "Full refund if cancelled 3+ days before",
    featured: true,
    popular: true
  },
  {
    placeName: "Backwaters of Kerala",
    city: "Alleppey",
    country: "India",
    flag: "🇮🇳",
    category: "Nature",
    description: "Experience the tranquil backwaters on a traditional houseboat.",
    artImg: "/3.png",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.9,
    reviews: 180,
    duration: "3 days",
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-03'),
    price: 349,
    currency: "USD",
    maxParticipants: 20,
    availableSlots: 20,
    status: "active",
    inclusions: [
      { icon: "fi fi-rr-ship", label: "Houseboat", included: true },
      { icon: "fi fi-rr-restaurant", label: "All Meals", included: true },
      { icon: "fi fi-rr-spa", label: "Ayurvedic Massage", included: true }
    ],
    highlights: [
      "Private houseboat cruise",
      "Traditional Kerala cuisine",
      "Village visits",
      "Ayurvedic spa treatment",
      "Bird watching"
    ],
    cancellationPolicy: "Full refund if cancelled 10+ days before",
    featured: false,
    popular: true
  },
  {
    placeName: "Leh-Ladakh Adventure",
    city: "Leh",
    country: "India",
    flag: "🇮🇳",
    category: "Adventure",
    description: "High altitude adventure through the stunning landscapes of Ladakh.",
    artImg: "/4.png",
    images: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.8,
    reviews: 150,
    duration: "8 days",
    startDate: new Date('2026-06-15'),
    endDate: new Date('2026-06-22'),
    price: 899,
    currency: "USD",
    maxParticipants: 15,
    availableSlots: 15,
    status: "active",
    inclusions: [
      { icon: "fi fi-rr-hotel", label: "Accommodation", included: true },
      { icon: "fi fi-rr-car", label: "SUV Transportation", included: true },
      { icon: "fi fi-rr-restaurant", label: "Meals", included: true },
      { icon: "fi fi-rr-hiking", label: "Trekking Gear", included: true }
    ],
    highlights: [
      "Pangong Lake visit",
      "Nubra Valley desert safari",
      "Magnetic Hill experience",
      "Buddhist monasteries",
      "Khardung La Pass (highest motorable road)"
    ],
    cancellationPolicy: "50% refund if cancelled 15+ days before",
    featured: true,
    popular: true
  },
  {
    placeName: "Varanasi Spiritual Tour",
    city: "Varanasi",
    country: "India",
    flag: "🇮🇳",
    category: "Spiritual",
    description: "Experience the spiritual essence of India's oldest living city.",
    artImg: "/3.png",
    images: [
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
    ],
    rating: 4.6,
    reviews: 87,
    duration: "3 days",
    startDate: new Date('2026-05-10'),
    endDate: new Date('2026-05-12'),
    price: 199,
    currency: "USD",
    maxParticipants: 25,
    availableSlots: 25,
    status: "active",
    inclusions: [
      { icon: "fi fi-rr-hotel", label: "Hotel", included: true },
      { icon: "fi fi-rr-ship", label: "Boat Ride", included: true },
      { icon: "fi fi-rr-restaurant", label: "Breakfast", included: true }
    ],
    highlights: [
      "Ganga Aarti ceremony",
      "Sunrise boat ride",
      "Visit ancient temples",
      "Sarnath Buddhist site",
      "Walking tour of old city"
    ],
    cancellationPolicy: "Full refund if cancelled 7+ days before",
    featured: false,
    popular: true
  }
];

const seedTrips = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Clear existing trips
    await Trip.deleteMany({});
    console.log('Existing trips cleared');

    // Insert sample trips
    const trips = await Trip.insertMany(sampleTrips);
    console.log(`✅ ${trips.length} sample trips created successfully`);
    
    console.log('\nCreated trips:');
    trips.forEach(trip => {
      console.log(`- ${trip.placeName}, ${trip.city} (${trip.category}) - $${trip.price}`);
    });
    
    process.exit();
  } catch (error) {
    console.error('Error seeding trips:', error);
    process.exit(1);
  }
};

seedTrips();