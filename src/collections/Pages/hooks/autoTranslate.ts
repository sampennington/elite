import type { CollectionAfterChangeHook } from 'payload'

/**
 * Auto-translate hook for Pages collection
 *
 * This hook automatically translates localized fields when content is saved in the default locale.
 *
 * To enable auto-translation:
 * 1. Uncomment the translation service of your choice below
 * 2. Add your API key to .env
 * 3. Implement the translateText function
 */

// Example translation function (implement with your preferred service)
async function translateText(text: string, targetLang: string): Promise<string> {
  // TODO: Implement translation using your preferred service:
  // - Google Cloud Translation API
  // - DeepL API
  // - OpenAI GPT API
  // - Azure Translator

  // For now, return placeholder
  return `[${targetLang.toUpperCase()}] ${text}`
}

// Recursively translate lexical editor content
function translateLexicalContent(content: any, targetLang: string): Promise<any> {
  // TODO: Parse lexical JSON structure and translate text nodes
  // This is a placeholder - you'll need to traverse the lexical tree
  return Promise.resolve(content)
}

export const autoTranslate: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  // Only run on create/update operations
  if (operation !== 'create' && operation !== 'update') {
    return doc
  }

  // Only run if saving in the default locale (English)
  if (req.locale !== 'en') {
    return doc
  }

  // Get all available locales from config
  const locales = ['es', 'fr', 'de'] // Exclude 'en' as it's the source

  try {
    // Auto-translate title
    if (doc.title) {
      for (const locale of locales) {
        // Only translate if target locale is empty
        if (!doc.title[locale]) {
          doc.title[locale] = await translateText(doc.title.en || doc.title, locale)
        }
      }
    }

    // Auto-translate hero richText
    if (doc.hero?.richText) {
      for (const locale of locales) {
        if (!doc.hero.richText[locale]) {
          doc.hero.richText[locale] = await translateLexicalContent(
            doc.hero.richText.en || doc.hero.richText,
            locale
          )
        }
      }
    }

    // Auto-translate content blocks
    if (doc.layout && Array.isArray(doc.layout)) {
      for (const block of doc.layout) {
        // Content block with richText
        if (block.blockType === 'content' && block.columns) {
          for (const column of block.columns) {
            if (column.richText) {
              for (const locale of locales) {
                if (!column.richText[locale]) {
                  column.richText[locale] = await translateLexicalContent(
                    column.richText.en || column.richText,
                    locale
                  )
                }
              }
            }
          }
        }

        // CTA block with richText
        if (block.blockType === 'cta' && block.richText) {
          for (const locale of locales) {
            if (!block.richText[locale]) {
              block.richText[locale] = await translateLexicalContent(
                block.richText.en || block.richText,
                locale
              )
            }
          }
        }
      }
    }

    return doc
  } catch (error) {
    console.error('Auto-translation error:', error)
    // Don't fail the save if translation fails
    return doc
  }
}
