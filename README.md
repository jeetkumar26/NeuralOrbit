# Neural Core Dashboard Design

This is a comprehensive multi-page dashboard application built with HTML, CSS, Vanilla JS, and Bootstrap. The original project design is available at [Figma](https://www.figma.com/design/7bWvA4udVMjV4j74biPxzj/Neural-Core-Dashboard-Design).

## Key Features & Recent Updates

### Architecture & Routing
- Multi-page application structure supporting 5 core modules (`NeuralOrbit`, `CRM`, `Marketing`, `Shield`, `Website`).
- Dedicated features for `Admin` vs `User` roles.
- Hash-based routing for in-page tabs.
- Cross-page navigation using `data-module` and `data-role` for isolation.

### Authentication Layer
- Integrated Supabase authentication logic with an automatic mock fallback.
- Default demo credentials:
  - **Admin**: `admin@neuralorbit.ai` / `NeuralAdmin@2025`
  - **User**: `user@neuralorbit.ai` / `NeuralUser@2025`
- Role-based route guarding (`guard.js`) enforcing authenticated access.

### Global Shell (Sidebar & Top Nav)
- **Top Navigation Bar**: 
  - Restored to a precise 3-column CSS Grid (`1fr auto 1fr`).
  - **Left**: Module Breadcrumb (e.g., `NeuralOrbit / Decision Log`).
  - **Center**: Perfectly absolute-centered module tabs (`Overview`, `Decision Log`, `Reward Engine`, `Autonomy`, `Learning`).
  - **Right**: Notifications, Settings, AI ACTIVE chip, and User Avatar.
- **Sidebar**:
  - Global app navigation including modules and Admin Center elements (User Management, Businesses, Analytics, Alert Center).
  - Dynamic AI Operational Status indicator at the bottom left (subdued "AI Active" text and green "All systems operational" text).
  - Quick access to the Global **Design System**.

### Design System Page
- Comprehensive, standalone `design-system.html` page documenting the application's aesthetic.
- Color palettes (Intelligence Blue, Warning Amber, Deep AI Navy, etc.).
- Inter typography scaling and structural spacing grids.
- Live component demos of Status Badges, KPI Cards, Alert Rows, Inputs, Progress Bars, and UI Chips.

## Running the code

1. Run `npm i` to install the dependencies.
2. Run `npm run dev` to start the local development server.
3. Open the application and test login using the demo credentials above.