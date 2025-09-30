# VATSIM Event Platform

A minimalist no-frills Next.js web application for displaying VATSIM events in a clean, easy-to-use calendar interface.

![Screenshot of the webapp.](https://github.com/oliver-nederal/vatsim-event-calendar/blob/main/apppreview.jpg?raw=true)

## Features

- **Clean Calendar Interface** - Minimalist design with Tailwind CSS
- **Automatic Data Sync** - Fetches events from VATSIM API with 1-hour caching
- **Fast & Responsive** - Built with Next.js 15 and Turbopack
- **Event Details** - Quickly view event details
- **Smart Caching**
- **Mobile Friendly**

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd VATAdria-event-platform
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

## How it Works

### API Integration

- **VATSIM Events API**: Fetches data from `https://my.vatsim.net/api/v2/events/latest`
- **Caching Strategy**: Events are cached for 1 hour to prevent API spam
- **Fallback**: Serves cached data if API is unavailable

### Data Flow

1. Frontend requests events from `/api/events`
2. Backend checks cache validity (1-hour expiry)
3. If cache is stale, fetches fresh data from VATSIM API
4. Processes and returns event data with caching metadata
5. Calendar component renders events with interactive tooltips

### Architecture

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with in-memory caching
- **Types**: Fully typed with TypeScript interfaces
- **State**: React hooks for data fetching and error handling

## Customization

### Styling

- Built with Tailwind CSS
- Modify `src/app/globals.css` for global styles
- Component-specific styles in respective `.tsx` files

### Cache Duration

Update cache duration in `src/app/api/events/route.ts`:

```typescript
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
```

### Event Display

Customize event rendering in `src/components/Calendar.tsx`

## Deployment

- Run `npm run build && npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Built for personal use • Data provided by VATSIM Network
