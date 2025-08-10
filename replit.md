# Overview

QuickDeliver is a comprehensive food delivery platform built with React, Express, and PostgreSQL. The application serves multiple user types - customers, vendors, drivers, and administrators - with role-based dashboards and functionality. It features real-time order tracking, menu management, driver dispatch, and administrative oversight of the entire platform.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and React Context for authentication
- **Routing**: Wouter for client-side routing with role-based protected routes
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Database ORM**: Drizzle ORM with type-safe schema definitions
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **API Design**: RESTful endpoints with role-based middleware protection

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Core Entities**: 
  - Users (multi-role: customer, vendor, driver, admin)
  - Vendors (restaurant/business information)
  - Menu Items (products with categories and availability)
  - Orders (with status tracking and item details)
  - Drivers (delivery personnel with online status)

## Authentication & Authorization
- **Strategy**: Session-based authentication with encrypted passwords using Node.js crypto.scrypt
- **Role-Based Access**: Middleware functions enforce role permissions (customer, vendor, driver, admin)
- **Session Management**: Secure sessions with PostgreSQL storage and configurable expiration

## Development Environment
- **Build System**: Vite with React plugin and TypeScript support
- **Development Tools**: Hot module replacement, runtime error overlay, and Replit integration
- **Code Quality**: TypeScript strict mode with ESNext modules

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time database connections using ws library

## UI Components
- **Radix UI**: Comprehensive primitive components for accessibility and interaction
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Font Awesome**: Icon library for user interface elements
- **Lucide React**: Additional icon set for modern interface elements

## Development Libraries
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities

## Build and Deployment
- **Vite Plugins**: React support, runtime error handling, and development tooling
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

## Session and Security
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Passport.js**: Authentication middleware with local strategy
- **Node.js Crypto**: Built-in cryptographic functions for password hashing