# Database Deployment Guide for APS Flooring

## Overview

This document explains how the database persistence is implemented in the APS Flooring application for both development and production environments.

## Understanding Database Configuration

The application uses a PostgreSQL database hosted on Neon.tech. The database connection is configured in two main ways:

1. **Development Environment**: Uses the `DATABASE_URL` from the `.env` file
2. **Production Environment**: Uses PostgreSQL credentials from Replit Secrets

## How Database Persistence Works

When you deploy the application, the following process happens:

1. The server starts and detects if it's running in a production environment
2. If in production, it checks for a `DATABASE_URL` environment variable
3. If not found, it constructs one from the individual PostgreSQL credentials (`PGHOST`, `PGUSER`, etc.)
4. The database connection is established using the constructed URL

## Required Environment Variables

For production, make sure these variables are set in your Replit Secrets:

- `PGHOST` - Database host address
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name
- `PGPORT` (optional, defaults to 5432) - Database port

Alternatively, you can set a single `DATABASE_URL` variable with the complete connection string.

## Deployment Process

1. When deploying, the application will construct the database connection URL if not present
2. The database schema will be automatically maintained between deployments
3. All data entered in production will persist between deployments and restarts

## Troubleshooting

If your database changes aren't persisting between deployments:

1. Check that all PostgreSQL environment variables are set properly in Replit Secrets
2. Verify that the database connection was successful in the startup logs
3. Make sure the database URL is properly constructed in the format:
   `postgresql://username:password@host:port/database?sslmode=require`

## Manually Pushing Database Schema

If you need to manually push database schema changes to production:

1. Make sure the required environment variables are set
2. Run: `node scripts/push-migrations.js`

This will synchronize your database schema with the production database.