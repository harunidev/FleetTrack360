# FleetTrack360 Frontend

Modern React-based frontend for FleetTrack360 fleet management system.

## Features

- 🚗 **Vehicle Management** - Add, edit, and monitor fleet vehicles
- 🗺️ **Route Tracking** - Track and analyze vehicle routes
- 📊 **Analytics Dashboard** - Comprehensive fleet performance insights
- 🔔 **Notifications** - Real-time alerts and notifications
- 📈 **Reports** - Detailed fleet reports and analytics
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful, intuitive interface with Tailwind CSS

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Beautiful charts and data visualization
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API communication

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- FleetTrack360 API running on http://localhost:5000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Layout.js          # Main layout component
│   ├── pages/
│   │   ├── Dashboard.js       # Dashboard page
│   │   ├── Vehicles.js        # Vehicle management
│   │   ├── Routes.js           # Route tracking
│   │   ├── Reports.js        # Analytics and reports
│   │   └── Notifications.js  # Notifications
│   ├── services/
│   │   └── api.js            # API service layer
│   ├── App.js                # Main app component
│   ├── index.js              # App entry point
│   └── index.css             # Global styles
├── package.json
├── tailwind.config.js
└── README.md
```

## Features Overview

### Dashboard
- Fleet overview with key metrics
- Real-time vehicle status
- Performance charts and analytics
- Recent activity feed

### Vehicle Management
- Add/edit/delete vehicles
- Real-time fuel level monitoring
- Mileage tracking
- Vehicle status indicators

### Route Tracking
- Create and track routes
- Distance and fuel consumption analysis
- Route efficiency metrics
- Historical route data

### Reports & Analytics
- Comprehensive fleet reports
- Fuel efficiency trends
- Vehicle usage statistics
- Performance insights

### Notifications
- Real-time alerts
- Priority-based filtering
- Vehicle-specific notifications
- System status updates

## API Integration

The frontend communicates with the FleetTrack360 API through the service layer in `src/services/api.js`. All API calls are centralized and can be easily modified.

## Styling

The application uses Tailwind CSS for styling with a custom design system:
- Primary colors: Blue palette
- Secondary colors: Gray palette
- Custom components and utilities
- Responsive design patterns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the FleetTrack360 fleet management system.
