#!/usr/bin/env bash
#
# FFS Astro+Sanity Template — interactive setup
#
# Run after cloning the template. Walks through replacing every {{PLACEHOLDER}}
# in the codebase with values you provide. Skip any prompt by hitting Enter —
# placeholders you don't fill stay as-is so the brand-intake skill can collect
# them later.
#
# Usage:
#   chmod +x template-setup.sh
#   ./template-setup.sh
#
set -e

# Detect macOS vs GNU sed in-place flag
if [[ "$(uname)" == "Darwin" ]]; then
  SED_INPLACE=(-i '')
else
  SED_INPLACE=(-i)
fi

# Helper: prompt for a value, write it into every code/doc file
ask_and_replace() {
  local label="$1"
  local placeholder="$2"
  local default="$3"
  echo ""
  if [[ -n "$default" ]]; then
    read -r -p "  $label [default: $default]: " value
    value="${value:-$default}"
  else
    read -r -p "  $label (skip with Enter): " value
  fi
  if [[ -z "$value" ]]; then
    echo "    ↳ skipped; $placeholder left as-is"
    return
  fi
  echo "    ↳ replacing $placeholder with: $value"
  # Find every text file, do an in-place replace. The grep -l first
  # narrows the find list so we don't waste sed runs.
  grep -rl --include="*.astro" --include="*.ts" --include="*.tsx" \
           --include="*.js" --include="*.mjs" --include="*.json" \
           --include="*.md" --include="*.css" --include="*.html" \
           --include="*.xml" --include="*.txt" --include="*.xsl" \
           --exclude-dir=node_modules --exclude-dir=.git \
           --exclude-dir=.astro --exclude-dir=dist \
           "$placeholder" . 2>/dev/null | while read -r f; do
    # Escape forward slashes and ampersands in the replacement value
    safe="$(printf '%s\n' "$value" | sed -e 's/[\/&]/\\&/g')"
    sed "${SED_INPLACE[@]}" "s/$(echo "$placeholder" | sed -e 's/[\/&]/\\&/g')/$safe/g" "$f"
  done
}

echo ""
echo "=================================================================="
echo "  FFS Astro+Sanity Template — Setup"
echo "=================================================================="
echo ""
echo "  This walks through the most common placeholders. Values you don't"
echo "  have yet — skip with Enter. The astro-sanity-brand-intake skill"
echo "  will collect them during the discovery phase."
echo ""

# --- Brand identity ---
echo ""
echo "BRAND IDENTITY"
ask_and_replace "Brand name (e.g. 'Acme Pest Control')" "{{BRAND_NAME}}"
ask_and_replace "Brand abbreviation (e.g. 'APC')" "{{BRAND_ABBREV}}"
ask_and_replace "Brand abbreviation, lowercase (e.g. 'apc')" "{{BRAND_ABBREV_LOWER}}"
ask_and_replace "Brand slug (e.g. 'acme-pest')" "{{brand_slug}}"

# --- Site identity ---
echo ""
echo "SITE & DOMAIN"
ask_and_replace "Production domain (e.g. 'acmepestcontrol.com')" "{{SITE_DOMAIN}}"
ask_and_replace "Site URL with scheme (e.g. 'https://acmepestcontrol.com')" "{{SITE_URL}}"
ask_and_replace "Vercel preview domain (e.g. 'acme-pest.vercel.app')" "{{VERCEL_PREVIEW_DOMAIN}}"
ask_and_replace "Vercel project slug (e.g. 'acme-pest')" "{{vercel_project_slug}}"
ask_and_replace "Site-domain slug (e.g. 'acmepestcontrol' — no .com)" "{{site_domain_slug}}"

# --- Sanity ---
echo ""
echo "SANITY CMS"
ask_and_replace "Sanity project ID" "{{SANITY_PROJECT_ID}}"

# --- Analytics + tracking ---
echo ""
echo "ANALYTICS & TRACKING (skip if not yet provisioned)"
ask_and_replace "GA4 measurement ID (e.g. 'G-XXXXXXXXXX')" "{{GA4_MEASUREMENT_ID}}"
ask_and_replace "CallRail company ID (numeric)" "{{CALLRAIL_COMPANY_ID}}"
ask_and_replace "CallRail swap key" "{{CALLRAIL_SWAP_KEY}}"

# --- Phones ---
echo ""
echo "PHONE NUMBERS (skip if NAP not finalized)"
ask_and_replace "Primary phone, formatted '(555) 555-5555'" "{{PHONE_PRIMARY_FORMATTED}}"
ask_and_replace "Primary phone, e164 with plus '+15555555555'" "{{PHONE_PRIMARY_E164}}"
ask_and_replace "Primary phone, e164 no plus '15555555555'" "{{PHONE_PRIMARY_E164_NOPLUS}}"
ask_and_replace "Primary phone, dashed '+1-555-555-5555'" "{{PHONE_PRIMARY_DASHED}}"
ask_and_replace "Primary phone, hyphen '555-555-5555'" "{{PHONE_PRIMARY_HYPHEN}}"

echo ""
echo "  Secondary phone (skip if only one service line):"
ask_and_replace "Secondary phone, formatted" "{{PHONE_SECONDARY_FORMATTED}}"
ask_and_replace "Secondary phone, e164 with plus" "{{PHONE_SECONDARY_E164}}"
ask_and_replace "Secondary phone, e164 no plus" "{{PHONE_SECONDARY_E164_NOPLUS}}"
ask_and_replace "Secondary phone, dashed" "{{PHONE_SECONDARY_DASHED}}"
ask_and_replace "Secondary phone, hyphen" "{{PHONE_SECONDARY_HYPHEN}}"

# --- NAP ---
echo ""
echo "ADDRESS & GEO"
ask_and_replace "Street address (e.g. '123 Main St')" "{{NAP_STREET_ADDRESS}}"
ask_and_replace "City" "{{NAP_CITY}}"
ask_and_replace "ZIP/postal code" "{{NAP_ZIP}}"
ask_and_replace "Latitude (decimal)" "{{NAP_LATITUDE}}"
ask_and_replace "Longitude (decimal)" "{{NAP_LONGITUDE}}"

# --- Form webhook ---
echo ""
echo "FORM HANDLER"
ask_and_replace "Automation webhook URL (n8n/Zapier/etc.)" "{{AUTOMATION_WEBHOOK_URL}}"

# --- Cleanup phase ---
echo ""
echo "=================================================================="
echo "  Cleanup"
echo "=================================================================="

# Remove legacy binary assets inherited from the template's source lineage.
# These were kept in the zip because the build sandbox can't delete them;
# they are safe to remove the moment you unzip locally.
echo ""
echo "  Removing legacy template binaries..."
rm -f public/bbbgn-icon.png public/bbbgn-favicon-*.png public/bbbgn-favicon.ico 2>/dev/null
rm -f src/assets/bbbgn_logo.png src/assets/favicon.png 2>/dev/null
rm -f src/assets/heat_tech_logo.png src/assets/heattechfooter_logo.png 2>/dev/null
rm -f public/heat_tech_logo.png public/heattechfooter_logo.png 2>/dev/null
rm -f public/HEATtechpestcontrolsmallicon*.png public/HEATtechpestcontrolsmallicon.webp 2>/dev/null
rm -f public/images/heat_tech_pest_control_heat_treatment_icon.* 2>/dev/null
echo "    done."

# Optionally remove the LOGO_PLACEHOLDER documentation
read -r -p "  Remove TEMPLATE placeholder docs (recommended after setup)? [y/N]: " purge
if [[ "$purge" =~ ^[Yy]$ ]]; then
  rm -f src/assets/bbbgn_logo.png.PLACEHOLDER.md 2>/dev/null
  echo "    placeholder docs removed."
fi

# Show any remaining {{...}} placeholders so the user knows what's left
echo ""
echo "=================================================================="
echo "  Remaining placeholders to fill"
echo "=================================================================="
echo ""
remaining=$(grep -roh "{{[A-Za-z_0-9]\+}}" \
  --include="*.astro" --include="*.ts" --include="*.tsx" \
  --include="*.json" --include="*.md" --include="*.css" \
  --include="*.html" \
  --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null \
  | sort -u)
if [[ -z "$remaining" ]]; then
  echo "  ✅ All placeholders filled."
else
  echo "$remaining" | sed 's/^/    /'
  echo ""
  echo "  These will be collected later by the astro-sanity-brand-intake"
  echo "  skill (when applicable) or by hand."
fi

# Final reminder
echo ""
echo "=================================================================="
echo "  Next steps"
echo "=================================================================="
echo ""
echo "  1. cp .env.example .env"
echo "     # then fill in SANITY_API_TOKEN + TURNSTILE_SECRET_KEY locally"
echo ""
echo "  2. npm install && cd studio && npm install && cd .."
echo ""
echo "  3. npm run dev"
echo ""
echo "  4. In Cowork, kick off brand discovery:"
echo "     \"I'm starting brand discovery for a new client\""
echo ""
echo "  5. When you're ready to deploy, connect this repo to a fresh Vercel"
echo "     project. Add every env var from .env to Vercel → Settings →"
echo "     Environment Variables → Production + Preview + Development."
echo ""
