#!/bin/bash

#
# Protocol Sync Script (Standalone - for non-Node.js projects)
#
# Syncs protocol files from central GitHub repository to local .agent folder
#
# Usage:
#   ./sync-protocols.sh           # Pull latest and sync
#   ./sync-protocols.sh --init    # First-time setup (clone repo)
#
# How it works:
#   1. Clones/pulls from GitHub repo (ralph-protocols)
#   2. Copies all files from cloned repo to .agent folder
#   3. Reports sync status
#
# Prerequisites:
#   - GitHub repo: https://github.com/surajsatyarthi/ralph-protocols
#

set -e  # Exit on error

# Configuration
GITHUB_REPO="https://github.com/surajsatyarthi/ralph-protocols.git"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_CACHE_DIR="$SCRIPT_DIR/.protocol-cache"
TARGET_DIR="$SCRIPT_DIR/.agent"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "$1"
}

clone_or_pull() {
    local is_init=$1

    if [ ! -d "$LOCAL_CACHE_DIR" ]; then
        log "${CYAN}📦 Cloning protocol repository (first time)...${NC}"
        git clone "$GITHUB_REPO" "$LOCAL_CACHE_DIR" 2>&1 | tail -1
        log "${GREEN}✅ Repository cloned successfully${NC}"
    else
        if [ "$is_init" = "true" ]; then
            log "${YELLOW}⚠️  Cache directory already exists. Pulling latest changes...${NC}"
        else
            log "${CYAN}🔄 Pulling latest protocol updates...${NC}"
        fi

        cd "$LOCAL_CACHE_DIR"
        git pull origin main > /dev/null 2>&1
        cd - > /dev/null
        log "${GREEN}✅ Protocols updated from GitHub${NC}"
    fi
}

copy_protocols() {
    log "${CYAN}📋 Syncing protocols to .agent folder...${NC}"

    # Ensure target directory exists
    if [ ! -d "$TARGET_DIR" ]; then
        mkdir -p "$TARGET_DIR"
        log "${GREEN}📁 Created .agent folder${NC}"
    fi

    # Count items before copying
    local copied_count=0

    # Copy all files and folders except .git
    for item in "$LOCAL_CACHE_DIR"/*; do
        local basename=$(basename "$item")

        # Skip .git folder
        if [ "$basename" = ".git" ]; then
            continue
        fi

        # Copy item
        if [ -d "$item" ]; then
            rm -rf "$TARGET_DIR/$basename"
            cp -R "$item" "$TARGET_DIR/"
        else
            cp "$item" "$TARGET_DIR/"
        fi

        ((copied_count++))
    done

    log "${GREEN}✅ Synced $copied_count items to .agent folder${NC}"
}

show_status() {
    log ""
    log "${BOLD}📊 Sync Status:${NC}"

    # Count files in .agent
    local agent_count=$(find "$TARGET_DIR" -type f | wc -l | tr -d ' ')
    log "${CYAN}  Protocol files in .agent: $agent_count${NC}"

    log ""
    log "${BOLD}Key protocols:${NC}"

    # Check key protocols
    local key_protocols=(
        "RALPH_PROTOCOL.md"
        "PM_PROTOCOL.md"
        "COMMUNICATION_PROTOCOL.md"
        "CIRCULAR_ENFORCEMENT.md"
        "SHAREABLE_PROMPTS_GUIDE.md"
    )

    for protocol in "${key_protocols[@]}"; do
        if [ -f "$TARGET_DIR/$protocol" ]; then
            log "${GREEN}  ✅ $protocol${NC}"
        else
            log "${RED}  ❌ $protocol${NC}"
        fi
    done
}

# Main execution
main() {
    local is_init="false"

    if [ "$1" = "--init" ]; then
        is_init="true"
    fi

    log ""
    log "${BOLD}═══════════════════════════════════════════════${NC}"
    log "${BOLD}     PROTOCOL SYNC (Fin Project)${NC}"
    log "${BOLD}═══════════════════════════════════════════════${NC}"
    log ""

    # Step 1: Clone or pull repository
    clone_or_pull "$is_init"

    # Step 2: Copy protocols to .agent
    copy_protocols

    # Step 3: Show status
    show_status

    log ""
    log "${GREEN}═══════════════════════════════════════════════${NC}"
    log "${GREEN}     ✅ SYNC COMPLETE${NC}"
    log "${GREEN}═══════════════════════════════════════════════${NC}"
    log ""

    if [ "$is_init" = "true" ]; then
        log "${CYAN}Next steps:${NC}"
        log "${CYAN}  1. Review synced protocols in .agent folder${NC}"
        log "${CYAN}  2. Run sync periodically: ./sync-protocols.sh${NC}"
    fi
}

main "$@"
