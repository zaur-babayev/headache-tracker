import { PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

const entries = [
  {
    date: subDays(new Date(), 9),
    severity: 3,
    notes: "Woke up with a mild headache",
    medications: ["ibuprofen"],
    triggers: ["lack-of-sleep", "stress"],
  },
  {
    date: subDays(new Date(), 7),
    severity: 4,
    notes: "Intense pressure on right side",
    medications: ["paracetamol", "ibuprofen"],
    triggers: ["stress"],
  },
  {
    date: subDays(new Date(), 5),
    severity: 2,
    notes: "Slight discomfort in the afternoon",
    medications: ["paracetamol"],
    triggers: ["hunger"],
  },
  {
    date: subDays(new Date(), 4),
    severity: 5,
    notes: "Severe migraine, had to rest in dark room",
    medications: ["ibuprofen", "paracetamol"],
    triggers: ["lack-of-sleep", "stress"],
  },
  {
    date: subDays(new Date(), 3),
    severity: 1,
    notes: "Minor tension headache",
    medications: [],
    triggers: ["too-much-sleep"],
  },
  {
    date: subDays(new Date(), 2),
    severity: 3,
    notes: "Moderate pain, improved with medication",
    medications: ["ibuprofen"],
    triggers: ["hunger", "stress"],
  },
  {
    date: subDays(new Date(), 1),
    severity: 4,
    notes: "Strong headache after work",
    medications: ["paracetamol"],
    triggers: ["stress", "lack-of-sleep"],
  },
  {
    date: new Date(),
    severity: 2,
    notes: "Mild discomfort in the morning",
    medications: ["ibuprofen"],
    triggers: ["too-much-sleep"],
  },
  {
    date: addDays(new Date(), 0),
    severity: 3,
    notes: "Moderate pain throughout the day",
    medications: ["paracetamol"],
    triggers: ["hunger", "stress"],
  },
  {
    date: subDays(new Date(), 6),
    severity: 5,
    notes: "Severe headache with nausea",
    medications: ["ibuprofen", "paracetamol"],
    triggers: ["lack-of-sleep", "stress", "hunger"],
  },
];

async function main() {
  // Clear existing entries
  await prisma.headacheEntry.deleteMany();

  for (const entry of entries) {
    await prisma.headacheEntry.create({
      data: {
        date: entry.date,
        severity: entry.severity,
        notes: entry.notes,
        medications: JSON.stringify(entry.medications),
        triggers: JSON.stringify(entry.triggers),
      },
    });
  }

  console.log('Added 10 dummy entries');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
