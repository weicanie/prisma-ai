#!/bin/bash
set -e

pnpm --filter backend exec prisma migrate deploy
pnpm --filter backend start:prod
