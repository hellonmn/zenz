const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');

const padharoMhareFestData = {
  title: "Padharo Mhare Fest",
  edition: "EDITION 1",
  tagline: "Where Jaipur's soul meets coffee, vibrant stalls, and free-spirited vibe",
  description: "Step into an open-air celebration of art, music, and culture.",

  bannerImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200",
  brochureUrl: "", // Add your brochure URL here

  startDate: new Date("2026-01-17"),
  endDate: new Date("2026-01-18"),

  venue: {
    name: "Aangan Cafe",
    address: "Radhika Vihar, Plot No. 8, near Iskcon Temple, Mansarovar, Jaipur, Rajasthan 302020",
    mapLink: "https://maps.google.com/?q=Aangan+Cafe+Jaipur"
  },

  ticketPrice: 0,
  currency: "INR",

  aboutEvent: `Padharo Mhare Fest is a unique cultural carnival in Jaipur that reimagines Rajasthani heritage with a vibrant, modern twist. Designed as an immersive experience, the event blends the rustic charm of a 'Thaat Bazaar' and interactive Activity Zones—featuring live painting and bangle making—with the electric energy of today's youth culture.

As the sun sets, the atmosphere shifts into a soulful 'Mehfil' centered around a cozy bonfire, jamming sessions, open mic, and live music, creating the perfect fusion space where tradition meets trend for an unforgettable celebration.`,

  aboutOrganizers: `Padharo Mhare Fest is crafted by the dynamic collaboration of Zenzaawara AI Travel Pvt. Ltd. and Nexus of Nerds, seamlessly blending tradition with trend.

While Zenzaawara anchors the event in its mission of promoting experiential travel and preserving heritage—curating the soulful bonfire and mehfil vibes to offer a true cultural journey—Nexus of Nerds injects the pulse of Jaipur's vibrant youth community, bringing modern energy, tech, and pop culture to the forefront.

Together, they create a unique fusion where the warmth of authentic Rajasthani hospitality meets the electric buzz of the next generation.`,

  highlights: [
    {
      title: "The Bonfire & Mehfil",
      description: "As the evening sets in, gather around the fire for acoustic jams and good conversations."
    },
    {
      title: "Activity Zones",
      description: "Witness traditional Bangle Making or get creative with Face Painting."
    },
    {
      title: "Thaat Bazaar",
      description: "A vibrant marketplace for thrift finds and ethnic handicrafts."
    },
    {
      title: "Open Mic Stage",
      description: "Platform for music, comedy, poetry."
    },
    {
      title: "The Vibe",
      description: "Rajasthani warmth + modern fun."
    },
    {
      title: "Workshops",
      description: "Interactive 'Kala' stations with crafts and demos."
    }
  ],

  schedule: [
    {
      day: 1,
      date: "17 JANUARY 2026",
      scheduleItems: [
        {
          time: "11:00 AM",
          title: "Padharo Mhare Fest — Grand Opening Ceremony",
          description: ""
        },
        {
          time: "11:00 AM – 10:00 PM",
          title: "The Royal Haat & Fun Zone",
          description: "Shopping stalls, games, face painting, tattoos, magic show, puppet show"
        },
        {
          time: "Afternoon",
          title: "Karigari & Hasi",
          description: "Live workshops & stand-up comedy"
        },
        {
          time: "Evening",
          title: "Shaam-e-Sangeet",
          description: "Live music concert (Folk & Fusion)"
        },
        {
          time: "Night",
          title: "Alaav & Yaadein",
          description: "Bonfire & acoustic jamming"
        }
      ]
    },
    {
      day: 2,
      date: "18 JANUARY 2026",
      scheduleItems: [
        {
          time: "11:00 AM",
          title: "Naya Savera — Opening ceremony",
          description: ""
        },
        {
          time: "11:00 AM – 10:00 PM",
          title: "Royal Haat & Fun Zone",
          description: "Stalls, games, face painting & tattoos"
        },
        {
          time: "Afternoon",
          title: "Hunar & Khula Manch",
          description: "Workshops & Open Mic (Poetry, Singing, Comedy, Magic, Puppet Show)"
        },
        {
          time: "Evening",
          title: "Sitaron Ki Shaam",
          description: "Celebrity Live Performance"
        },
        {
          time: "Night",
          title: "Alaav & Yaadein",
          description: "Bonfire & acoustic jamming"
        }
      ]
    }
  ],

  organizers: [
    {
      name: "Zenzaawara AI Travel Pvt. Ltd.",
      logo: ""
    },
    {
      name: "Nexus of Nerds",
      logo: ""
    }
  ],

  stallsAvailable: true,
  stallInfo: {
    totalStalls: 15,
    bookedStalls: 0,
    stallTypes: [
      {
        name: "Option A",
        size: "5x5 ft",
        price: 0,
        description: "Best for Artists, Tarot Readers, Small Accessories — includes 2 tables + 1 chair"
      },
      {
        name: "Option B",
        size: "8x5 ft",
        price: 0,
        description: "Best for Clothing, Gaming Zones, Merchandise — includes 2 tables + 1 chair"
      }
    ]
  },

  contactInfo: [
    {
      name: "Chhavi Singhal",
      role: "Stall Coordinator",
      phone: "+91 7879602841",
      email: ""
    }
  ],

  rulesGuidelines: [
    "Payment: 100% advance required",
    "Timings: Report 10 AM, operational 11 AM – 10 PM",
    "Prohibited: Alcohol, tobacco, drugs, hazardous items",
    "Cleanliness: Vendors maintain hygiene; damages chargeable",
    "Management Rights: Stall may be closed for violations, no refund"
  ],

  paymentInfo: {
    accountHolder: "Zenzaawara AI Travel Private Limited",
    upiId: "", // Add UPI ID here
    qrCodeUrl: "" // Add QR code URL here
  },

  status: "published",
  featured: true,
  metaDescription: "Join Padharo Mhare Fest - A unique cultural carnival in Jaipur blending Rajasthani heritage with modern youth culture. Live music, bonfire, workshops, and more!"
};

async function seedEvent() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if event already exists
    const existingEvent = await Event.findOne({ title: "Padharo Mhare Fest" });

    if (existingEvent) {
      console.log('⚠️  Event already exists. Updating...');
      await Event.findByIdAndUpdate(existingEvent._id, padharoMhareFestData);
      console.log('✅ Event updated successfully!');
    } else {
      console.log('Creating new event...');
      const event = await Event.create(padharoMhareFestData);
      console.log('✅ Event created successfully!');
      console.log(`📍 Event slug: ${event.slug}`);
      console.log(`🔗 Access at: /events/${event.slug}`);
    }

    console.log('\n✨ Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding event:', error);
    process.exit(1);
  }
}

seedEvent();
