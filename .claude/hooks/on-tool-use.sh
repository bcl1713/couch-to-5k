#!/bin/bash

# Claude Code post-tool-use hook to verify component size compliance
# This hook checks if newly generated/modified component files exceed 300 lines

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Maximum allowed lines per component file
MAX_LINES=300

# Check if files were modified (exit if no arguments)
if [ $# -eq 0 ]; then
    exit 0
fi

# Track if any violations were found
VIOLATIONS_FOUND=0

# Process each file argument
for file in "$@"; do
    # Only check TypeScript/TSX component files
    if [[ "$file" != *.ts && "$file" != *.tsx ]]; then
        continue
    fi

    # Skip if file doesn't exist yet
    if [ ! -f "$file" ]; then
        continue
    fi

    # Count non-empty lines, excluding blank lines and comments
    line_count=$(wc -l < "$file" | tr -d ' ')

    # Check if file exceeds limit
    if [ "$line_count" -gt "$MAX_LINES" ]; then
        VIOLATIONS_FOUND=1
        echo -e "${RED}⚠️  Component size violation in $file${NC}"
        echo -e "    Lines: ${RED}$line_count${NC} (limit: ${GREEN}$MAX_LINES${NC})"
        echo -e "    ${YELLOW}Refactor this component to follow SOLID principles${NC}"
        echo -e "    ${YELLOW}Extract logic into custom hooks or utility functions${NC}"
    fi
done

# Exit with error if violations found
if [ $VIOLATIONS_FOUND -eq 1 ]; then
    exit 1
fi

exit 0
