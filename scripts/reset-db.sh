#!/bin/bash
set -e

echo "=========================================="
echo "  GENESIS - Database Reset"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Confirmation
echo -e "${RED}WARNING: This will drop ALL tables and data in your database!${NC}"
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Drop all tables
echo -e "\n${YELLOW}Dropping all tables...${NC}"
npx prisma migrate reset --force
echo -e "${GREEN}All tables dropped ✓${NC}"

# Run migrations
echo -e "\n${YELLOW}Running migrations...${NC}"
npx prisma migrate dev --name init
echo -e "${GREEN}Migrations applied ✓${NC}"

# Seed database
echo -e "\n${YELLOW}Seeding database...${NC}"
npx tsx scripts/seed.ts
echo -e "${GREEN}Database seeded ✓${NC}"

echo -e "\n=========================================="
echo -e "${GREEN}  Database reset completed!${NC}"
echo "=========================================="
