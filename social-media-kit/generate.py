"""
FuneralPress 30-Day Social Media Kit Generator
Generates 2 tweets per day (morning + evening) with branded social card images (1200x675 PNG).
Three visual styles rotating: Brand Dark, Clean Light, Abstract Gradient.
"""

import os
import math
import random
from PIL import Image, ImageDraw, ImageFont

FONTS_DIR = os.path.join(
    os.path.expanduser("~"),
    ".claude", "plugins", "cache", "anthropic-agent-skills",
    "document-skills", "3d5951151859", "skills", "canvas-design", "canvas-fonts"
)

OUT_DIR = os.path.dirname(os.path.abspath(__file__))
W, H = 1200, 675

# ─── Content: 60 tweets (2 per day x 30 days) ──────────────────────────────
# Each day has a "morning" and "evening" tweet paired together.

DAYS = [
    # ── Day 1 ──
    {
        "morning": {
            "cat": "feature",
            "headline": "Design Funeral\nBrochures in Minutes",
            "sub": "Professional templates. Beautiful results.",
            "tweet": "Design stunning funeral brochures in minutes with FuneralPress — professional templates, beautiful results, zero design skills needed.\n\nTry it free → funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "tip",
            "headline": "Choose Your\nTemplate First",
            "sub": "Then customize every detail.",
            "tweet": "Tip: Start with a template that fits the mood you want, then customize colors, photos, and text. It takes under 10 minutes.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 2 ──
    {
        "morning": {
            "cat": "feature",
            "headline": "Stream Services\nLive to Family",
            "sub": "Distance shouldn't mean absence.",
            "tweet": "Distance shouldn't mean absence. Stream funeral services live so family abroad can participate in real time.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #LiveStreaming #FuneralPress",
        },
        "evening": {
            "cat": "emotional",
            "headline": "No One Should\nGrieve Alone",
            "sub": "Bring everyone together virtually.",
            "tweet": "No one should have to grieve alone. Live streaming means every family member can be present, no matter where they are.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 3 ──
    {
        "morning": {
            "cat": "feature",
            "headline": "Online Memorial\nPages",
            "sub": "A lasting tribute. Always accessible.",
            "tweet": "Create a beautiful online memorial page — a lasting tribute that family and friends can visit anytime, from anywhere.\n\n→ funeralpress.org/memorial\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "community",
            "headline": "Share the\nMemorial Link",
            "sub": "One link. The whole family connected.",
            "tweet": "Share a single memorial link with the whole family — everyone can view photos, leave tributes, and stay connected through grief.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 4 ──
    {
        "morning": {
            "cat": "feature",
            "headline": "Budget Planner\nBuilt In",
            "sub": "Track every cedi. Stay in control.",
            "tweet": "Funeral costs add up fast. Our built-in budget planner helps you track every cedi and stay in control.\n\n→ funeralpress.org/budget-planner\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "tip",
            "headline": "Set Your Budget\nBefore You Start",
            "sub": "Know your limits. Plan with peace.",
            "tweet": "Set your budget before you start planning. Knowing your limits upfront prevents stress and overspending later.\n\n→ funeralpress.org/budget-planner\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 5 ──
    {
        "morning": {
            "cat": "feature",
            "headline": "One-Week\nObservance Cards",
            "sub": "Beautifully designed. Ready to share.",
            "tweet": "Create beautiful one-week observance cards to honor your loved one. Designed with care, ready to print or share digitally.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "community",
            "headline": "The One-Week\nTradition",
            "sub": "Sacred. Respected. Now digital.",
            "tweet": "The one-week observance is deeply rooted in Ghanaian tradition. Now you can create and share cards digitally while honoring the custom.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 6 ──
    {
        "morning": {
            "cat": "feature",
            "headline": "Digital Guest\nBooks",
            "sub": "Collect tributes that last forever.",
            "tweet": "Collect heartfelt tributes with a digital guest book. Messages of love preserved forever, accessible from any device.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "emotional",
            "headline": "Words That\nHeal",
            "sub": "Every message is a gift.",
            "tweet": "Every condolence message is a gift to the grieving family. A digital guest book collects them all in one beautiful, lasting place.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 7 ──
    {
        "morning": {
            "cat": "feature",
            "headline": "Photo Galleries\nfor Celebrations",
            "sub": "Share memories. Celebrate life.",
            "tweet": "Build a photo gallery celebrating their life. Share memories with everyone who loved them — all in one beautiful place.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "tip",
            "headline": "Ask Family to\nContribute Photos",
            "sub": "Everyone has a memory worth sharing.",
            "tweet": "Ask family members to contribute their favorite photos to the gallery. Everyone has a memory worth sharing — together they tell the full story.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 8 ──
    {
        "morning": {
            "cat": "feature",
            "headline": "Obituary\nCreator",
            "sub": "Tell their story with dignity.",
            "tweet": "Tell their story with dignity. Our obituary creator guides you through writing a meaningful tribute step by step.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "tip",
            "headline": "How to Write\nan Obituary",
            "sub": "Start with what made them unique.",
            "tweet": "Writing an obituary? Start with what made them unique — their passions, their laughter, the way they loved.\n\nWe can help → funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 9 ──
    {
        "morning": {
            "cat": "tip",
            "headline": "Plan Ahead.\nEase the Burden.",
            "sub": "Pre-planning is an act of love.",
            "tweet": "Planning ahead is one of the most loving things you can do for your family. Start with a simple checklist.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "feature",
            "headline": "Your Funeral\nChecklist",
            "sub": "Everything in one place.",
            "tweet": "FuneralPress gives you a clear checklist: brochure, budget, stream, memorial page, guest book — everything organized in one place.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 10 ──
    {
        "morning": {
            "cat": "tip",
            "headline": "5 Things to\nPrepare First",
            "sub": "Venue. Budget. Program. Brochure. Stream.",
            "tweet": "5 things to prepare first when planning a funeral:\n\n1. Venue\n2. Budget\n3. Program order\n4. Brochure\n5. Live stream setup\n\nFuneralPress handles 4 of these → funeralpress.org\n\n#FuneralPlanning",
        },
        "evening": {
            "cat": "emotional",
            "headline": "One Step\nat a Time",
            "sub": "You don't have to figure it all out today.",
            "tweet": "You don't have to figure it all out today. Take it one step at a time — FuneralPress is here to guide you through each one.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 11 ──
    {
        "morning": {
            "cat": "tip",
            "headline": "Include Family\nAbroad",
            "sub": "Technology bridges the distance.",
            "tweet": "Family abroad? Technology bridges the distance. Set up live streaming so everyone can be part of the farewell.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "community",
            "headline": "Diaspora\nConnected",
            "sub": "Ghana to the world. One stream.",
            "tweet": "From Accra to London to New York — live streaming keeps the Ghanaian diaspora connected during life's most important moments.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 12 ──
    {
        "morning": {
            "cat": "tip",
            "headline": "Keep Funeral\nCosts Transparent",
            "sub": "A budget prevents surprises.",
            "tweet": "Funeral costs can spiral without a plan. Keep things transparent with a clear budget — your family will thank you.\n\n→ funeralpress.org/budget-planner\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "partner",
            "headline": "Funeral Homes:\nOffer Transparency",
            "sub": "Build trust with clear pricing.",
            "tweet": "Funeral homes: build trust by offering transparent pricing. FuneralPress tools help your clients budget clearly and confidently.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 13 ──
    {
        "morning": {
            "cat": "tip",
            "headline": "Digital vs Print\nBrochures",
            "sub": "Why not both?",
            "tweet": "Digital or print brochures? Why not both? Design once on FuneralPress, then share online or print for the service.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "feature",
            "headline": "Download as\nPDF Instantly",
            "sub": "Print-ready. Share-ready.",
            "tweet": "Design your brochure, then download as a high-quality PDF — ready to print at any shop or share on WhatsApp instantly.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 14 ──
    {
        "morning": {
            "cat": "tip",
            "headline": "Delegate Tasks\nto Partners",
            "sub": "You don't have to do it all alone.",
            "tweet": "You don't have to plan everything alone. Delegate tasks to partners, family members, or your funeral home through FuneralPress.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "partner",
            "headline": "Partners Make\nPlanning Easier",
            "sub": "Join the FuneralPress network.",
            "tweet": "As a FuneralPress partner, you help families plan with less stress. Offer your services through our platform and reach more clients.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 15 ──
    {
        "morning": {
            "cat": "tip",
            "headline": "Preserve Their\nStory Now",
            "sub": "Memories fade. Digital tributes don't.",
            "tweet": "Memories fade with time. Create a digital tribute now — memorial pages, photo galleries, and guest books that last forever.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "emotional",
            "headline": "Before Memories\nFade",
            "sub": "Capture them today.",
            "tweet": "Don't wait until memories fade. Capture their story today — write it down, upload the photos, preserve the love.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 16 ──
    {
        "morning": {
            "cat": "emotional",
            "headline": "Every Life\nDeserves Honor",
            "sub": "FuneralPress",
            "tweet": "Every life deserves to be honored with dignity and beauty. That's why we built FuneralPress — to make it easier during the hardest times.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "feature",
            "headline": "Beautiful Tools\nfor Hard Times",
            "sub": "Designed with empathy.",
            "tweet": "FuneralPress was designed with empathy — beautiful, simple tools that let you focus on what matters: honoring someone you love.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 17 ──
    {
        "morning": {
            "cat": "emotional",
            "headline": "Grief is Love\nWith Nowhere to Go",
            "sub": "Give it a place.",
            "tweet": "Grief is love with nowhere to go. A memorial page gives that love a home — a place to visit, to remember, to heal.\n\n→ funeralpress.org/memorial\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "tip",
            "headline": "Visit the Page\nWhenever You Need",
            "sub": "It's always there for you.",
            "tweet": "A memorial page isn't just for the funeral. It's there whenever you need to feel close again — a month, a year, a decade later.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 18 ──
    {
        "morning": {
            "cat": "emotional",
            "headline": "Their Legacy\nLives On",
            "sub": "In every story shared. Every photo saved.",
            "tweet": "Their legacy lives on in every story shared, every photo saved, every tribute written. Keep their memory alive.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "community",
            "headline": "A Legacy for\nGenerations",
            "sub": "Your grandchildren will see this.",
            "tweet": "The memorial you create today is a gift to future generations. Your grandchildren will one day read these stories and know where they came from.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 19 ──
    {
        "morning": {
            "cat": "emotional",
            "headline": "Together\nEven Apart",
            "sub": "Live streaming connects hearts.",
            "tweet": "When distance separates us, technology brings us together. Live stream the service so no one grieves alone.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "tip",
            "headline": "Test Your Stream\nBefore the Day",
            "sub": "A smooth stream means no stress.",
            "tweet": "Planning to live stream? Test your setup a day before. Check your internet, camera angle, and audio — so the day runs smoothly.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 20 ──
    {
        "morning": {
            "cat": "emotional",
            "headline": "A Beautiful\nFarewell",
            "sub": "Because they deserved beautiful things.",
            "tweet": "They deserved beautiful things in life. They deserve a beautiful farewell too. Create something worthy of their memory.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "feature",
            "headline": "Every Detail\nMatters",
            "sub": "Brochures, streams, memorials — all beautiful.",
            "tweet": "From the brochure design to the live stream quality to the memorial page — every detail matters. FuneralPress helps you get them all right.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 21 ──
    {
        "morning": {
            "cat": "emotional",
            "headline": "Healing Begins\nWith Remembering",
            "sub": "Create a space for remembrance.",
            "tweet": "Healing begins with remembering. Create a space where family and friends can share memories, photos, and love.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "community",
            "headline": "Grief Shared\nis Grief Halved",
            "sub": "Come together. Find strength.",
            "tweet": "Grief shared is grief halved. Bring the family together — online or in person — and find strength in each other.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 22 ──
    {
        "morning": {
            "cat": "blog",
            "headline": "Read Our\nComplete Guide",
            "sub": "Everything you need to know.",
            "tweet": "New on the blog: The Complete FuneralPress User Guide — every feature explained, step by step.\n\nRead it → funeralpress.org/blog/funeralpress-complete-user-guide\n\n#FuneralPlanning #FuneralPress",
        },
        "evening": {
            "cat": "tip",
            "headline": "Bookmark the\nGuide",
            "sub": "Reference it anytime you need.",
            "tweet": "Bookmark our complete guide so you can reference it anytime. Step-by-step instructions for every FuneralPress feature.\n\n→ funeralpress.org/blog/funeralpress-complete-user-guide\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 23 ──
    {
        "morning": {
            "cat": "partner",
            "headline": "Grow Your\nFuneral Business",
            "sub": "Join the FuneralPress Partner Program.",
            "tweet": "Funeral homes: grow your business with FuneralPress. Offer digital brochures, live streaming & memorial pages under your brand.\n\nPartner with us → funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "partner",
            "headline": "White-Label\nYour Services",
            "sub": "Your brand. Our technology.",
            "tweet": "Partners get white-label tools — your funeral home's brand on every brochure, memorial page, and live stream. Your name, our technology.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 24 ──
    {
        "morning": {
            "cat": "blog",
            "headline": "For Funeral\nHomes & Churches",
            "sub": "Partner with FuneralPress.",
            "tweet": "Funeral homes & churches: partner with FuneralPress to offer digital brochures, live streaming, and memorial pages to your clients.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "partner",
            "headline": "Serve More\nFamilies",
            "sub": "Digital tools that scale with you.",
            "tweet": "As a FuneralPress partner, serve more families without more overhead. Digital tools that scale with your business.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 25 ──
    {
        "morning": {
            "cat": "partner",
            "headline": "Churches &\nCongregations",
            "sub": "Digital tools for your ministry.",
            "tweet": "Churches: support your congregation during loss with FuneralPress. Manage memorial services, brochures & live streams — all from one platform.\n\nLearn more → funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "emotional",
            "headline": "Ministry in\nMoments of Loss",
            "sub": "Be there for your flock.",
            "tweet": "The church's role during loss is irreplaceable. FuneralPress gives your ministry the digital tools to be there for every family.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 26 ──
    {
        "morning": {
            "cat": "community",
            "headline": "Made for\nGhana",
            "sub": "Designed with our traditions in mind.",
            "tweet": "FuneralPress is made for Ghana — designed with our traditions, our customs, and our way of honoring loved ones in mind.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #MadeInGhana #FuneralPress",
        },
        "evening": {
            "cat": "feature",
            "headline": "Works on\nAny Phone",
            "sub": "Mobile-first. Data-friendly.",
            "tweet": "FuneralPress works on any phone — mobile-first, data-friendly, and designed for how Ghanaians actually use the internet.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 27 ──
    {
        "morning": {
            "cat": "community",
            "headline": "One-Week\nObservance",
            "sub": "A tradition we honor digitally.",
            "tweet": "The one-week observance is sacred. Now you can create and share beautiful one-week cards digitally — honoring tradition with modern tools.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "tip",
            "headline": "Share Cards\non WhatsApp",
            "sub": "Reach everyone instantly.",
            "tweet": "Design your one-week card on FuneralPress, download it, and share directly on WhatsApp. Reach the whole family in seconds.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 28 ──
    {
        "morning": {
            "cat": "community",
            "headline": "Supporting\nFuneral Homes",
            "sub": "Across Ghana. Together.",
            "tweet": "We're supporting funeral homes across Ghana with digital tools that make their work easier and their clients' experience better.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "partner",
            "headline": "Join 50+\nPartners",
            "sub": "Growing the network across Ghana.",
            "tweet": "Join the growing network of funeral homes and churches using FuneralPress to modernize their services and serve families better.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
    # ── Day 29 ──
    {
        "morning": {
            "cat": "community",
            "headline": "Celebration\nof Life",
            "sub": "The Ghanaian way. Beautifully digital.",
            "tweet": "In Ghana, funerals are celebrations of life. FuneralPress helps you plan a celebration worthy of their legacy.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #CelebrationOfLife #FuneralPress",
        },
        "evening": {
            "cat": "emotional",
            "headline": "Celebrate\nHow They Lived",
            "sub": "Joy. Love. Legacy.",
            "tweet": "Don't just mourn how they left — celebrate how they lived. Photo galleries, tributes, and stories that capture the joy they brought.\n\n→ funeralpress.org\n\n#FuneralPlanning #FuneralPress",
        },
    },
    # ── Day 30 ──
    {
        "morning": {
            "cat": "blog",
            "headline": "Try FuneralPress\nToday",
            "sub": "Free to start. Beautiful by default.",
            "tweet": "Try FuneralPress today — free to start, beautiful by default. Brochures, memorials, live streams, and more. All in one place.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
        "evening": {
            "cat": "emotional",
            "headline": "Thank You for\n30 Days Together",
            "sub": "This is just the beginning.",
            "tweet": "Thank you for following along for 30 days. Honoring loved ones matters — and FuneralPress is here to help, today and always.\n\n→ funeralpress.org\n\n#FuneralPlanning #Ghana #FuneralPress",
        },
    },
]

# ─── Colors ─────────────────────────────────────────────────────────────────

DARK_BG = (18, 18, 36)
DARK_BG2 = (26, 26, 46)
GOLD = (212, 168, 67)
GOLD_DIM = (170, 135, 54)
IVORY = (245, 240, 230)
TEAL = (45, 120, 130)
TEAL_DARK = (25, 80, 90)
ROSE = (160, 100, 110)
WHITE = (255, 255, 255)
CHARCOAL = (40, 40, 50)
LIGHT_BG = (250, 247, 242)
LIGHT_BG2 = (240, 235, 225)
WARM_GRAY = (120, 115, 108)
NEAR_BLACK = (30, 28, 26)


def load_font(name, size):
    path = os.path.join(FONTS_DIR, name)
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


# ─── Drawing Helpers ────────────────────────────────────────────────────────

def draw_circle(draw, cx, cy, r, fill=None, outline=None, width=1):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=outline, width=width)


def draw_diamond(draw, cx, cy, size, fill):
    pts = [(cx, cy - size), (cx + size, cy), (cx, cy + size), (cx - size, cy)]
    draw.polygon(pts, fill=fill)


def draw_line_pattern(draw, x0, y0, x1, y1, color, spacing=20, width=1):
    for offset in range(0, max(x1 - x0, y1 - y0) * 2, spacing):
        lx0 = x0 + offset
        ly0 = y0
        lx1 = x0
        ly1 = y0 + offset
        if lx0 > x1:
            ly0 += lx0 - x1
            lx0 = x1
        if ly1 > y1:
            lx1 += ly1 - y1
            ly1 = y1
        if ly0 <= y1 and lx1 <= x1:
            draw.line([(lx0, ly0), (lx1, ly1)], fill=color, width=width)


def gradient_rect(img, x0, y0, x1, y1, color1, color2, vertical=True):
    draw = ImageDraw.Draw(img)
    if vertical:
        for y in range(y0, y1):
            t = (y - y0) / max(1, y1 - y0)
            r = int(color1[0] + (color2[0] - color1[0]) * t)
            g = int(color1[1] + (color2[1] - color1[1]) * t)
            b = int(color1[2] + (color2[2] - color1[2]) * t)
            draw.line([(x0, y), (x1, y)], fill=(r, g, b))
    else:
        for x in range(x0, x1):
            t = (x - x0) / max(1, x1 - x0)
            r = int(color1[0] + (color2[0] - color1[0]) * t)
            g = int(color1[1] + (color2[1] - color1[1]) * t)
            b = int(color1[2] + (color2[2] - color1[2]) * t)
            draw.line([(x, y0), (x, y1)], fill=(r, g, b))


# ─── Style A: Brand Dark ────────────────────────────────────────────────────

def style_brand_dark(day, slot, data):
    img = Image.new("RGB", (W, H), DARK_BG)
    draw = ImageDraw.Draw(img)
    gradient_rect(img, 0, 0, W, H, DARK_BG, DARK_BG2, vertical=True)
    draw = ImageDraw.Draw(img)

    seed = day * 7 + (0 if slot == "morning" else 100)
    random.seed(seed)

    draw.rectangle([0, 0, 6, H], fill=GOLD)

    for i in range(5):
        r = 180 + i * 40
        draw_circle(draw, W - 80, -40, r, outline=(*GOLD_DIM, ), width=1)

    for _ in range(8):
        dx = random.randint(700, 1140)
        dy = random.randint(50, 620)
        draw_diamond(draw, dx, dy, random.randint(3, 8), (*GOLD_DIM,))

    draw_line_pattern(draw, 800, 450, 1160, 640, (*CHARCOAL,), spacing=16, width=1)
    draw.rectangle([60, H // 2 + 30, 600, H // 2 + 32], fill=GOLD)

    font_head = load_font("YoungSerif-Regular.ttf", 54)
    font_sub = load_font("InstrumentSans-Regular.ttf", 22)
    font_brand = load_font("InstrumentSans-Bold.ttf", 16)
    font_tag = load_font("DMMono-Regular.ttf", 13)

    y_start = 140
    for i, line in enumerate(data["headline"].split("\n")):
        draw.text((60, y_start + i * 68), line, font=font_head, fill=IVORY)

    draw.text((60, H // 2 + 52), data["sub"], font=font_sub, fill=GOLD)

    draw.rectangle([0, H - 52, W, H], fill=(15, 15, 30))
    draw.rectangle([0, H - 52, W, H - 50], fill=GOLD_DIM)
    draw.text((60, H - 40), "FUNERALPRESS", font=font_brand, fill=GOLD)
    draw.text((60 + 180, H - 40), "funeralpress.org", font=font_tag, fill=WARM_GRAY)

    font_day = load_font("DMMono-Regular.ttf", 12)
    time_label = "AM" if slot == "morning" else "PM"
    draw.text((W - 130, 24), f"DAY {day:02d} / 30 {time_label}", font=font_day, fill=GOLD_DIM)

    return img


# ─── Style B: Clean Light ───────────────────────────────────────────────────

def style_clean_light(day, slot, data):
    img = Image.new("RGB", (W, H), LIGHT_BG)
    draw = ImageDraw.Draw(img)
    gradient_rect(img, 0, 0, W, H, LIGHT_BG, LIGHT_BG2, vertical=True)
    draw = ImageDraw.Draw(img)

    seed = day * 13 + (0 if slot == "morning" else 100)
    random.seed(seed)

    block_h = random.randint(180, 260)
    block_y = random.randint(60, 200)
    draw.rectangle([W - 320, block_y, W - 40, block_y + block_h], fill=TEAL)
    for i in range(0, block_h, 14):
        draw.line([(W - 310, block_y + i), (W - 50, block_y + i)], fill=TEAL_DARK, width=1)

    for gx in range(40, 500, 30):
        for gy in range(480, 640, 30):
            draw.ellipse([gx - 1, gy - 1, gx + 1, gy + 1], fill=WARM_GRAY)

    draw.rectangle([60, 120, 64, 320], fill=NEAR_BLACK)

    font_head = load_font("BricolageGrotesque-Bold.ttf", 50)
    font_sub = load_font("CrimsonPro-Italic.ttf", 24)
    font_brand = load_font("InstrumentSans-Bold.ttf", 15)
    font_tag = load_font("DMMono-Regular.ttf", 12)

    y_start = 130
    for i, line in enumerate(data["headline"].split("\n")):
        draw.text((88, y_start + i * 62), line, font=font_head, fill=NEAR_BLACK)

    draw.text((88, 340), data["sub"], font=font_sub, fill=WARM_GRAY)
    draw.rectangle([88, 380, 500, 381], fill=TEAL)

    cat_label = data["cat"].upper()
    draw.text((88, 396), cat_label, font=font_tag, fill=TEAL)

    draw.rectangle([0, H - 48, W, H], fill=NEAR_BLACK)
    draw.text((60, H - 36), "FUNERALPRESS", font=font_brand, fill=IVORY)
    draw.text((60 + 170, H - 36), "funeralpress.org", font=font_tag, fill=WARM_GRAY)

    time_label = "AM" if slot == "morning" else "PM"
    draw.text((W - 130, 24), f"DAY {day:02d} / 30 {time_label}", font=font_tag, fill=WARM_GRAY)

    return img


# ─── Style C: Abstract Gradient ─────────────────────────────────────────────

def style_abstract_gradient(day, slot, data):
    img = Image.new("RGB", (W, H))

    seed = day * 19 + (0 if slot == "morning" else 100)
    random.seed(seed)

    gradients = [
        ((18, 18, 50), (45, 25, 70)),
        ((10, 30, 50), (20, 60, 80)),
        ((40, 15, 20), (80, 30, 45)),
        ((15, 35, 35), (30, 70, 65)),
        ((30, 20, 10), (70, 50, 25)),
    ]
    slot_offset = 0 if slot == "morning" else 2
    c1, c2 = gradients[(day + slot_offset) % len(gradients)]
    gradient_rect(img, 0, 0, W, H, c1, c2, vertical=True)
    draw = ImageDraw.Draw(img)

    fx = random.randint(600, 1000)
    fy = random.randint(100, 400)
    for angle_deg in range(0, 360, 6):
        angle = math.radians(angle_deg)
        ex = fx + int(math.cos(angle) * 500)
        ey = fy + int(math.sin(angle) * 500)
        lr = min(255, c2[0] + 30)
        lg = min(255, c2[1] + 30)
        lb = min(255, c2[2] + 30)
        draw.line([(fx, fy), (ex, ey)], fill=(lr, lg, lb), width=1)

    for i in range(8):
        r = 40 + i * 50
        outline_c = (min(255, c2[0] + 50), min(255, c2[1] + 50), min(255, c2[2] + 50))
        draw_circle(draw, fx, fy, r, outline=outline_c, width=1)

    draw.rectangle([50, 80, 54, 500], fill=GOLD)
    draw.rectangle([50, 500, 300, 502], fill=GOLD)

    for _ in range(20):
        dx = random.randint(60, 580)
        dy = random.randint(100, 560)
        sz = random.randint(2, 5)
        draw_circle(draw, dx, dy, sz, fill=GOLD_DIM)

    font_head = load_font("Italiana-Regular.ttf", 52)
    font_sub = load_font("Jura-Light.ttf", 20)
    font_brand = load_font("InstrumentSans-Bold.ttf", 15)
    font_tag = load_font("DMMono-Regular.ttf", 12)

    y_start = 140
    for i, line in enumerate(data["headline"].split("\n")):
        draw.text((82, y_start + i * 64 + 2), line, font=font_head, fill=(0, 0, 0))
        draw.text((80, y_start + i * 64), line, font=font_head, fill=IVORY)

    draw.text((80, 520), data["sub"], font=font_sub, fill=GOLD)

    draw.rectangle([0, H - 48, W, H], fill=(10, 10, 20))
    draw.rectangle([0, H - 48, W, H - 46], fill=GOLD_DIM)
    draw.text((60, H - 36), "FUNERALPRESS", font=font_brand, fill=GOLD)
    draw.text((60 + 170, H - 36), "funeralpress.org", font=font_tag, fill=WARM_GRAY)

    time_label = "AM" if slot == "morning" else "PM"
    draw.text((W - 130, 24), f"DAY {day:02d} / 30 {time_label}", font=font_tag, fill=GOLD_DIM)

    return img


# ─── Main Generation ────────────────────────────────────────────────────────

STYLES = [style_brand_dark, style_clean_light, style_abstract_gradient]
STYLE_NAMES = ["Brand Dark", "Clean Light", "Abstract Gradient"]


def generate():
    schedule_lines = [
        "# FuneralPress 30-Day Social Media Schedule\n",
        "Post **2 tweets per day** (morning + evening) with the accompanying image.\n",
        "| Day | Slot | Category | Style | Tweet Preview |",
        "|-----|------|----------|-------|---------------|",
    ]

    total = 0
    for day_num in range(1, 31):
        day_data = DAYS[day_num - 1]

        day_dir = os.path.join(OUT_DIR, f"day-{day_num:02d}")
        os.makedirs(day_dir, exist_ok=True)

        for slot_idx, slot in enumerate(["morning", "evening"]):
            data = day_data[slot]
            # Alternate styles: morning uses one, evening uses next
            style_idx = ((day_num - 1) * 2 + slot_idx) % 3
            style_fn = STYLES[style_idx]
            style_name = STYLE_NAMES[style_idx]

            num = slot_idx + 1  # 1 or 2

            # Write tweet text
            tweet_path = os.path.join(day_dir, f"tweet-{num}.txt")
            with open(tweet_path, "w", encoding="utf-8") as f:
                f.write(data["tweet"])

            # Generate image
            img = style_fn(day_num, slot, data)
            img_path = os.path.join(day_dir, f"image-{num}.png")
            img.save(img_path, "PNG", quality=95)

            # Schedule entry
            preview = data["tweet"][:55].replace("\n", " ") + "..."
            time_label = "Morning" if slot == "morning" else "Evening"
            schedule_lines.append(
                f"| {day_num:02d} | {time_label} | {data['cat'].title()} | {style_name} | {preview} |"
            )

            total += 1
            print(f"  [OK] Day {day_num:02d} {time_label:7s} - {data['cat'].title():10s} [{style_name}]")

    # Write schedule
    schedule_path = os.path.join(OUT_DIR, "schedule.md")
    with open(schedule_path, "w", encoding="utf-8") as f:
        f.write("\n".join(schedule_lines) + "\n")

    print(f"\nDone! Generated {total} posts across 30 days in {OUT_DIR}")


if __name__ == "__main__":
    generate()
