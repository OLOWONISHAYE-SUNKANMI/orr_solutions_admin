# Client Management System

## Overview
The Client Management system provides a comprehensive interface for managing client profiles, portal access, and engagement tracking. It consumes the backend API at `https://orr-backend-web-latest.onrender.com/admin-portal/v1/clients/` and provides a modern, responsive UI for client administration.

## Features

### 🔍 Client Search & Filtering
- **Real-time search** by name, email, or company
- **Advanced filters** by stage, primary pillar, and portal status
- **Clear filter** functionality with active filter indicators

### 👥 Client List Management
- **Responsive client cards** with key information
- **Visual status indicators** for portal access
- **Stage and pillar badges** with color coding
- **Last activity tracking**

### 📋 Detailed Client Information
- **Modal-based client details** for better UX
- **Inline editing** capabilities for client data
- **Portal access toggle** functionality
- **Engagement metrics** (tickets, meetings, documents)
- **Internal notes** management

### 🔄 Real-time Updates
- **Automatic refresh** after actions
- **Error handling** with user-friendly messages
- **Loading states** for better user feedback

## API Integration

### Base Configuration
```typescript
// Environment Variables
NEXT_PUBLIC_API_URL=https://orr-backend-web-latest.onrender.com
NEXT_PUBLIC_CLIENT_MANAGEMENT_URL=https://orr-backend-web-latest.onrender.com/client-management
```

### API Endpoints Used
- `GET /admin-portal/v1/clients/` - List clients with filters
- `GET /admin-portal/v1/clients/{id}/` - Get client details
- `PATCH /admin-portal/v1/clients/{id}/` - Update client data
- `POST /admin-portal/v1/clients/{id}/actions/` - Perform client actions

### Client Service Layer
The `ClientService` class provides a clean abstraction over the API:

```typescript
import { clientService } from '@/app/services/clientService';

// Get clients with filters
const clients = await clientService.getClients({
  stage: 'discover',
  primary_pillar: 'strategic',
  search: 'TechCorp'
});

// Get client details
const client = await clientService.getClientDetails(clientId);

// Toggle portal access
await clientService.togglePortalAccess(clientId);

// Update client
await clientService.updateClient(clientId, updateData);
```

## Component Architecture

### Main Components

#### 1. ClientManagementPage (`/client-management/page.tsx`)
- Main container component
- Manages state and API calls
- Coordinates child components

#### 2. ClientList (`/components/client/ClientList.tsx`)
- Renders the list of clients
- Handles client selection
- Shows loading and empty states

#### 3. ClientFilters (`/components/client/ClientFilters.tsx`)
- Manages filter controls
- Shows active filter indicators
- Provides clear filters functionality

#### 4. ClientDetailsModal (`/components/client/ClientDetailsModal.tsx`)
- Full-screen modal for client details
- Inline editing capabilities
- Action buttons for client management

### Component Props & Interfaces

```typescript
interface ClientListProps {
  clients: ClientListItem[];
  selectedClientId: number | null;
  loading: boolean;
  onClientSelect: (client: ClientListItem) => void;
}

interface ClientFiltersProps {
  filterStage: string;
  filterPillar: string;
  filterPortalStatus: string;
  showFilters: boolean;
  onStageChange: (stage: string) => void;
  onPillarChange: (pillar: string) => void;
  onPortalStatusChange: (status: string) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

interface ClientDetailsModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}
```

## Data Models

### Client Types
```typescript
interface Client {
  id: number;
  full_name: string;
  email: string;
  username: string;
  company: string;
  role: string;
  stage: ClientStage;
  primary_pillar: Pillar;
  secondary_pillars: string;
  assigned_admin_name: string;
  internal_notes: string;
  is_portal_active: boolean;
  last_activity: string;
  date_joined: string;
  last_login: string;
  tickets_count: number;
  meetings_count: number;
  documents_count: number;
}

interface ClientListItem {
  id: number;
  full_name: string;
  email: string;
  company: string;
  role: string;
  stage: ClientStage;
  primary_pillar: Pillar;
  assigned_admin_name: string;
  is_portal_active: boolean;
  last_activity: string;
  created_at: string;
}
```

### Enums
```typescript
enum ClientStage {
  DISCOVER = "discover",
  DIAGNOSE = "diagnose", 
  DESIGN = "design",
  DEPLOY = "deploy",
  GROW = "grow"
}

enum Pillar {
  STRATEGIC = "strategic",
  OPERATIONAL = "operational",
  FINANCIAL = "financial",
  CULTURAL = "cultural"
}
```

## Styling & UI

### Design System
- **Dark theme** with glassmorphism effects
- **Responsive design** for mobile and desktop
- **Consistent spacing** using Tailwind CSS
- **Color-coded badges** for stages and pillars
- **Smooth animations** and transitions

### Color Scheme
```typescript
const stageColors = {
  discover: "bg-blue-500/30 text-blue-300 border-blue-500/30",
  diagnose: "bg-purple-500/30 text-purple-300 border-purple-500/30",
  design: "bg-yellow-500/30 text-yellow-300 border-yellow-500/30",
  deploy: "bg-green-500/30 text-green-300 border-green-500/30",
  grow: "bg-primary/30 text-primary border-primary/30"
};

const pillarColors = {
  strategic: "text-blue-400",
  operational: "text-purple-400", 
  financial: "text-orange-400",
  cultural: "text-green-400"
};
```

## Error Handling

### Client-Side Error Management
- **Try-catch blocks** around all API calls
- **User-friendly error messages**
- **Automatic error dismissal**
- **Fallback UI states**

### Error Display
```typescript
{error && (
  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
    <AlertCircle size={20} />
    <div>
      <p className="font-medium">Error</p>
      <p>{error}</p>
    </div>
    <button onClick={() => setError(null)}>
      <X size={16} />
    </button>
  </div>
)}
```

## Performance Optimizations

### React Optimizations
- **useCallback** for memoized functions
- **Conditional rendering** to avoid unnecessary re-renders
- **Efficient state management**
- **Debounced search** (can be added for better performance)

### API Optimizations
- **Filtered requests** to reduce data transfer
- **Caching strategy** in service layer
- **Error retry logic** (can be implemented)

## Usage Examples

### Basic Client Management
```typescript
// Initialize the page
const ClientManagementPage = () => {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  
  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);
  
  // Handle client selection
  const handleClientClick = (client: ClientListItem) => {
    fetchClientDetails(client.id);
  };
};
```

### Filtering Clients
```typescript
// Apply filters
const filters = {
  stage: 'discover',
  primary_pillar: 'strategic',
  is_portal_active: true,
  search: 'TechCorp'
};

const clients = await clientService.getClients(filters);
```

### Updating Client Data
```typescript
// Update client information
const updateData = {
  company: 'New Company Name',
  role: 'Updated Role',
  stage: 'design',
  internal_notes: 'Updated notes'
};

await clientService.updateClient(clientId, updateData);
```

## Testing

### Manual Testing Checklist
- [ ] Client list loads correctly
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Client details modal opens
- [ ] Client editing works
- [ ] Portal toggle functions
- [ ] Error states display properly
- [ ] Responsive design works on mobile

### API Testing
- [ ] GET /clients/ returns client list
- [ ] GET /clients/{id}/ returns client details
- [ ] PATCH /clients/{id}/ updates client
- [ ] POST /clients/{id}/actions/ performs actions

## Deployment

### Environment Setup
1. Set environment variables in `.env.local`
2. Ensure backend API is running on `https://orr-backend-web-latest.onrender.com`
3. Start frontend development server: `npm run dev`
4. Access client management at `http://localhost:3000/client-management`

### Production Considerations
- Update API URLs for production environment
- Implement proper authentication checks
- Add rate limiting for API calls
- Set up monitoring and logging
- Implement proper error tracking

## Future Enhancements

### Planned Features
- [ ] Bulk client operations
- [ ] Export client data to CSV/PDF
- [ ] Advanced client analytics
- [ ] Client communication history
- [ ] Automated client onboarding
- [ ] Integration with CRM systems

### Performance Improvements
- [ ] Implement virtual scrolling for large client lists
- [ ] Add debounced search
- [ ] Implement client data caching
- [ ] Add offline support
- [ ] Optimize bundle size

## Support

For issues or questions regarding the Client Management system:
1. Check the console for error messages
2. Verify API connectivity
3. Review component props and state
4. Check network requests in browser dev tools
5. Refer to the backend API documentation

## File Structure
```
app/
├── (dashboard)/
│   └── client-management/
│       └── page.tsx                 # Main client management page
├── components/
│   └── client/
│       ├── ClientList.tsx           # Client list component
│       ├── ClientFilters.tsx        # Filter controls
│       └── ClientDetailsModal.tsx   # Client details modal
└── services/
    ├── api.ts                       # Base API functions
    ├── clientService.ts             # Client-specific service
    └── types.ts                     # TypeScript interfaces
```

This implementation provides a robust, scalable client management system that perfectly consumes the backend API while providing an excellent user experience.