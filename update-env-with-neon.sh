#!/bin/bash

# Backup the original .env file
cp .env .env.backup

# Neon connection string
NEON_URL="postgresql://neondb_owner:npg_ZV3mD9owWpNG@ep-square-cloud-afy5ur6p-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Update the .env file
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=${NEON_URL}|" .env
sed -i.bak "s|POSTGRES_URL=.*|POSTGRES_URL=${NEON_URL}|" .env
sed -i.bak "s|POSTGRES_URL_NON_POOLING=.*|POSTGRES_URL_NON_POOLING=${NEON_URL}|" .env

echo "✅ .env file updated successfully!"
echo "📁 Backup saved as .env.backup"
