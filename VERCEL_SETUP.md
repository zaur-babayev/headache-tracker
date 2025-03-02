# Vercel Deployment Setup Guide

## Environment Variables

Make sure to set up the following environment variables in your Vercel project:

### Clerk Authentication

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to the "API Keys" section
4. Find the **Production** keys (not Development)
5. Add these to your Vercel project:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxx
```

### Database Configuration

Ensure your Neon PostgreSQL database is properly connected with these variables:

```
POSTGRES_PRISMA_URL=postgres://user:password@host:port/database?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://user:password@host:port/database?sslmode=require
```

## Troubleshooting

### 500 Errors on API Routes

If you're experiencing 500 errors on API routes:

1. Check Vercel logs for detailed error messages
2. Verify that the database tables are created (check Prisma migrations)
3. Make sure Clerk authentication is properly configured

### Authentication Issues

If users aren't being redirected to the login page:

1. Verify that Clerk environment variables are set correctly
2. Check that you're using production keys, not development keys
3. Ensure the middleware.ts file is properly configured

### Database Connection Issues

If the application can't connect to the database:

1. Verify the connection strings in your environment variables
2. Check that the database is accessible from Vercel's servers
3. Ensure the schema has been properly migrated

## Deployment Checklist

- [ ] Set up Clerk production keys
- [ ] Configure Neon PostgreSQL connection
- [ ] Run Prisma migrations
- [ ] Test authentication flow
- [ ] Verify API routes are working
