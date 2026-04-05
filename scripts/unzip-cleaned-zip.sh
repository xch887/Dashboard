#!/usr/bin/env bash
# Merge ~/Desktop/med-dash-cleaned.zip into this repo (overwrite existing files).
# Usage:
#   ./scripts/unzip-cleaned-zip.sh
#   ZIPFILE=~/Downloads/other.zip ./scripts/unzip-cleaned-zip.sh

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
ZIP="${ZIPFILE:-$HOME/Desktop/med-dash-cleaned.zip}"

if [[ ! -f "$ZIP" ]]; then
  echo "Not found: $ZIP" >&2
  echo "Place med-dash-cleaned.zip on your Desktop, or run:" >&2
  echo "  ZIPFILE=/path/to/file.zip $0" >&2
  exit 1
fi

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

unzip -oq "$ZIP" -d "$TMP"

shopt -s dotglob nullglob
ITEMS=("$TMP"/*)
if [[ ${#ITEMS[@]} -eq 1 && -d "${ITEMS[0]}" ]]; then
  echo "Extracted single top-level folder → merging into: $REPO"
  rsync -a "${ITEMS[0]}/" "$REPO/"
else
  echo "Extracted flat / multiple roots → merging into: $REPO"
  rsync -a "$TMP"/ "$REPO/"
fi

echo "Done. If package-lock changed, run: npm install"
