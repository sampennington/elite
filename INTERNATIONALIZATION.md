# Internationalization (i18n) Setup Guide

## Overview

Your website now supports 4 languages:
- 🇬🇧 English (en) - Default
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)
- 🇩🇪 German (de)

## How It Works

### 1. **Shared Block Structure + Localized Content**

The key design principle:
- **Block structure is SHARED** across all languages
  - When you add/remove blocks in English, it affects all languages
  - Block order, types, and settings are the same everywhere

- **Text content is LOCALIZED** within each block
  - Each language has its own text for titles, descriptions, buttons, etc.
  - Changing Spanish text doesn't affect English text

### 2. **Which Fields Are Localized?**

✅ **Localized** (separate per language):
- Page/Post `title`
- Hero `richText`
- Content block `richText`
- CTA block `richText`
- Post `content`

❌ **NOT Localized** (shared across languages):
- `slug` - URLs stay consistent
- `publishedAt` - Publication date
- `categories` - Category assignments
- Block structure (add/remove/reorder)
- Media uploads
- Block settings (column sizes, etc.)

## Usage

### For Content Editors

1. **Creating Content:**
   - Go to Payload admin at `/admin`
   - Create a page with blocks in English (default)
   - The block structure automatically exists in all languages

2. **Translating Content:**
   - Select locale dropdown at top: `English` → `Spanish`
   - Edit the Spanish text in the same blocks
   - Switch to `French` to add French translations
   - Repeat for all languages

3. **Adding/Removing Blocks:**
   - Only do this in English (default locale)
   - Changes propagate to all languages automatically
   - Then translate the new block's content in each language

### For Website Visitors

- URLs include locale: `/en/about`, `/es/about`, `/fr/about`
- Language auto-detected from browser settings
- Language switcher in header to manually change
- Preference saved in cookie

## Auto-Translation (Optional)

We've included a hook for automatic translation that you can enable:

### Setup Auto-Translation:

1. **Choose a translation service:**
   - Google Cloud Translation API
   - DeepL API
   - OpenAI GPT API
   - Azure Translator
   - LibreTranslate (free, open-source)

2. **Implement the `translateText` function:**
   - Open `src/collections/Pages/hooks/autoTranslate.ts`
   - Replace the placeholder `translateText` function with your API calls
   - Add your API key to `.env`

3. **Enable the hook:**
   ```typescript
   // In src/collections/Pages/index.ts
   import { autoTranslate } from './hooks/autoTranslate' // Uncomment

   hooks: {
     afterChange: [
       revalidatePage,
       autoTranslate, // Uncomment
     ],
   }
   ```

### How Auto-Translation Works:

1. You create/edit content in English (default locale)
2. Hook detects you're saving in English
3. For each other locale (es, fr, de):
   - If field is empty, it auto-translates from English
   - If field already has content, it leaves it unchanged
4. You can then refine the auto-translations manually

### Example: OpenAI Translation

```typescript
// In autoTranslate.ts
async function translateText(text: string, targetLang: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Translate this text to ${targetLang}: ${text}`
      }]
    })
  })

  const data = await response.json()
  return data.choices[0].message.content
}
```

## File Structure

```
src/
├── i18n/
│   └── config.ts                      # Locale configuration
├── middleware.ts                       # Auto-detect language & redirect
├── app/(frontend)/
│   └── [locale]/                      # All routes are locale-aware
│       ├── page.tsx                   # Home page
│       ├── [slug]/page.tsx            # Dynamic pages
│       ├── posts/[slug]/page.tsx      # Blog posts
│       └── search/page.tsx            # Search page
├── collections/
│   └── Pages/
│       └── hooks/
│           └── autoTranslate.ts       # Auto-translation hook
├── components/
│   ├── LanguageSwitcher/              # Language dropdown in header
│   └── Link/index.tsx                 # Locale-aware links
└── blocks/
    ├── Content/config.ts              # richText: localized
    └── CallToAction/config.ts         # richText: localized
```

## Tips

- **Start with English**: Always create your primary content in English first
- **Review auto-translations**: AI translations aren't perfect - always review them
- **Use fallbacks**: If a translation is missing, Payload falls back to English
- **SEO**: Each locale gets its own meta tags via the SEO tab

## Troubleshooting

**Q: Changes in English affect Spanish**
- A: Check that `localized: true` is on text fields, NOT on block arrays

**Q: 404 errors on locale URLs**
- A: Ensure you've created content in that locale in admin panel

**Q: Language switcher doesn't appear**
- A: Check Header component includes `<LanguageSwitcher />`

**Q: Blocks not syncing across languages**
- A: The `layout` field should NOT be localized - only fields within blocks
