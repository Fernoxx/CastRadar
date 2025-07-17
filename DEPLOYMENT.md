# 🚀 CastRadar Deployment Guide

## Quick Deployment Checklist

### 1. Database Setup (Supabase)

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Go to the SQL Editor and run this query to create the snapshots table:

```sql
CREATE TABLE snapshots (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  top_channels JSONB NOT NULL,
  most_liked_cast JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add an index for better performance
CREATE INDEX idx_snapshots_date ON snapshots(date DESC);
```

3. Get your Supabase URL and keys from Project Settings > API

### 2. Neynar API Setup

1. Visit [https://neynar.com](https://neynar.com) and create an account
2. Generate an API key from your dashboard
3. Note your Client ID as well

### 3. Environment Variables

Set up the following environment variables in your deployment platform:

```env
NEYNAR_API_KEY=AFBC4ABD-F78C-44A7-AA80-51768CDB8850
NEYNAR_CLIENT_ID=e446c954-8097-4b86-9de9-f986e06cf354
NEXT_PUBLIC_SUPABASE_URL=https://tqwxogsgenszcdglgxvn.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxd3hvZ3NnZW5zemNkZ2xneHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzUzMjcsImV4cCI6MjA2ODExMTMyN30.fRhzqyokOXqUXoLiKkhg4h8zKLu2daD351mqBvuOatU
SUPABASE_URL=https://tqwxogsgenszcdglgxvn.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxd3hvZ3NnZW5zemNkZ2xneHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzUzMjcsImV4cCI6MjA2ODExMTMyN30.fRhzqyokOXqUXoLiKkhg4h8zKLu2daD351mqBvuOatU
CRON_SECRET=your-secure-random-string-here
```

## Deployment Platforms

### Vercel (Recommended)

1. **Connect Repository**
   - Import your repository at [vercel.com](https://vercel.com)
   - Vercel will auto-detect Next.js

2. **Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all the environment variables listed above

3. **Automatic Deployment**
   - The app will build and deploy automatically
   - The `vercel.json` file configures the daily cron job

4. **Cron Job**
   - Vercel will automatically run `/api/cron` daily at midnight UTC
   - No additional setup needed

### Netlify

1. **Connect Repository**
   - Connect your repository at [netlify.com](https://netlify.com)

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all environment variables

4. **Functions**
   - The API routes will automatically work as Netlify Functions

## Post-Deployment Setup

### 1. Initial Data Population

After deployment, manually trigger the first data collection:

```bash
curl https://your-app-url.com/api/refresh
```

### 2. Verify Cron Job (Vercel)

Check that the cron job is working:

```bash
curl -H "Authorization: Bearer your-cron-secret" https://your-app-url.com/api/cron
```

### 3. Test the Application

1. Visit your deployed URL
2. Check that the main page loads
3. Navigate to `/history` to verify the history page
4. Ensure the activity chart displays correctly

## Monitoring & Maintenance

### Database Monitoring

- Check Supabase dashboard for storage usage
- Monitor API usage and limits
- Review error logs in Supabase

### API Limits

- **Neynar**: Check your plan limits
- **Supabase**: Monitor database operations

### Performance

- Use Vercel Analytics to monitor performance
- Check Core Web Vitals in deployment dashboard

## Troubleshooting

### Common Issues

1. **API Errors**
   - Verify Neynar API key is valid
   - Check Supabase connection

2. **Build Failures**
   - Ensure all environment variables are set
   - Check TypeScript errors in build logs

3. **Cron Job Not Running**
   - Verify `CRON_SECRET` is set correctly
   - Check Vercel function logs

4. **Data Not Loading**
   - Run `/api/refresh` manually first
   - Check browser console for errors
   - Verify Supabase table exists

### Support

- Check the GitHub repository for issues
- Review Next.js documentation for framework-specific problems
- Check Supabase docs for database issues

## Security Notes

- The `CRON_SECRET` should be a secure random string
- Never expose service role keys in client-side code
- Use Supabase RLS (Row Level Security) if needed for additional protection

## Performance Optimization

- The app automatically cleans up data older than 7 days
- Consider adding caching for frequently accessed data
- Monitor API response times and optimize queries if needed