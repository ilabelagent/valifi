const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * TranslationBot provides a stubbed translation service for a few
 * common languages.  The translate() method will look up a handful
 * of known phrases; if a translation is not found it returns the
 * original text prefixed by the target language code.  This bot
 * illustrates how language services might be wired into the
 * modular architecture.
 */
class TranslationBot extends KingdomBot {
  constructor(core) {
    super(core);
    // Initialise supported languages and a simple phrase dictionary
    if (!TranslationBot.languages) {
      TranslationBot.languages = ['en', 'es', 'fr', 'de', 'zh'];
      TranslationBot.dictionary = {
        hello: { en: 'hello', es: 'hola', fr: 'bonjour', de: 'hallo', zh: '你好' },
        goodbye: { en: 'goodbye', es: 'adiós', fr: 'au revoir', de: 'auf wiedersehen', zh: '再见' },
        thank_you: { en: 'thank you', es: 'gracias', fr: 'merci', de: 'danke', zh: '谢谢' },
      };
    }
  }
  async initialize() {
    this.logDivineAction('Translation Bot Initialised');
    return true;
  }
  async execute(params = {}) {
    const action = params.action || 'status';
    switch (action) {
      case 'translate':
        return this.translate(params);
      case 'languages':
        return this.getLanguages();
      default:
        return { success: false, message: 'Unknown translation action.' };
    }
  }
  /**
   * Translate a given text into a target language.  Attempts to
   * match the text against our dictionary keys.  The dictionary
   * keys are lowercased and spaces replaced with underscores.  If
   * a translation is found, it is returned.  Otherwise the text
   * itself is returned prefixed with the target language code.
   */
  translate({ text, targetLang }) {
    if (!text || !targetLang) {
      return { success: false, message: 'text and targetLang are required.' };
    }
    const lang = targetLang.toLowerCase();
    if (!TranslationBot.languages.includes(lang)) {
      return { success: false, message: `Unsupported language: ${lang}` };
    }
    const key = text.trim().toLowerCase().replace(/\s+/g, '_');
    const entry = TranslationBot.dictionary[key];
    let translated;
    if (entry && entry[lang]) {
      translated = entry[lang];
    } else {
      translated = `${lang}:${text}`;
    }
    return { success: true, original: text, translated, language: lang };
  }
  /**
   * Return the list of supported languages.
   */
  getLanguages() {
    return { success: true, languages: TranslationBot.languages };
  }
  getCapabilities() {
    return {
      translation: ['translate', 'languages'],
    };
  }
}
module.exports = TranslationBot;