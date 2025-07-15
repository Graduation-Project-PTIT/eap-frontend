# API Layer Documentation

This directory contains the API layer for the EAP Frontend application, built with Axios and TanStack Query following best practices.

## Architecture

The API layer is organized into several key components:

### 1. Client Configuration (`client.ts`)

- **Base URL**: Single API gateway URL with service-specific paths
- **Service Paths**: Different paths for each backend service
- **Interceptors**: Request/response interceptors for authentication and error handling
- **Service Clients**: Pre-configured clients for each service

### 2. Query Client (`query-client.ts`)

- **TanStack Query Configuration**: Default options for queries and mutations
- **Query Keys Factory**: Consistent key generation for cache management
- **Cache Utilities**: Helper functions for cache operations

### 3. Service APIs

Each service has its own API module with:

- **Type Definitions**: TypeScript interfaces for requests/responses
- **API Functions**: Raw API calls using axios
- **React Query Hooks**: Custom hooks for data fetching and mutations

## Services

### File Service (`services/file-service.ts`)

Handles file upload, download, and management operations.

**Key Features:**

- File upload with multipart/form-data
- File listing for authenticated users
- File download and rendering
- User-scoped file access

**API Endpoints:**

- `POST /upload` - Upload file
- `GET /` - List user files
- `GET /:fileId/download` - Download file
- `GET /:fileId/render` - Render file (images/PDFs)

**React Query Hooks:**

- `useUploadFile()` - Upload file mutation
- `useFiles()` - Get file list query
- `useDownloadFile()` - Download file mutation
- `useRenderFile()` - Render file mutation

### Evaluation Service (`services/evaluation-service.ts`)

Integrates with the Mastra evaluation workflow for ERD analysis.

**Key Features:**

- ERD image analysis using AI
- Entity and relationship extraction
- Workflow status tracking
- Real-time progress updates

**API Endpoints:**

- `POST /workflows/evaluationWorkflow/run` - Start evaluation
- `GET /workflows/evaluationWorkflow/runs/:id` - Get evaluation status
- `GET /workflows/evaluationWorkflow/runs` - List evaluations
- `POST /workflows/evaluationWorkflow/runs/:id/cancel` - Cancel evaluation

**React Query Hooks:**

- `useStartEvaluation()` - Start evaluation mutation
- `useEvaluation(id)` - Get evaluation status (auto-refreshing)
- `useEvaluations()` - List evaluations query
- `useCancelEvaluation()` - Cancel evaluation mutation

## Usage

### 1. Setup Query Provider

```tsx
import { QueryProvider } from "@/api/providers/QueryProvider";

function App() {
  return <QueryProvider>{/* Your app components */}</QueryProvider>;
}
```

### 2. Using File Service

```tsx
import { useUploadFile, useFiles } from '@/api';

function FileUploadComponent() {
  const uploadFile = useUploadFile();
  const { data: files, isLoading } = useFiles();

  const handleUpload = (file: File) => {
    uploadFile.mutate({ file });
  };

  return (
    // Your component JSX
  );
}
```

### 3. Using Evaluation Service

```tsx
import { useStartEvaluation, useEvaluation } from '@/api';

function EvaluationComponent() {
  const startEvaluation = useStartEvaluation();
  const [evaluationId, setEvaluationId] = useState<string>();

  const { data: evaluation } = useEvaluation(evaluationId!, !!evaluationId);

  const handleStartEvaluation = (imageUrl: string) => {
    startEvaluation.mutate(
      { erdImage: imageUrl },
      {
        onSuccess: (result) => {
          setEvaluationId(result.id);
        }
      }
    );
  };

  return (
    // Your component JSX
  );
}
```

## Configuration

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
```

### Service Paths

The API gateway routes requests to different services:

- `/api/files/*` → File Service
- `/api/evaluation/*` → Evaluation Service (future)
- `/api/auth/*` → Auth Service (future)
- `/api/user/*` → User Service (future)

## Best Practices

### 1. Error Handling

- All API calls include proper error handling
- Errors are logged in development mode
- User-friendly error messages for common scenarios

### 2. Authentication

- JWT tokens automatically added to requests
- Token refresh handling (when implemented)
- Automatic redirect on authentication failures

### 3. Caching Strategy

- Appropriate stale times for different data types
- Cache invalidation on mutations
- Optimistic updates where applicable

### 4. Performance

- Request/response interceptors for logging
- Retry logic for failed requests
- Proper loading states and error boundaries

## Development Tools

### TanStack Query Devtools

- Available in development mode
- Bottom-right position
- Helps debug query states and cache

### Request Logging

- All requests logged in development
- Includes request/response data
- Color-coded success/error states

## Future Enhancements

1. **Authentication Service**: User login, registration, profile management
2. **User Management Service**: Admin user operations
3. **Real-time Updates**: WebSocket integration for live updates
4. **Offline Support**: Service worker for offline functionality
5. **Request Deduplication**: Prevent duplicate requests
6. **Background Sync**: Queue requests when offline
