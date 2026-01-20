# PRD: YouTube Transcript Downloader

## Overview

A browser extension and/or CLI tool that extracts transcripts from YouTube videos with one click — similar to how Data-Miner extracts structured data from web pages.

---

## Problem Statement

### Current Pain Points

1. **Manual process** — Downloading transcripts requires multiple steps (yt-dlp install, CLI commands, file cleanup)
2. **Format issues** — Raw VTT files contain timestamps, duplicates, and markup that need cleaning
3. **No bulk support** — Can't easily download transcripts from playlists or multiple videos
4. **No integration** — Transcripts don't flow into existing workflows (Sheets, Notion, Airtable)

### Who Has This Problem

- **Directory builders** — Need transcripts for research, competitor analysis, niche validation
- **Content creators** — Repurpose video content into blog posts, social media
- **Researchers** — Analyze video content at scale
- **Marketers** — Extract insights from competitor/industry videos

---

## Solution

### Core Concept

> "Data-Miner for YouTube Transcripts"

One-click transcript extraction that outputs clean, usable text — ready for AI analysis, content repurposing, or archival.

---

## User Stories

### Must Have (P0)

| As a... | I want to... | So that... |
|---------|--------------|------------|
| User | Click a button on any YouTube video to download transcript | I don't need CLI tools or technical knowledge |
| User | Get clean text without timestamps or VTT markup | I can immediately use it for AI prompts or reading |
| User | Choose output format (TXT, MD, JSON) | I can integrate with my workflow |
| User | Download transcripts from videos without captions (auto-generated) | I'm not blocked by missing manual captions |

### Should Have (P1)

| As a... | I want to... | So that... |
|---------|--------------|------------|
| User | Bulk download from a playlist | I can process multiple videos at once |
| User | Export directly to Google Sheets | I can enrich data without leaving my workflow |
| User | Include timestamps as optional metadata | I can reference specific moments |
| User | Choose transcript language | I can work with non-English content |

### Nice to Have (P2)

| As a... | I want to... | So that... |
|---------|--------------|------------|
| User | Auto-summarize transcript with AI | I get key points without reading everything |
| User | Extract chapters/sections | I can navigate long videos |
| User | Queue multiple videos for background processing | I can set it and forget it |
| User | Sync to Notion/Airtable | My research stays organized |

---

## Functional Requirements

### 1. Transcript Extraction

```
Input:  YouTube URL or Video ID
Output: Clean transcript text
```

**Processing Pipeline:**

1. Detect available caption tracks (manual vs auto-generated)
2. Prefer manual captions if available
3. Download caption track
4. Clean output:
   - Remove VTT headers
   - Remove timestamps (or make optional)
   - Remove duplicate lines
   - Strip HTML/markup tags
   - Merge fragmented sentences
5. Output in requested format

### 2. Output Formats

| Format | Structure | Use Case |
|--------|-----------|----------|
| **TXT** | Plain text, paragraphs | Reading, simple storage |
| **MD** | Markdown with title, metadata | Documentation, Obsidian |
| **JSON** | Structured with timestamps | Programmatic access |
| **CSV** | Timestamp, text columns | Spreadsheet analysis |

**Example JSON output:**

```json
{
  "video_id": "Z2vv5PKZuo4",
  "title": "How I Saved 300+ Hours Automating Data Enrichment",
  "channel": "Ship Your Directory",
  "duration": "15:32",
  "language": "en",
  "caption_type": "auto-generated",
  "transcript": [
    {
      "start": 0.0,
      "end": 3.5,
      "text": "You know that data enrichment and data cleaning is the most boring part"
    },
    ...
  ],
  "full_text": "You know that data enrichment..."
}
```

### 3. Browser Extension UI

**Injection Point:** YouTube video page

**UI Elements:**

```
┌─────────────────────────────────────┐
│ 📄 Download Transcript              │
├─────────────────────────────────────┤
│ Format: [TXT ▼]                     │
│ ☐ Include timestamps                │
│ ☐ Include metadata                  │
│                                     │
│ [Download]  [Copy to Clipboard]     │
└─────────────────────────────────────┘
```

**Location Options:**
- Below video (next to Like/Share buttons)
- Browser toolbar popup
- Right-click context menu

### 4. Bulk Processing

**Playlist Mode:**

1. User navigates to YouTube playlist
2. Extension detects playlist
3. Shows "Download All Transcripts" option
4. Processes videos sequentially (rate-limited)
5. Outputs ZIP file or single merged document

**Queue Mode:**

1. User clicks "Add to Queue" on individual videos
2. Queue persists across sessions
3. User clicks "Process Queue" when ready
4. Background processing with progress indicator

---

## Technical Architecture

### Option A: Browser Extension (Recommended for MVP)

```
┌─────────────────┐     ┌─────────────────┐
│  Content Script │────▶│  YouTube Page   │
│  (Injected JS)  │     │  (Caption API)  │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Background     │────▶│  Local Storage  │
│  Service Worker │     │  (Queue, Prefs) │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Download API   │
│  (File output)  │
└─────────────────┘
```

**Pros:**
- No server costs
- Privacy-friendly (all processing local)
- Works offline after video loads

**Cons:**
- Limited by browser APIs
- No background processing when browser closed

### Option B: Hybrid (Extension + Backend)

```
┌─────────────────┐     ┌─────────────────┐
│  Browser Ext    │────▶│  Backend API    │
│  (Trigger)      │     │  (Processing)   │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  yt-dlp         │
                        │  (Extraction)   │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Cloud Storage  │
                        │  (Results)      │
                        └─────────────────┘
```

**Pros:**
- More reliable extraction
- Background processing
- Bulk operations at scale

**Cons:**
- Server costs
- Privacy concerns
- Rate limiting from YouTube

### Option C: CLI Tool (Power Users)

Wrap yt-dlp with smart defaults:

```bash
yt-transcript https://youtube.com/watch?v=VIDEO_ID
yt-transcript --playlist https://youtube.com/playlist?list=PLAYLIST_ID
yt-transcript --format json --timestamps VIDEO_ID
```

---

## Data Model

### Transcript Record

```typescript
interface TranscriptRecord {
  id: string;                    // UUID
  videoId: string;               // YouTube video ID
  title: string;                 // Video title
  channel: string;               // Channel name
  channelId: string;             // Channel ID
  duration: number;              // Seconds
  language: string;              // ISO 639-1
  captionType: 'manual' | 'auto';
  extractedAt: Date;
  segments: TranscriptSegment[];
  fullText: string;              // Concatenated, cleaned
  wordCount: number;
  metadata?: {
    description?: string;
    tags?: string[];
    viewCount?: number;
    publishedAt?: Date;
  };
}

interface TranscriptSegment {
  start: number;                 // Seconds
  end: number;                   // Seconds
  text: string;                  // Cleaned text
}
```

---

## MVP Scope

### Phase 1: Chrome Extension (2-3 weeks)

**Features:**
- [ ] Single video transcript download
- [ ] TXT and MD output formats
- [ ] Clean text (no timestamps by default)
- [ ] Copy to clipboard
- [ ] Basic UI overlay on YouTube

**Tech Stack:**
- Chrome Extension Manifest V3
- TypeScript
- YouTube caption API (client-side)

### Phase 2: Enhanced Features (2 weeks)

- [ ] JSON output with timestamps
- [ ] Language selection
- [ ] Playlist detection and bulk download
- [ ] Export to Google Sheets (OAuth)

### Phase 3: Power Features (3 weeks)

- [ ] Queue system with persistence
- [ ] AI summarization (OpenAI/Claude API)
- [ ] Chapter extraction
- [ ] Firefox support

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to transcript | < 5 seconds | From click to download |
| Transcript accuracy | > 95% | vs manual verification |
| User retention | > 40% WAU | Weekly active users |
| Export success rate | > 99% | Successful downloads |

---

## Competitive Analysis

| Tool | Pros | Cons |
|------|------|------|
| **yt-dlp** | Powerful, reliable | CLI only, technical |
| **Downsub.com** | Web-based, easy | Ads, limited formats |
| **YouTube native** | Built-in | Copy-paste only, no export |
| **Tactiq** | Good UX | Subscription, meeting-focused |

**Our Differentiation:**
- One-click simplicity (like Data-Miner)
- Clean output by default
- Bulk processing
- Developer-friendly formats (JSON)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| YouTube API changes | High | Use multiple extraction methods, fallback to yt-dlp backend |
| Rate limiting | Medium | Queue system, exponential backoff |
| Copyright concerns | Low | Only extract user-facing captions, no video download |
| Chrome Web Store rejection | Medium | Follow policies, no monetization initially |

---

## Open Questions

1. **Monetization** — Freemium? One-time purchase? Open source?
2. **Branding** — Name ideas: TranscriptGrab, YT Extract, CaptionMiner
3. **AI Integration** — Built-in summarization or leave to user's tools?
4. **Platform priority** — Chrome first, then Firefox? Or both simultaneously?

---

## Next Steps

1. [ ] Validate demand (post in Ship Your Directory community)
2. [ ] Build Chrome extension MVP
3. [ ] Beta test with 10-20 users
4. [ ] Iterate based on feedback
5. [ ] Launch on Chrome Web Store

---

## Appendix: Sample CLI Wrapper

```bash
#!/bin/bash
# yt-transcript - Simple YouTube transcript downloader

VIDEO_URL=$1
OUTPUT_FORMAT=${2:-txt}
INCLUDE_TIMESTAMPS=${3:-false}

# Download transcript
yt-dlp --write-auto-sub --sub-lang en --skip-download \
  --sub-format vtt -o "/tmp/transcript" "$VIDEO_URL" 2>/dev/null

# Clean and output
if [ "$OUTPUT_FORMAT" = "txt" ]; then
  sed -e '/^WEBVTT/d' -e '/^Kind:/d' -e '/^Language:/d' \
      -e '/^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/d' \
      -e '/align:start/d' -e '/^$/d' -e 's/<[^>]*>//g' \
      /tmp/transcript.en.vtt | uniq
fi
```
