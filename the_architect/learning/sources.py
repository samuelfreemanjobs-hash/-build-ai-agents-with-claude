"""Headline source collectors for daily swipe learning."""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen

USER_AGENT = (
    "Mozilla/5.0 (compatible; TheArchitectBot/1.0; +https://github.com/samuelfreemanjobs-hash/-build-ai-agents-with-claude)"
)


@dataclass
class SourceResult:
    source: str
    headlines: list[str]
    fetched_live: bool
    error: str | None = None
    meta: dict[str, Any] | None = None


class HeadlineSource(ABC):
    name: str
    display_name: str

    @abstractmethod
    def collect(self, *, limit: int = 20) -> SourceResult:
        ...


def _fetch_url(url: str, *, timeout: int = 15) -> str | None:
    try:
        req = Request(url, headers={"User-Agent": USER_AGENT})
        with urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except (URLError, OSError, TimeoutError, ValueError):
        return None


def _parse_rss_titles(xml_text: str, *, limit: int) -> list[str]:
    titles: list[str] = []
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return titles

    for item in root.iter("item"):
        title_el = item.find("title")
        if title_el is not None and title_el.text:
            t = title_el.text.strip()
            if len(t) >= 12:
                titles.append(t)
        if len(titles) >= limit:
            break

    if not titles:
        for entry in root.iter("{http://www.w3.org/2005/Atom}entry"):
            title_el = entry.find("{http://www.w3.org/2005/Atom}title")
            if title_el is not None and title_el.text:
                t = title_el.text.strip()
                if len(t) >= 12:
                    titles.append(t)
            if len(titles) >= limit:
                break

    return titles


def _parse_html_titles(html: str, *, limit: int) -> list[str]:
    """Extract headline-like text from common CMS patterns."""
    patterns = [
        r'<h[23][^>]*class="[^"]*(?:headline|title|entry-title)[^"]*"[^>]*>([^<]+)</h[23]>',
        r'<a[^>]*class="[^"]*(?:headline|story|link)[^"]*"[^>]*>([^<]{20,200})</a>',
        r'data-vars-headline="([^"]{20,200})"',
    ]
    seen: set[str] = set()
    titles: list[str] = []
    for pat in patterns:
        for match in re.finditer(pat, html, re.I):
            t = re.sub(r"\s+", " ", match.group(1)).strip()
            key = t.lower()
            if key not in seen and len(t) >= 15:
                seen.add(key)
                titles.append(t)
            if len(titles) >= limit:
                return titles
    return titles


class RssHeadlineSource(HeadlineSource):
    def __init__(self, name: str, display_name: str, feed_url: str, fallback: list[str]) -> None:
        self.name = name
        self.display_name = display_name
        self.feed_url = feed_url
        self.fallback = fallback

    def collect(self, *, limit: int = 20) -> SourceResult:
        xml = _fetch_url(self.feed_url)
        if xml:
            titles = _parse_rss_titles(xml, limit=limit)
            if titles:
                return SourceResult(
                    source=self.name,
                    headlines=titles[:limit],
                    fetched_live=True,
                    meta={"feed_url": self.feed_url},
                )
        return SourceResult(
            source=self.name,
            headlines=self.fallback[:limit],
            fetched_live=False,
            error="Feed unavailable; using curated seed library",
            meta={"feed_url": self.feed_url, "seed_count": len(self.fallback)},
        )


# Buzzhead = BuzzFeed-style viral headline psychology (curiosity gap, listicles, FOMO)
BUZZFEED_FALLBACK = [
    "33 Things That'll Make You Say 'Wait, That's Genius'",
    "We Tried Every Viral TikTok Recipe So You Don't Have To",
    "17 Photos That Prove 2026 Already Won the Internet",
    "People Are Sharing The One Text That Changed Their Relationship",
    "This $12 Amazon Find Has 40,000 Five-Star Reviews For A Reason",
    "57 Costumes That've Already Won Halloween, And It Literally Hasn't Even Happened Yet",
    "I Asked 12 Therapists The One Question They Wish Clients Would Ask",
    "The Creeeeeeeeepiest Places On The Internet Has To Offer RN",
    "Only True '90s Kids Will Get More Than 20 On This Quiz",
    "Here's What Happens When You Stop Saying Sorry For 30 Days",
    "21 Small Habits That Quietly Ruin Your Mornings",
    "We Ranked Every Fast-Food Fry And The Results Started A War",
    "9 Red Flags You're Ignoring Because They're 'Not That Bad'",
    "This Woman Documented Her No-Buy Year And The Plot Twist At Month 8",
    "14 Conversations That Ended Friendships — And The Line That Did It",
    "Scientists Found A Pattern In Happy Couples And It's Not What You Think",
    "The Internet Can't Stop Talking About This 4-Ingredient Dinner",
    "I Lived Like A Billionaire For A Week On $200",
    "28 Things Under $25 That'll Upgrade Your Life Immediately",
    "Everyone's Debating This One Interview Answer And I Have Thoughts",
]

COSMO_FALLBACK = [
    "What Smart Women Get Wrong About Texting Him Back",
    "The One Thing Confident Women Never Apologize For",
    "7 Signs He's Emotionally Available (Not Just Saying He Is)",
    "Why High-Achieving Women Pick The Wrong Men — And How To Stop",
    "The Text That Makes Him Chase Without Playing Games",
    "What Your Attachment Style Says About Your Dating Patterns",
    "5 Boundaries That Make You More Attractive, Not Less",
    "The Morning Habit That Changes How Men Treat You",
    "Are You Dating His Potential Or His Reality?",
    "What To Say When He Pulls Away (Without Seeming Desperate)",
    "The Confidence Trick That Works Better Than Playing Hard To Get",
    "Why Being 'Low Maintenance' Is Costing You Respect",
    "3 Questions To Ask On Date Three That Reveal Everything",
    "The Red Flag Women Ignore Because He's 'So Sweet'",
    "How To Know If He's The One — Or Just The Next One",
    "What Happens When You Stop Chasing And Start Choosing",
    "The Breakup Recovery Timeline Nobody Talks About",
    "Why Your Best Friend Sees What You Can't In Your Relationship",
    "The Sex Question That Deepens Intimacy Overnight",
    "10 Things Emotionally Mature Men Do Differently On Apps",
]

ENQUIRER_FALLBACK = [
    "Insider: The Real Reason They Split — And It Wasn't What You Think",
    "Shocking Secret Behind Hollywood's Biggest Comeback",
    "What He Never Told Her — And Why It Destroyed Everything",
    "Sources Say: The Truth About The Feud Nobody Saw Coming",
    "Exclusive: The Night Everything Changed For America's Sweetheart",
    "The Hidden Health Crisis No One In The Inner Circle Will Discuss",
    "Revealed: What Really Happened Behind Closed Doors",
    "They Tried To Bury This Story — Here's What Leaked",
    "The $50 Million Secret That Could Topple An Empire",
    "Witness Speaks: 'I Saw What They Did That Night'",
    "The Marriage That Looked Perfect — Until The Cameras Stopped",
    "Inside The Deal That Shocked Even Industry Insiders",
    "What The Autopsy Report Really Shows — Expert Weighs In",
    "The Text Message That Ended A 20-Year Friendship",
    "Scandal Exposed: The Cover-Up That Took Years To Unravel",
    "Who Benefits? The Motive Behind The Sudden Disappearance",
    "The Last Person Anyone Suspected — Now Under Investigation",
    "Family Breaks Silence: 'We Should Have Seen The Signs'",
    "The Real Reason For The Sudden Weight Loss — Doctors Stunned",
    "Behind The Smile: What Crew Members Won't Say On Record",
]

PROVEN_FALLBACK = [
    "They Laughed When I Sat Down at the Piano — But When I Started to Play!",
    "Do You Make These Mistakes in English?",
    "How to Win Friends and Influence People",
    "At 60 Miles an Hour the Loudest Noise in This New Rolls-Royce Comes from the Electric Clock",
    "Read 300 Business Magazines in 30 Minutes",
    "The Lazy Man's Way to Riches",
    "Burn Disease Out of Your Body",
    "New Miracle Drug Discovered by Bulgarian Scientist",
    "What Everybody Ought to Know About This Stock and Bond Business",
    "How a Strange Accident Saved Me from Baldness",
    "The Secret of Making People Like You",
    "Who Else Wants a Whiter Wash — With No Hard Work?",
    "How I Improved My Memory in One Evening",
    "Discover the Fortune That Lies Hidden in Your Salary",
    "Give Me 5 Days and I'll Give You a Magnetic Personality",
    "The Most Comforting Words a Man Can Hear When He's Afraid",
    "Why Some Foods 'Explode' in Your Stomach",
    "How a 'Fool Stunt' Made Me a Star Salesman",
    "The Amazing Money-Making Secret of a Desperate Nerd from Georgia",
    "Announcing... The New Edition of the Encyclopedia That Makes It Fun to Learn Things",
]

SALESLETTERS_FALLBACK = [
    "Announcing the Only Sales Letter System That Diagnoses Your Market Before You Write Word One",
    "How to Cut Your Tax Bill by 30% Without Changing a Thing About Your Business",
    "The $2.3 Million Marketing Mistake Almost Every Business Owner Makes",
    "New Method Lets Small Businesses Generate Enterprise-Level Leads for Under $500/Month",
    "Free Report Reveals the 4 U's Formula Behind Headlines That Outpull Control by 300%",
    "What Will You Do When Your Personal Assets Are Seized?",
    "Astonishing Sex Secrets of a Desperate Nerd from Pomona",
    "Double Your Business in 90 Days — Or We Work for Free",
    "The Shocking Truth About Advertising — Revealed in Lost Manuscripts from the 1920s",
    "If You Can Write a Simple Letter, You Can Make $10,000 a Month from Home",
    "Warning: Do Not Read This Unless You Want to Retire 10 Years Early",
    "The One-Legged Golfer's Secret to Outdriving Pros Half His Age",
    "I'll Pay You $10 for Every Word You Read in This Letter",
    "Discover the Hidden Asset Sitting in Your Customer List Right Now",
    "Why Gurus Panic When You Learn This One Distinction",
    "The 47-Word Headline That Generated $4.2 Million in 18 Months",
    "How to Write a Sales Letter That Sells Even When You're Not There",
    "The Stand-In-Line Sales Letter That Mailed for 7 Years Straight",
    "What Never to Say in a Sales Letter (And What to Say Instead)",
    "Your Complete Sales Letter Battle Plan — Delivered in 5 Minutes, Free",
]


def all_sources() -> list[HeadlineSource]:
    return [
        RssHeadlineSource(
            "buzzfeed",
            "Buzzhead (BuzzFeed-style)",
            "https://www.buzzfeed.com/index.xml",
            BUZZFEED_FALLBACK,
        ),
        RssHeadlineSource(
            "cosmopolitan",
            "Cosmopolitan",
            "https://www.cosmopolitan.com/rss/all.xml/",
            COSMO_FALLBACK,
        ),
        RssHeadlineSource(
            "national_enquirer",
            "National Enquirer",
            "https://www.nationalenquirer.com/feed/",
            ENQUIRER_FALLBACK,
        ),
        RssHeadlineSource(
            "proven_headlines",
            "Proven Headlines (DR classics)",
            "https://swiped.co/feed/",
            PROVEN_FALLBACK,
        ),
        RssHeadlineSource(
            "salesletters",
            "Sales Letters (proven DR)",
            "https://www.salesletters.com/feed/",
            SALESLETTERS_FALLBACK,
        ),
    ]


def get_source(name: str) -> HeadlineSource | None:
    for src in all_sources():
        if src.name == name:
            return src
    return None
