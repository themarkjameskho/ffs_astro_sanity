# Content Writer Guide
## Heat Tech Pest Control - Sanity CMS Content Creation

Welcome! This guide explains how to create and manage page content in our Sanity CMS. All pages are built from modular **sections** that you can mix-and-match to create unique landing pages and blog posts.

---

## Table of Contents
1. [Page Creation Basics](#page-creation-basics)
2. [Section Types & Structure](#section-types--structure)
3. [Hero Section (The Master Rule)](#hero-section-the-master-rule)
4. [All Other Section Types](#all-other-section-types)
5. [Blog Post Creation](#blog-post-creation)
6. [SEO Best Practices](#seo-best-practices)
7. [Common Mistakes](#common-mistakes)

---

## Page Creation Basics

### What is a "Page"?
A page is a container for multiple sections. Think of it like stacking building blocks:
- **Top block** = Hero Section (always first)
- **Middle blocks** = ServiceGrid, TwoColImage, IconGrid, etc.
- **Bottom blocks** = CTA Section or Contact Form

Pages have three main parts:

#### 1. **Page Information** (SEO + Metadata)
- **Title**: Internal name + page title (e.g., "Bed Bug Treatment Services")
- **Slug**: URL path without a leading slash (e.g., `bed-bug-treatment` or `service-area/tulsa/tulsa-bed-bug-heat-treatment`)
- **Page Type**: Home, Pest Control, Contact, etc.
- **SEO Fields**: Meta description, OG image, schema code

#### 2. **SEO Settings** (Search Engine Optimization)
- **SEO Title**: ≤60 characters (appears in Google search results)
- **SEO Description**: ≤160 characters (preview text in search)
- **Canonical URL**: Usually auto-generated (leave blank)
- **Open Graph Image**: 1200x630px for social sharing
- **Schema Code**: Advanced structured data (optional)

#### 3. **Page Sections** (The Content Stack)
Drag and drop sections into the exact order they appear on the site.

---

## Section Types & Structure

### Available Sections
1. **Hero Section** ⭐ (Must be first)
2. **Service Grid Section** (Cards showing services)
3. **Icon Grid Section** (Features with icons)
4. **Two Column Text+Image** (Text on left, image on right)
5. **Service Area Section** (Location showcase)
6. **CTA Section** (Call-to-action with headline)
7. **Contact Section** (Contact form block)
8. **Lead Form Section** (Lead capture form)
9. **Blog List Section** (Shows recent blog posts)
10. **HTML Section** (Raw HTML for custom content)

### General Section Rules (ALL except Hero)
For **every other section**, the structure is:
1. **Title** (usually acts as H1 or H2)
2. **Description/Body** (optional supporting text)
3. **Items/Cards** (if applicable)
4. **CTA** (optional call-to-action)

✅ **You CAN add description AND body** after the title.
✅ **You CAN add content after the CTA** if needed.

---

## Hero Section (The Master Rule) 🚨

### ⚠️ CRITICAL: The Hero Section is Special

The Hero Section follows a **strict structure** that cannot be deviated from:

```
┌──────────────────────────────────────────────────┐
│          HERO SECTION STRUCTURE                  │
├──────────────────────────────────────────────────┤
│  1. TITLE & HIGHLIGHT TEXT                      │
│     Title: "Main Headline Here"                  │  → Acts as H1
│     Highlighted: "Headline Here" (key word)      │  → Blue/branded color
│                                                  │
│  2. SUBTITLE (Supporting Text Only)             │
│     "Short supporting copy here..."              │  → NOT an H2
│                                                  │  → 1-2 sentences max
│                                                  │
│  3. BULLETS/VALUE PROPS (Optional)              │
│     ✓ Fast same-day service                     │  → Max 8 bullets
│     ✓ EPA-registered treatments                 │  → With checkmark icons
│     ✓ 15+ years local expertise                 │
│                                                  │
│  4. CTA BLOCK (Optional but Recommended)        │
│     ┌────────────────────────────────┐          │
│     │ CTA Text (Optional Subtitle)   │ ← Above  │  Can be above or below
│     │ [Primary Button] [Secondary]   │          │
│     │ CTA Text (Optional Subtitle)   │ ← Below  │
│     └────────────────────────────────┘          │
│                                                  │
│  5. BACKGROUND IMAGE (Optional)                 │
│     Full-bleed background behind everything     │  → Must have alt text
│                                                  │
│  6. RIGHT COLUMN - Two Column Only (Optional)  │
│     ┌──────────────────────────────┐           │
│     │ [Right Column Image]         │ ← Option 1 │ Choose ONE:
│     │ OR                            │           │ - Image with subtitle
│     │ [Map Embed]                   │ ← Option 2 │ - Google Map
│     │ OR                            │           │ - Short text
│     │ [Right Column Subtitle Text]  │ ← Option 3 │
│     └──────────────────────────────┘           │
│                                                  │
└──────────────────────────────────────────────────┘
         ⛔ NOTHING GOES AFTER CTA
         ⛔ NO BODY TEXT AFTER CTA
         ⛔ NO DESCRIPTION AFTER CTA
```

### Hero Section Field Breakdown

| Field | Purpose | Notes |
|-------|---------|-------|
| **Title** | Main headline | Your H1 tag. Appears large at top. |
| **Highlighted Text** | Key phrase emphasis | Portion of title shown in brand color. |
| **Subtitle** | Supporting copy | 1-2 sentences max. NOT an H2. |
| **Body** | Rich text (⛔ Avoid!) | If used, appears before bullets. CONSIDER REMOVING. |
| **Bullets** | Value props | Checkmark-style items. Max 8. "Fast Service", "Licensed", etc. |
| **CTA Text** | Button subtitle | Small text above/below button (e.g., "No credit card required"). |
| **CTA Text Placement** | Where subtitle appears | **Above**: Text sits above button. **Below**: Text sits under button. |
| **CTA Subtitle Heading Level** | Semantic HTML | **H2** or **H3** - choose based on page hierarchy. |
| **Primary CTA Label** | Main button text | "Schedule Service", "Get Quote", "Call Now", etc. |
| **Primary CTA Link** | Main button destination | URL (e.g., `/contact-us`), tel: (e.g., `tel:19184167098`), or mailto: |
| **Secondary CTA Label** | Optional 2nd button | For alternate actions (e.g., "View Services"). |
| **Secondary CTA Link** | 2nd button destination | URL, tel:, or mailto: link. |
| **Background Image** | Hero backdrop | Full-bleed behind all text. Always include alt text. |
| **Layout Style** | One vs. Two Column | **One Column**: Text + buttons only, no right side. **Two Column**: Text on left, right side content. |
| **Right Column Image** | Two-column right side image | Photo, accreditation, or service truck image. Must include alt text. |
| **Right Column Subtitle** | Two-column text label | Short descriptor (e.g., "EPA Registered Heat Treatments"). |
| **Right Column Map Embed** | Two-column map | Paste complete Google Maps iframe code. |

### ✅ Hero Section DO's

✅ **Always start with Title** (this is your H1)  
✅ **Keep Subtitle short** (20-50 words)  
✅ **Use Bullets for quick wins** (3-5 most impactful points)  
✅ **Add CTA Subtitle if helpful** (e.g., "No credit card required", "Free consultation")  
✅ **Choose CTA Text placement** (above or below button based on flow)  
✅ **Use CTA Subtitle Heading Level H3** (unless page structure requires H2)  
✅ **End with CTA** (always buttons or form at bottom)  
✅ **Add Background Image** for visual impact  
✅ **Use Two Column** if you have an image/map to showcase  
✅ **Set Highlight Text** to emphasize a key word in title

### CTA (Call-to-Action) Block - Detailed Breakdown

The CTA block is where users take action. It has several parts:

#### CTA Text (Optional Subtitle)
- **What it is:** Small supporting text (1 line) that appears near the button
- **Example:** "No credit card required" or "Chat with our team" or "Limited time offer"
- **Placement options:**
  - **Above**: Text appears ABOVE the button (good for building anticipation)
  - **Below**: Text appears BELOW the button (good for reassurance)

#### CTA Subtitle Heading Level
- **What it is:** HTML semantic heading tag (H2 or H3)
- **When to use H2:** If this is the second-most important heading on the page
- **When to use H3:** If there are multiple CTAs or secondary headings (usually the safe choice)
- **Default:** H3 (recommended for most pages)

#### Primary CTA Button
- **Label:** Button text (e.g., "Schedule Service", "Get Free Quote", "Call Now")
- **Link:** Where the button takes users:
  - `/contact-us` = URL to page
  - `tel:19184167098` = Click to call
  - `mailto:info@{{fork_source_slug}}pestcontrol.com` = Email link

#### Secondary CTA Button (Optional)
- **Label:** Alternative action (e.g., "Learn More", "View Services", "Chat Live")
- **Link:** Usually a different URL or action than primary button
- **When to use:** 
  - ✅ Different user intents (Schedule vs. Learn More)
  - ✅ Different channels (Call vs. Email)
  - ✅ Option to explore before committing
- **When NOT to use:**
  - ⛔ Too many buttons confuse users
  - ⛔ Both buttons doing the same thing

### Two-Column Layout - Detailed Breakdown

When you select **"Two Column"** layout style, your hero splits into:

```
┌─────────────────────────────────────────┐
│  LEFT SIDE (Text)  │  RIGHT SIDE       │
├────────────────────┼──────────────────┤
│  Title             │                  │
│  Subtitle          │  [RIGHT COLUMN   │
│  Bullets           │   CONTENT HERE]  │
│  CTA Buttons       │                  │
│                    │  Options:        │
│                    │  • Image         │
│                    │  • Map           │
│                    │  • Subtitle Text │
│                    │                  │
└────────────────────┴──────────────────┘
```

#### Right Column Options (Choose ONE)

**Option 1: Right Column Image**
- Upload a photo (service truck, team, accreditation badge, etc.)
- Include alt text (e.g., "Heat Tech service truck in Tulsa")
- Best for: Visual impact, showing team/equipment
- Size: 500x600px or larger (square or portrait orientation works best)

**Option 2: Right Column Map Embed**
- Paste the full iframe code from Google Maps
- Instructions: Google Maps → Your Location → Click Share → Embed map → Copy iframe code → Paste here
- Best for: Local businesses, showing location to visit
- Example: Office location, service area highlight

**Option 3: Right Column Subtitle Text**
- Short text label (2-3 words or short phrase)
- Example: "EPA Registered Heat Treatments" or "Licensed & Insured"
- Best for: Badges, certifications, quick credentials
- Usually pairs with a background image

#### Two-Column Rules
✅ **Mobile** automatically stacks to one column (text over image/content)  
✅ **Desktop** shows side-by-side layout  
✅ **Pick one right column option** (don't mix image + map + text)  
✅ **Background image** still shows behind left text column  
⛔ **Don't overcrowd** - keep right side simple and visual

### ⛔ Hero Section DON'Ts

⛔ **Do NOT add body/description AFTER the CTA**  
⛔ **Do NOT treat Subtitle as H2** (it's supporting text, not a heading)  
⛔ **Do NOT add more than 8 bullets** (overwhelms visitors)  
⛔ **Do NOT skip the Title** (needs H1 for SEO)  
⛔ **Do NOT use Body field unless absolutely necessary** (often redundant with Subtitle)  
⛔ **Do NOT mix too many CTAs** (1 primary, 1 optional secondary max)

### Hero Section Examples

#### Example 1: Service Page Hero (Two Column with Image)
```
Title: "Professional Pest Control & Heat Treatment Solutions"
Highlighted Text: "Heat Treatment Solutions"
Subtitle: "Serving Tulsa, Broken Arrow, and surrounding areas with eco-friendly pest elimination and bed bug heat treatment."
Bullets:
  - Same-day inspection and service available
  - EPA-registered heat treatment methods
  - Over 15 years of local expertise
  - Free consultation—no credit card required

CTA TEXT & SETTINGS:
  CTA Text: "No obligation. Free inspection."
  CTA Text Placement: Above (builds anticipation)
  CTA Subtitle Heading Level: H3

PRIMARY CTA:
  Label: "Schedule Inspection"
  Link: /contact-us#contact_form

SECONDARY CTA:
  Label: "Call (918) 416-7098"
  Link: tel:19184167098

Background Image: [professional pest control team image]

LAYOUT: Two Column
Right Column Image: [Heat Tech service truck]
Right Column Image Alt: "Heat Tech pest control service truck parked in Tulsa neighborhood"
Right Column Subtitle: (leave blank if using image)
```

#### Example 2: Homepage Hero (Two Column with Map)
```
Title: "Tulsa's Most Trusted Pest Control & Heat Treatment Experts"
Highlighted Text: "Trusted"
Subtitle: "Same-day service, EPA-registered methods, and guaranteed results for residential and commercial properties."
Bullets:
  - Available 7 days a week
  - Licensed and insured
  - Emergency services offered
  - 100% satisfaction guaranteed

CTA TEXT & SETTINGS:
  CTA Text: "1334 E 146th Pl S, Glenpool, OK"
  CTA Text Placement: Below (calls attention to location)
  CTA Subtitle Heading Level: H3

PRIMARY CTA:
  Label: "Get Free Quote"
  Link: /contact-us#contact_form

SECONDARY CTA:
  Label: "View Services"
  Link: /pest-control

Background Image: [hero banner image]

LAYOUT: Two Column
Right Column Map Embed: [Google Maps iframe code for office location]
```

#### Example 3: Lead-Gen Hero (One Column, No Right Side)
```
Title: "Eliminate Bed Bugs with Professional Heat Treatment"
Highlighted Text: "Heat Treatment"
Subtitle: "Eco-friendly, same-day bed bug elimination. 100% effective on all life stages."
Bullets:
  - Chemical-free treatment
  - One appointment eliminates all bed bugs
  - Safe for pets and family
  - Guaranteed results

CTA TEXT & SETTINGS:
  CTA Text: "Schedule your free inspection today."
  CTA Text Placement: Above
  CTA Subtitle Heading Level: H3

PRIMARY CTA:
  Label: "Schedule Now"
  Link: /bed-bug-treatment#schedule_form

SECONDARY CTA:
  (leave blank - one strong CTA only)

Background Image: [bed bug treatment process image]

LAYOUT: One Column (no right column content)
```

---

## Heading Tag (H-Tag) Guidelines

### ⚠️ CRITICAL: Heading Hierarchy Rules

Every page must follow proper HTML heading hierarchy for SEO and accessibility:

```
┌─────────────────────────────────────────────┐
│  HEADING HIERARCHY ON EVERY PAGE             │
├─────────────────────────────────────────────┤
│  H1 = HERO SECTION TITLE (ONE PER PAGE)     │ ← Only one!
│  ├─ H2 = First section title (after hero)   │
│  ├─ H3 = Card titles, subsections under H2  │
│  └─ H4+ = Further subdivisions (rare)       │
│                                              │
│  Example Page Structure:                     │
│  ┌──────────────────────────────────────┐   │
│  │ H1: Pest Control Services in Tulsa   │   │ Hero
│  ├──────────────────────────────────────┤   │
│  │ H2: Our Services                     │   │ ServiceGrid
│  │  ├─ H3: Bed Bug Treatment            │   │ (card title)
│  │  ├─ H3: General Pest Control         │   │ (card title)
│  │  └─ H3: Heat Treatment               │   │ (card title)
│  ├──────────────────────────────────────┤   │
│  │ H2: Why Choose Us                    │   │ IconGrid
│  │  ├─ H3: 15+ Years Experience         │   │ (feature title)
│  │  ├─ H3: EPA Registered               │   │ (feature title)
│  │  └─ H3: Same-Day Service             │   │ (feature title)
│  ├──────────────────────────────────────┤   │
│  │ H2: Our Process                      │   │ TwoColImage
│  │     [text content]                   │   │
│  ├──────────────────────────────────────┤   │
│  │ H2: Ready to Get Started?             │   │ CTA Section
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Heading Hierarchy Rules
✅ **One H1 per page** (always the Hero Section Title)  
✅ **H2 for main section titles** (everything after Hero)  
✅ **H3 for card titles, feature titles, subsections** (under H2)  
✅ **Skip heading levels never** (no H1→H3, always H1→H2→H3)  
✅ **Semantic meaning** (only use headings for actual content structure, not for styling)  

⛔ **Multiple H1s on one page** (SEO penalty, confuses screen readers)  
⛔ **Skipping levels** (H1→H3 with no H2 breaks accessibility)  
⛔ **Using headings for non-heading content** (bold text instead)  

---

## All Other Section Types

### Sections That Follow Normal Rules

For **ServiceGrid**, **IconGrid**, **TwoColImage**, **ServiceArea**, **CTA**, **Contact**, **LeadForm**, **BlogList**, and **HTML** sections:

✅ **You CAN add description** (optional supporting text)  
✅ **You CAN add body/rich content** after the main title  
✅ **You CAN add items/cards** (if section type supports)  
✅ **You CAN add CTA** at the end  
✅ **You CAN add more content after CTA** (if multiple items exist)

### Section H-Tag Reference Chart

| Section Type | Title H-Tag | Card/Item Title H-Tag | Subtitle Field | Notes |
|--------------|------------|----------------------|-----------------|-------|
| **ServiceGrid** | H2 | H3 | Not a heading (plain text) | Each card title = H3 |
| **IconGrid** | H2 | H3 | Not a heading (plain text) | Feature titles = H3 |
| **TwoColImage** | H2 | N/A | Not a heading (plain text) | Single section, no cards |
| **ServiceArea** | H2 | H3 | Not a heading (plain text) | Location titles = H3 |
| **CTA Section** | H2 | N/A | Not a heading (plain text) | Call-to-action section |
| **Contact Section** | H2 | N/A | Not a heading (plain text) | Contact form wrapper |
| **LeadForm Section** | H2 | N/A | Not a heading (plain text) | Lead capture form |
| **BlogList Section** | H2 | N/A | Not a heading (plain text) | Displays blog posts |
| **HTML Section** | H2 (optional) | Varies | Varies | See HTML Section rules below |

---

### Example: Service Grid Section
```
Title: "Our Pest Control Services"  ← H2 (main section heading)
Description: "Comprehensive solutions for residential, commercial, and industrial properties."  ← Plain text, NOT a heading

Service Items:
  1. Pest Control  ← H3 (card title)
     Description: "General pest elimination including insects, rodents, and wildlife."
     Icon: [bug icon]
     
  2. Bed Bug Treatment  ← H3 (card title)
     Description: "Heat-based treatment eliminating bed bugs in all life stages."
     Icon: [bed bug icon]
     
  3. Heat Treatment  ← H3 (card title)
     Description: "Temperature-based elimination for whole-home pest control."
     Icon: [thermometer icon]

CTA: "View All Services" → /pest-control
```

---

### Service Grid H-Tag Rules
✅ **Title = H2** (primary section heading)  
✅ **Description field = NOT a heading** (supporting text only, plain text)  
✅ **Each Card Title = H3** (subordinate to H2 section title)  
✅ **Card Description = Not a heading** (body text under H3)  

⛔ **Don't make Description an H2** (it's supporting text)  
⛔ **Don't make Card Titles H2** (they're subordinate to main section title)  

---

### Image Card Section (Process)

**Minimum cards rule (matches columns):**
- **2 Columns** = at least **2** cards
- **3 Columns** = at least **3** cards
- **4 Columns** = at least **4** cards

**Card fields:**
- **Card Title** (required) ← **H3 tag** (subordinate heading for each card)
- **Card Subtitle** (optional) ← Plain text, NOT a heading
- **Description** (optional rich text) ← Body text, NOT a heading
- **Item List Title** (optional) ← NOT a heading (plain text label)
- **Item List** (optional bullets) ← List items, NOT headings
- **Image** (optional but recommended)

**Image Card H-Tag Rules:**
✅ **Card Title = H3** (each card is a subsection under the H2 section title)  
✅ **Card Subtitle = NOT a heading** (bold or plain text)  
✅ **Description = Body text** (not a heading)  
✅ **Item List Title = Not a heading** (label or plain text)  

⛔ **Don't make Card Subtitle an H4** (it's supporting text, use bold or plain)  
⛔ **Don't make Description an H3** (it's body content under the card title H3)  

**Image crop behavior:**
- **Default (16:9)**: standard landscape crop
- **Square (Medium)**: balanced crop for icons/portraits
- **Taller (3:4)**: vertical emphasis for lifestyle photos
- Image crops follow **Sanity hotspot/crop** settings

### Example: Two Column Text+Image
```
Title: "Why Heat Treatment Works"  ← H2 (main section heading)
Description: "Heat is nature's most effective pest control method."  ← Plain text, NOT a heading
Body Text: "Professional heat treatment raises indoor temperatures to levels lethal to pests while safe for your family. Our EPA-registered process is..."
Body (continued with rich text): "Proven effective, chemical-free, and eliminates all life stages in one treatment."
Image: [heat treatment diagram]
CTA: "Learn More" → /heat-treatment
```

**TwoColImage H-Tag Rules:**
✅ **Title = H2** (main section heading)  
✅ **Description = NOT a heading** (supporting intro text)  
✅ **Body Text = NOT headings** (use regular paragraphs and bullet points)  

⛔ **Don't make Description an H2** (it's intro text under the H2 title)  
⛔ **Don't make Body Text contain headings** (this section has no H3 subtitles)  

---

### HTML Section (Special Case)

**⚠️ Title is H2 (usually), but optional in specific cases**

The HTML Section allows you to embed custom HTML/iframe code (e.g., calendars, custom forms, widgets, video embeds, etc.).

#### When to include Title (H2):
✅ Your embed code does NOT include a heading (e.g., a standalone widget without a title)  
✅ You want to add context before the embed (e.g., "Book Your Appointment" above a calendar)  
✅ The embed is a secondary feature needing intro text  

#### When to OMIT Title:
✅ Your embed code already creates an H1 or H2 (calendar headers, form titles, etc.)  
✅ The embed is standalone and self-explanatory  
✅ You want to avoid duplicate headings for SEO  
✅ The embed is auxiliary (testimonial widget, video player, etc.)  

#### HTML Section H-Tag Rules:
✅ **Title = H2** (if you add one) - treats it as a section heading  
✅ **Embed code may contain its own H1/H2** - don't duplicate  
✅ **Respect the hierarchy** - if embed has H1, don't add another H1  

⛔ **Don't nest conflicting headings** (embed has H1 AND you add H1 Title = SEO problem)  
⛔ **Don't use Title as styling** (only add if it's truly a heading for that section)  

#### Example: HTML Section with Embed Code (NO Title needed)
```
Title: (leave blank - calendar has its own H1 heading)  ← No redundant heading
Subtitle: (leave blank)
HTML Code: [paste your complete iframe/embed code here]
CTA: (optional - add if you want action button after embed)
```

#### Example: HTML Section WITH Title (widget needs context)
```
Title: "Schedule Your Free Inspection"  ← H2 (adds context to widget below)
Subtitle: (leave blank)
HTML Code: [paste calendar widget code here]
CTA: (optional)
```

#### When to include Title/Subtitle:
✅ Your embed code does NOT include a heading (e.g., a standalone widget without a title)  
✅ You want to add context before the embed (e.g., "Book Your Appointment" above a calendar)

#### When to OMIT Title/Subtitle:
✅ Your embed code already creates an H1 or H2 (calendar headers, form titles, etc.)  
✅ The embed is standalone and self-explanatory  
✅ You want to avoid duplicate headings for SEO

#### Example: HTML Section with Embed Code
```
Title: (leave blank - calendar has its own heading)
Subtitle: (leave blank)
HTML Code: [paste your complete iframe/embed code here]
CTA: (optional - add if you want action button after embed)
```

---

## Blog Post Creation

### Blog Post Structure

Blog posts follow a different content model optimized for search engines and readability:

#### Fields to Complete

| Field | Required? | Notes |
|-------|-----------|-------|
| **Title** | ✅ Yes | Your H1 (e.g., "How to Identify Bed Bugs in Your Tulsa Home") |
| **Slug** | ✅ Yes | Auto-generated URL path without a leading slash (e.g., `blog/identify-bed-bugs`) |
| **Author** | ✅ Yes | Select from authors list or create new |
| **Category** | ✅ Yes | Pest Control, Heat Treatment, Local News, etc. |
| **Tags** | ❌ Optional | Keywords for filtering (bed bugs, Tulsa, etc.) |
| **Description** | ✅ Yes | 2-3 sentences. Appears in search results. Max 160 characters. |
| **Body** | ✅ Yes | Main article content using rich text editor. |
| **Featured Image** | ✅ Yes | Main blog header image (1200x630 or wider). |
| **Published Date** | ✅ Yes | Set to publish date or today. |
| **SEO Title** | ❌ Optional | Override page title for search results (≤60 chars). |
| **SEO Description** | ❌ Optional | Override meta description (≤160 chars). |

### Blog Post Heading Structure

**Blog posts have a specific heading hierarchy:**

```
H1 = Blog Post Title (auto-generated, appears once at top)
  ├─ H2 = Main section headings (What Are Bed Bugs?, Where They Hide, etc.)
  ├─ H3 = Subsections under H2 (if you need sub-points)
  └─ H4 = Further subdivisions (rare, use sparingly)
```

**Blog Post H-Tag Rules:**
✅ **Title = H1** (appears once, auto-generated by Sanity)  
✅ **Body section headers = H2** (use ## markdown or editor headings)  
✅ **Subsection headers = H3** (use ### markdown under H2 sections)  
✅ **Skip heading levels never** (no H1→H3 jumps)  

⛔ **Don't add multiple H1s** (title is the only H1)  
⛔ **Don't start body with H2** (H1 is already the title)  
⛔ **Don't use H4+ unnecessarily** (H2/H3 cover most needs)  

### Blog Post Formatting Best Practices

✅ **Start with H1 Title** (auto-generated, don't override)  
✅ **Add featured image** before body text  
✅ **Use H2 for main sections** (What Are Bed Bugs?, Signs of Infestation, etc.)  
✅ **Use H3 for subsections** (under H2 sections, if needed)  
✅ **Break paragraphs into short chunks** (2-3 sentences each)  
✅ **Add bullet points** where listing items (symptoms, steps, etc.)  
✅ **Include internal links** to relevant service pages  
✅ **Add a call-to-action** at the end (link to service page or contact form)  
✅ **Aim for 1,000-2,000 words** for better search ranking  

### ⛔ Blog Post DON'Ts

⛔ **Do NOT start with H2 or H3** (H1 is already your title)  
⛔ **Do NOT skip the featured image** (improves engagement and SEO)  
⛔ **Do NOT write walls of text** (break into paragraphs with headings)  
⛔ **Do NOT use ALL CAPS** (looks aggressive, hurts readability)  
⛔ **Do NOT forget author and category** (required fields)  
⛔ **Do NOT publish without internal links** (helps site SEO)

### Blog Post Example

```
Title: "How to Identify Bed Bugs in Your Tulsa Home"
Slug: blog/identify-bed-bugs
Author: [Your Name]
Category: Pest Control
Tags: bed bugs, Tulsa, identification, infestation
Description: "Learn the signs of bed bug infestation and how to identify them in your Tulsa home."
Featured Image: [professional bed bug close-up photo]
Published: Today's date

Body:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[H1 automatically generated: How to Identify Bed Bugs in Your Tulsa Home]

## What Are Bed Bugs?  ← H2

Bed bugs are small, reddish-brown insects that feed on human blood. They're about the size of an apple seed and can hide in mattresses, furniture, and even wall cracks.

## Signs of Infestation  ← H2

Look for these telltale signs:

- Small, itchy red bites (often in lines or clusters)
- Brown or black fecal spots on bedding
- Musty odor in your bedroom
- Small bugs visible in mattress seams
- Shed skin or eggshells

## Where They Hide  ← H2

Bed bugs thrive in:
- Mattress seams and box springs
- Upholstered furniture
- Behind wall outlet covers
- Inside picture frames
- Baseboards and trim

## How Heat Treatment Works  ← H2

Professional heat treatment is the most effective solution. Our process raises your home's temperature to 130-135°F, eliminating all bed bug life stages in a single treatment—[link to /bed-bug-treatment].

## What to Do If You Find Bed Bugs  ← H2

Don't panic. Here's your action plan:

1. Wash all bedding in hot water
2. Vacuum thoroughly (including crevices)
3. Call us for professional treatment
4. Avoid moving items to other rooms

## Call Heat Tech Today  ← H2

If you suspect bed bugs in your Tulsa home, contact us immediately for a free inspection. We use EPA-registered heat treatment to eliminate bed bugs permanently—[link to /contact-us#contact_form].

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## SEO Best Practices

### Page-Level SEO

✅ **Title**: Unique, descriptive, includes location if relevant  
✅ **Slug**: Lowercase, hyphens, no leading slash, no trailing slash, no spaces (e.g., `bed-bug-treatment`)  
✅ **SEO Title**: ≤60 characters, include target keyword  
✅ **SEO Description**: ≤160 characters, compelling, includes CTA hint  
✅ **OG Image**: 1200x630px, high quality, branded  
✅ **Internal Links**: Link related pages (e.g., pest control → service area)

### Hero Section SEO

✅ **Title is H1**: One H1 per page, in Hero section  
✅ **Keywords in Title**: Target long-tail keywords (e.g., "bed bug heat treatment Tulsa")  
✅ **Highlight Key Phrase**: Use highlight text to emphasize keyword  
✅ **Subtitle includes location**: "Serving Tulsa, Broken Arrow..."  

### Blog SEO

✅ **Title includes keyword**: "How to Identify Bed Bugs in Your Tulsa Home"  
✅ **Featured image has alt text**: Describe the image (e.g., "Close-up of bed bug on white bedding")  
✅ **Body includes headings**: Break content with H2/H3 for readability and keyword targeting  
✅ **1,000+ words**: Longer content ranks better in search  
✅ **Internal links**: Link to 3-5 related service/blog pages  
✅ **External authority links**: Link to EPA, CDC, or reputable pest control sources  

### Keyword Placement

✅ **Title**: Primary keyword here first  
✅ **First 100 words**: Include keyword naturally  
✅ **Headings**: Use keywords in H2/H3 where relevant  
✅ **URL**: Short slug with keyword  
✅ **Meta description**: Include keyword if it fits naturally  

⛔ **Keyword stuffing**: Don't repeat keywords awkwardly  
⛔ **Orphaned pages**: Every page should link to at least 2 other pages  

---

## Common Mistakes

### ❌ Mistake 1: Treating Hero Subtitle Like H2

**WRONG:**
```
Hero Title: "Heat Treatment Solutions"
Hero Subtitle: "## Why Heat Works Best" ← This is NOT right
```

**RIGHT:**
```
Hero Title: "Heat Treatment Solutions"
Hero Subtitle: "Fast, chemical-free pest elimination." ← Plain text, supporting title
```

**Why:** Subtitle is supporting text, not a heading. One H1 per page = the Title field.

---

### ❌ Mistake 2: Adding Body Text After Hero CTA

**WRONG:**
```
Hero Section:
  Title: "Our Services"
  Subtitle: "..."
  Bullets: ...
  CTA: [Schedule Service button]
  Body: "Here's why you should choose us..." ← WRONG!
```

**RIGHT:**
```
Hero Section:
  Title: "Our Services"
  Subtitle: "..."
  Bullets: ...
  CTA: [Schedule Service button]
  [END - Next section starts]

[New Section - Service Grid]:
  Title: "Why Choose Us"
  Description: "Here's why..."
```

**Why:** Hero ends at CTA. Additional content goes in the next section below.

---

### ❌ Mistake 3: Wrong H-Tag Hierarchy (Most Common!)

**WRONG - Multiple H1s:**
```
Page Title: "Pest Control Services"  ← H1 (in Hero)
[Section Below]
Title: "Why Choose Us"  ← Also treating as H1 (WRONG!)
Description: "Best pest control..."
```

**RIGHT - Proper H2 for sections:**
```
Page Title: "Pest Control Services"  ← H1 (in Hero)
[ServiceGrid Section]
Title: "Why Choose Us"  ← H2 (subordinate to H1)
Description: "Best pest control..."  ← NOT a heading, plain text
Card Title: "Fast Service"  ← H3 (subordinate to H2)
Card Title: "Licensed"  ← H3
Card Title: "Guaranteed"  ← H3
```

**Why:** Only ONE H1 per page. All section titles = H2. Card titles = H3. Breaks SEO and accessibility.

---

### ❌ Mistake 4: Treating Subtitles as Headings

**WRONG:**
```
Hero Title: "Heat Treatment Solutions"  ← H1
Hero Subtitle: "Why it works best"  ← (Don't mark as H2!)
```

**RIGHT:**
```
Hero Title: "Heat Treatment Solutions"  ← H1
Hero Subtitle: "Why it works best"  ← Plain text, no heading tag
```

**Why:** Subtitle is supporting copy, not a heading. Keep it as plain text.

---

### ❌ Mistake 5: Not Understanding Card Title Levels

**WRONG:**
```
ServiceGrid Title: "Our Services"  ← H2
Card Title: "Bed Bug Treatment"  ← Treating as H2 (skips H3!)
```

**RIGHT:**
```
ServiceGrid Title: "Our Services"  ← H2
Card Title: "Bed Bug Treatment"  ← H3 (subordinate to H2)
Card Title: "Heat Treatment"  ← H3
Card Title: "General Pest Control"  ← H3
```

**Why:** Card titles are subsections under the main section title. Use H3.

---

### ❌ Mistake 6: Blog Post Starting With H2

**WRONG:**
```
Blog Post created
Title: "How to Identify Bed Bugs"  ← H1 (auto-generated)
Body: "## Signs of Infestation"  ← Starts with H2 (wrong, should start here!)
```

**RIGHT:**
```
Blog Post created
Title: "How to Identify Bed Bugs"  ← H1 (auto-generated)
Body: "## What Are Bed Bugs?"  ← H2 (first section in body)
Followed by: "## Signs of Infestation"  ← H2
And: "## Where They Hide"  ← H2
```

**Why:** H1 is already the title. Body sections start with H2.

---

### ❌ Mistake 7: Forgetting the Featured Image on Blog Posts

**Result:** Blog doesn't display correctly, no thumbnail in social shares.

**Fix:** Always upload a featured image (minimum 1200x630px). Recommended: 1920x1080px.

---

### ❌ Mistake 8: Mixing Sections Incorrectly

**WRONG:** HeroSection → ContactSection → ServiceGrid  
**RIGHT:** HeroSection → ServiceGrid → CTA Section → Contact Form

**Why:** Lead with intro (Hero), then value props (ServiceGrid), then action (CTA).

---

### ❌ Mistake 9: Skipping SEO Fields

**Result:** Page doesn't show up in search results correctly.

**Required SEO fields:**
- Page Title (internal name)
- Slug (URL path)
- SEO Title (≤60 chars)
- SEO Description (≤160 chars)
- Featured Image with alt text

---

### ❌ Mistake 10: Blog Title Without Target Keyword

**WRONG:** "Our Latest News"  
**RIGHT:** "Professional Pest Control Services in Broken Arrow, OK"

**Why:** Titles should include search keywords for better ranking.

---

## Content Creation Checklist

### Before Publishing ANY Page

- [ ] **Page Info filled out**
  - [ ] Title (internal + SEO-friendly)
  - [ ] Slug (URL format: service-name or service-area/city/page-name)
  - [ ] Page Type selected
  - [ ] SEO Title (≤60 chars)
  - [ ] SEO Description (≤160 chars)
  - [ ] OG Image (1200x630px)

- [ ] **Sections ordered correctly**
  - [ ] Hero Section is FIRST
  - [ ] No orphaned/empty sections
  - [ ] All CTAs point to valid pages/forms

- [ ] **Hero Section validated**
  - [ ] Title present (H1)
  - [ ] Subtitle is supporting text (not H2)
  - [ ] No content after CTA button
  - [ ] Background image high quality
  - [ ] CTA links work

- [ ] **All other sections validated**
  - [ ] Titles clear and descriptive
  - [ ] No typos or broken links
  - [ ] Images have alt text
  - [ ] CTA buttons functional

- [ ] **H-Tag Hierarchy verified** ⚠️ CRITICAL
  - [ ] One and ONLY one H1 (the Hero title)
  - [ ] All section titles are H2 (not H1)
  - [ ] All card/feature titles are H3 (not H2)
  - [ ] No skipped heading levels (no H1→H3 jumps)
  - [ ] Subtitles and descriptions are NOT headings (plain text)

### Before Publishing ANY Blog Post

- [ ] **Metadata complete**
  - [ ] Title includes keyword
  - [ ] Slug matches URL pattern
  - [ ] Author selected
  - [ ] Category selected
  - [ ] Tags relevant (3-5)

- [ ] **Featured image uploaded**
  - [ ] Size: 1920x1080px or 1200x630px minimum
  - [ ] Alt text descriptive
  - [ ] High quality (no pixelation)

- [ ] **Body content quality**
  - [ ] H1 (title) + H2 sections (content breakdowns)
  - [ ] 1,000+ words (for SEO)
  - [ ] No walls of text (break into paragraphs)
  - [ ] Bullet points used effectively
  - [ ] Internal links (3-5 to related content)
  - [ ] External authority links (EPA, CDC, etc.)

- [ ] **H-Tag Hierarchy verified** ⚠️ CRITICAL
  - [ ] H1 = Blog title (auto-generated)
  - [ ] H2 = Main section headings (What Are X?, Why Y?, etc.)
  - [ ] H3 = Subsections (only if needed under H2)
  - [ ] No multiple H1s
  - [ ] No skipped levels

- [ ] **SEO optimized**
  - [ ] Keywords in title, first 100 words, headings
  - [ ] Meta description ≤160 characters
  - [ ] Internal links to service pages
  - [ ] Image alt text includes keywords naturally

---

## Questions?

If you have questions about content structure, section fields, or SEO optimization, refer back to this guide or contact the development team.

**Key Reminders:**
- **The Hero Section is special** — always start with Title (H1), keep Subtitle short, end with CTA
- **Everything else follows normal content rules** — H2 for section titles, H3 for card/feature titles
- **One H1 per page only** — the Hero Section title is the only H1, all sections after are H2+
- **Never skip heading levels** — H1→H2→H3 progression, never H1→H3

Happy writing! 🚀
