# Toast Notification System

This project uses a centralized toast notification system that provides consistent positioning and styling across the entire application.

## Features

- **Consistent Positioning**: All toasts appear at the top-center of the page
- **Theme Aware**: Automatically adapts to light/dark mode
- **Rich Colors**: Support for different toast types with appropriate colors
- **Close Button**: Users can manually dismiss toasts
- **Auto Dismiss**: Toasts automatically disappear after a set duration
- **Expandable**: Multiple toasts stack nicely

## Usage

Import the toast utility from `@/lib/toast`:

```typescript
import { toast } from "@/lib/toast";
```

### Basic Toast Types

```typescript
// Success toast (green)
toast.success("Operation completed successfully!");

// Error toast (red, longer duration)
toast.error("Something went wrong");

// Warning toast (yellow)
toast.warning("This action cannot be undone");

// Info toast (blue)
toast.info("New feature available");

// Generic message toast
toast.message("Hello world");
```

### Toast with Description

```typescript
toast.success("Changes saved", {
  description: "Your profile has been updated successfully.",
});

toast.error("Failed to save", {
  description: "Please check your internet connection and try again.",
});
```

### Custom Duration

```typescript
// Custom duration (in milliseconds)
toast.success("Quick message", { duration: 1000 });
toast.error("Important error", { duration: 10000 });
```

### Loading Toast

```typescript
// Show loading toast
const loadingToast = toast.loading("Processing your request...");

// Later, dismiss it and show success
toast.dismiss(loadingToast);
toast.success("Request completed!");
```

### Promise Toast

```typescript
const saveData = async () => {
  // Your async operation
  return fetch("/api/save", { method: "POST" });
};

toast.promise(saveData(), {
  loading: "Saving your changes...",
  success: "Changes saved successfully!",
  error: "Failed to save changes",
});
```

### Dismiss Toasts

```typescript
// Dismiss all toasts
toast.dismiss();

// Dismiss specific toast
const toastId = toast.success("Message");
toast.dismiss(toastId);
```

## Configuration

The toast system is pre-configured with:

- **Position**: `top-center`
- **Duration**: 3 seconds (5 seconds for errors)
- **Rich Colors**: Enabled
- **Close Button**: Enabled
- **Expand**: Enabled for multiple toasts

## Styling

Toasts automatically inherit the application's theme colors and adapt to light/dark mode. The styling is consistent with the shadcn/ui design system.

## Examples in the App

- **Theme Toggle**: Shows success toast when theme changes
- **Dashboard**: Quick action buttons demonstrate different toast types
- **Settings**: Toast demo component shows all available toast types

## Best Practices

1. **Use appropriate toast types**: Success for confirmations, error for failures, info for notifications
2. **Keep messages concise**: Use the description field for additional details
3. **Don't overuse**: Avoid showing too many toasts simultaneously
4. **Provide context**: Include relevant information in the description when needed
5. **Handle loading states**: Use loading toasts for async operations
