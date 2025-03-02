# Headache Tracker

A personal web application to track headaches and medications. Built with Next.js and shadcn UI components.

## Features

- Record headache episodes with severity rating (1-5 scale)
- Track medications taken for each headache
- Optional tracking of triggers and notes
- Calendar view to visualize headache patterns
- Statistics dashboard with frequency patterns and medication effectiveness
- Responsive design for both desktop and mobile use

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM (can be changed for production)
- **Charts**: Recharts for data visualization

## Getting Started

First, make sure you have the `.env` file set up with:

```
DATABASE_URL="file:./dev.db"
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deployment

This application can be deployed on Vercel for personal use. The SQLite database can be replaced with a more robust solution like PostgreSQL for production use.

## Future Enhancements

Potential future enhancements could include:
- Weather integration to correlate headaches with weather patterns
- Medication effectiveness tracking
- Export data functionality
- Mobile app version
