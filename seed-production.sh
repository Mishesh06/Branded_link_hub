#!/bin/bash
# Usage: ATLAS_URI="mongodb+srv://..." bash seed-production.sh
if [ -z "$ATLAS_URI" ]; then
  echo "❌ Set ATLAS_URI first. Example:"
  echo "  ATLAS_URI=\"mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/branded_link_hub?retryWrites=true&w=majority\" bash seed-production.sh"
  exit 1
fi
cd "$(dirname "$0")/server"
MONGODB_URI="$ATLAS_URI" NODE_ENV=development npx ts-node-dev --transpile-only src/seed.ts
