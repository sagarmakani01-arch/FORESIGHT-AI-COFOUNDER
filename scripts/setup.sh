#!/bin/bash
set -e

echo "=========================================="
echo "  GENESIS - Project Setup"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "\n${YELLOW}Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 20+.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}Node.js version must be 20 or higher. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}Node.js $(node -v) ✓${NC}"

# Check npm version
echo -e "\n${YELLOW}Checking npm version...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}npm $(npm -v) ✓${NC}"

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}Dependencies installed ✓${NC}"

# Copy .env.example to .env if not exists
echo -e "\n${YELLOW}Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}.env file created from .env.example ✓${NC}"
    echo -e "${YELLOW}Please update .env with your actual configuration values.${NC}"
else
    echo -e "${GREEN}.env file already exists ✓${NC}"
fi

# Generate Prisma client
echo -e "\n${YELLOW}Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}Prisma client generated ✓${NC}"

# Run database migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
if [ -f .env ]; then
    source .env 2>/dev/null || true
    if [ -n "$DATABASE_URL" ]; then
        npx prisma migrate dev --name init
        echo -e "${GREEN}Database migrations applied ✓${NC}"
    else
        echo -e "${YELLOW}DATABASE_URL not set in .env. Skipping migrations.${NC}"
    fi
else
    echo -e "${YELLOW}.env not found. Skipping migrations.${NC}"
fi

# Seed database
echo -e "\n${YELLOW}Seeding database...${NC}"
if [ -f .env ] && [ -n "$DATABASE_URL" ]; then
    npx tsx scripts/seed.ts
    echo -e "${GREEN}Database seeded ✓${NC}"
else
    echo -e "${YELLOW}Skipping seed (no DATABASE_URL).${NC}"
done

# Print success message
echo -e "\n=========================================="
echo -e "${GREEN}  GENESIS setup completed!${NC}"
echo "=========================================="
echo ""
echo "Available commands:"
echo "  npm run dev        - Start development server"
echo "  npm run build      - Build for production"
echo "  npm run start      - Start production server"
echo "  npm run db:studio  - Open Prisma Studio"
echo "  npm run db:seed    - Re-seed database"
echo ""
echo "To start with Docker:"
echo "  docker compose up"
echo ""
