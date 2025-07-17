# 📱 CastRadar - Farcaster Activity Tracker

CastRadar is a Next.js miniapp that tracks and displays the most active Farcaster channels and the most liked casts each day.

## 🎯 Features

### 🔥 Today's Trending Channels (Main Page)
- Displays the most active Farcaster channels for today
- Shows channel name, number of casts, and most liked cast
- Each channel displayed in clean white rounded boxes on light purple background

### ❤️ Today's Most Liked Cast Overall
- Shows the single most liked cast of the day across all channels
- Displays likes count, username, and content
- Prominently featured on the main page

### 📆 7-Day Activity History (Secondary Page)
- Historical snapshots for the last 7 days
- Interactive Recharts line graph showing activity trends
- Daily breakdown of top channels and most liked casts
- Automatic cleanup of data older than 7 days

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Supabase** - Database for storing daily snapshots
- **Neynar API** - Farcaster data source
- **Recharts** - Interactive charts for activity visualization
- **dayjs** - Date manipulation and formatting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Neynar API access

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEYNAR_API_KEY=your_neynar_api_key
NEYNAR_CLIENT_ID=your_neynar_client_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
CRON_SECRET=your_cron_secret
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Database Schema

### Supabase Table: `snapshots`

```sql
CREATE TABLE snapshots (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  top_channels JSONB NOT NULL,
  most_liked_cast JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 API Endpoints

### `/api/refresh`
- **Method:** GET
- **Purpose:** Manually trigger data refresh for today
- **Response:** Success message with date

### `/api/cron`
- **Method:** GET
- **Purpose:** Automated daily data collection (requires auth)
- **Headers:** `Authorization: Bearer ${CRON_SECRET}`
- **Response:** Snapshot creation status

## 🎨 UI/UX Features

- **Mobile-first responsive design**
- **Light purple theme** (`bg-purple-100`) throughout
- **White rounded boxes** (`rounded-2xl`) for content containers
- **Hover effects and transitions** for interactive elements
- **Loading animation** with custom radar component
- **Error handling** with user-friendly messages
- **Accessibility** considerations with proper semantic HTML

## 📱 Mobile Optimization

- Responsive design that works on all device sizes
- Touch-friendly interface elements
- Optimized loading states and error messages
- Fast performance with efficient data fetching

## 🔧 Development

### Project Structure

```
├── components/
│   ├── ActivityChart.tsx     # Recharts line graph
│   ├── ChannelBox.tsx        # Channel display component
│   └── LoadingRadar.tsx      # Custom loading animation
├── lib/
│   ├── neynar.ts            # Neynar API integration
│   └── supabase.ts          # Supabase client setup
├── pages/
│   ├── api/
│   │   ├── cron.ts          # Daily data collection
│   │   └── refresh.ts       # Manual data refresh
│   ├── _app.tsx             # App wrapper
│   ├── index.tsx            # Main page
│   └── history.tsx          # History page
└── styles/
    └── globals.css          # Global styles with Tailwind
```

### Build for Production

```bash
npm run build
npm start
```

## 🚀 Deployment

The app is ready to deploy on Vercel, Netlify, or any other Next.js-compatible platform.

1. Connect your repository to your deployment platform
2. Set up environment variables in the platform
3. Deploy!

## 📈 Data Flow

1. **Daily Collection:** The `/api/cron` endpoint fetches trending channels from Neynar
2. **Processing:** For each channel, finds the most liked cast of the day
3. **Storage:** Saves snapshot to Supabase with date, channels, and global most liked cast
4. **Cleanup:** Automatically removes snapshots older than 7 days
5. **Display:** Frontend fetches and displays current and historical data

## 🎯 Key Features Implemented

✅ **Today's trending channels with cast counts**  
✅ **Most liked cast per channel**  
✅ **Global most liked cast of the day**  
✅ **7-day historical data with auto-cleanup**  
✅ **Interactive activity chart**  
✅ **Mobile-responsive design**  
✅ **Error handling and loading states**  
✅ **TypeScript throughout**  
✅ **Clean, modern UI with purple theme**  

## 🔗 External Links

- [Neynar API Documentation](https://docs.neynar.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)