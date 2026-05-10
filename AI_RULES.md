# PulsePoll AI Development Rules

## Tech Stack Overview
- **Frontend Framework**: React 19 with **TanStack Start** for SSR and full-stack capabilities.
- **Routing**: **TanStack Router** for type-safe, file-based routing.
- **State Management**: **TanStack Query** for server state and a custom React Context store for local/auth state.
- **Styling**: **Tailwind CSS v4** using modern CSS variables and utility classes.
- **UI Components**: **Shadcn UI** (Radix UI) for accessible, high-quality base components.
- **Animations**: **Framer Motion** for smooth transitions and interactive UI elements.
- **Data Visualization**: **Recharts** for all poll analytics and trend charts.
- **Backend**: **Node.js** with **Express** for the API layer.
- **Database**: **MongoDB** with **Mongoose** for data modeling and persistence.
- **Real-time**: **Socket.io** for live response streaming and dashboard updates.

## Library Usage Rules
- **Icons**: Always use `lucide-react`. Do not import from other icon libraries.
- **Notifications**: Use `sonner` for all toast messages and user feedback.
- **Charts**: Use `recharts` exclusively for data visualization.
- **Animations**: Prefer `framer-motion` for complex interactions; use Tailwind for simple hover/active states.
- **Validation**: Use `zod` for frontend form validation and backend schema enforcement.
- **Date Handling**: Use `date-fns` for all date formatting and relative time calculations.
- **Styling**: Use the `cn` utility (combining `clsx` and `tailwind-merge`) for all conditional class logic.
- **Components**: Always check `client/src/components/ui/` before creating a new base component. Extend Shadcn UI components rather than rebuilding them.
- **API**: Use the established `sendSuccess` and `sendError` utilities in the backend for consistent response shapes.