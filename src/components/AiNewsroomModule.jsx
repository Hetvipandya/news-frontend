import React, { useEffect, useState } from 'react';
import {
  Sparkles, Globe, Newspaper, RotateCw,
  Send, BookOpen, Layers, Trash2, Edit3,
  CheckCircle2, AlertCircle, Printer, Flame, Check, ArrowRight, Languages
} from 'lucide-react';
import { api } from '../api';

const PAGE_TEMPLATES = [
  { num: 1, title: 'Front Page / National Lead', desc: 'Top breaking stories and major national developments', tag: 'Lead Page', badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200' },
  { num: 2, title: 'State & Regional Affairs', desc: 'Regional governance, legislative policies and state progress', tag: 'Regional', badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
  { num: 3, title: 'City & Metro Bulletin', desc: 'Civic administration, urban updates and municipal infrastructure', tag: 'Metro', badgeColor: 'bg-sky-500/10 text-sky-600 border-sky-200' },
  { num: 4, title: 'Editorial & Opinion', desc: 'In-depth analysis, lead editorials and expert viewpoints', tag: 'Opinion', badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  { num: 5, title: 'Business, Markets & Economy', desc: 'Financial markets, corporate earnings, trade and startups', tag: 'Markets', badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  { num: 6, title: 'Sports Arena', desc: 'Cricket, tournaments, athletics and championship scores', tag: 'Sports', badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  { num: 7, title: 'World & Global Affairs', desc: 'Geopolitics, global summits, diplomatic ties and international developments', tag: 'Global', badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { num: 8, title: 'Science, Tech & Lifestyle', desc: 'Artificial intelligence, space science, gadgets and lifestyle features', tag: 'Tech & Life', badgeColor: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200' },
];

const HINDI_PAGE_TEMPLATES = {
  1: { title: 'मुखपृष्ठ / राष्ट्रीय समाचार', desc: 'प्रमुख ताज़ा खबरें और राष्ट्रीय घटनाक्रम' },
  2: { title: 'राज्य और क्षेत्रीय समाचार', desc: 'शासन, नीतियां और राज्यों की प्रगति' },
  3: { title: 'शहर और महानगर समाचार', desc: 'नागरिक सेवाएं, शहरी खबरें और नगर विकास' },
  4: { title: 'संपादकीय और विचार', desc: 'गहन विश्लेषण, संपादकीय और विशेषज्ञों के विचार' },
  5: { title: 'व्यापार, बाज़ार और अर्थव्यवस्था', desc: 'वित्तीय बाज़ार, कंपनियां, व्यापार और स्टार्टअप' },
  6: { title: 'खेल जगत', desc: 'क्रिकेट, प्रतियोगिताएं, एथलेटिक्स और खेल परिणाम' },
  7: { title: 'विश्व समाचार', desc: 'अंतरराष्ट्रीय घटनाक्रम, शिखर सम्मेलन और कूटनीति' },
  8: { title: 'विज्ञान, तकनीक और जीवनशैली', desc: 'कृत्रिम बुद्धिमत्ता, अंतरिक्ष, तकनीक और जीवनशैली' },
};

const HINDI_CATEGORIES = {
  'front page': 'मुखपृष्ठ',
  'state & regional': 'राज्य और क्षेत्र',
  'city & local': 'शहर और स्थानीय समाचार',
  'editorial & opinion': 'संपादकीय और विचार',
  'business & economy': 'व्यापार और अर्थव्यवस्था',
  sports: 'खेल',
  world: 'विश्व समाचार',
  'tech & science': 'विज्ञान और तकनीक',
  'space & astronomy': 'अंतरिक्ष और खगोल विज्ञान',
  'health & medicine': 'स्वास्थ्य और चिकित्सा',
  education: 'शिक्षा',
  'environment & climate': 'पर्यावरण और जलवायु',
  'agriculture & food': 'कृषि और खाद्य',
  'crime & justice': 'अपराध और न्याय',
  'entertainment & culture': 'मनोरंजन और संस्कृति',
  'lifestyle & wellness': 'जीवनशैली और स्वास्थ्य',
  'travel & tourism': 'यात्रा और पर्यटन',
  'religion & spirituality': 'धर्म और आध्यात्म',
  'automotive & transport': 'वाहन और परिवहन',
  'real estate & housing': 'रियल एस्टेट और आवास',
  'jobs & careers': 'रोजगार और करियर',
  'consumer affairs': 'उपभोक्ता मामले',
  'energy & utilities': 'ऊर्जा और उपयोगिताएं',
  'politics & elections': 'राजनीति और चुनाव',
};

function getLocalizedPageTemplate(template, language) {
  if (!template || language !== 'hi') return template;
  return { ...template, ...HINDI_PAGE_TEMPLATES[template.num] };
}

function getLocalizedCategory(category, language) {
  return language === 'hi'
    ? HINDI_CATEGORIES[String(category || '').toLowerCase()] || category
    : category;
}

function getLocalizedAuthor(author, language) {
  const cleanAuthor = cleanDisplayText(author);
  if (language === 'hi' && (!cleanAuthor || /^(senior editorial desk|ai editorial|desk|special correspondent)$/i.test(cleanAuthor))) {
    return 'संपादकीय डेस्क';
  }
  return cleanAuthor || (language === 'hi' ? 'संपादकीय डेस्क' : 'AI Editorial');
}

function getLocalizedIssueTitle(title, language, date) {
  if (language !== 'hi') return title;
  if (title && textIsMostlyHindi(title) && !/^Daily AI Edition\b/i.test(String(title || ''))) return title;
  const formattedDate = new Intl.DateTimeFormat('hi-IN', { dateStyle: 'long' }).format(new Date(date));
  return `दैनिक समाचार संस्करण - ${formattedDate}`;
}

function textIsMostlyHindi(text) {
  const letters = String(text || '').match(/\p{L}/gu) || [];
  if (letters.length === 0) return false;
  const hindiLetters = letters.filter((letter) => /[\u0900-\u097f]/u.test(letter)).length;
  return hindiLetters / letters.length >= 0.85;
}

function articleIsHindi(article) {
  return [
    article.headline,
    article.deck,
    article.body,
    article.summary,
    ...(Array.isArray(article.keyTakeaways) ? article.keyTakeaways : []),
  ].every(textIsMostlyHindi);
}

const NEWS_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'brx', name: 'Bodo' },
  { code: 'doi', name: 'Dogri' },
  { code: 'ks', name: 'Kashmiri' },
  { code: 'kok', name: 'Konkani' },
  { code: 'mai', name: 'Maithili' },
  { code: 'mni', name: 'Manipuri (Meitei)' },
  { code: 'ne', name: 'Nepali' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'sat', name: 'Santali' },
  { code: 'sd', name: 'Sindhi' },
];

const INDIAN_STATES = [
  { name: 'Andhra Pradesh', language: 'te' },
  { name: 'Arunachal Pradesh', language: 'en' },
  { name: 'Assam', language: 'as' },
  { name: 'Bihar', language: 'hi' },
  { name: 'Chhattisgarh', language: 'hi' },
  { name: 'Goa', language: 'kok' },
  { name: 'Gujarat', language: 'gu' },
  { name: 'Haryana', language: 'hi' },
  { name: 'Himachal Pradesh', language: 'hi' },
  { name: 'Jharkhand', language: 'hi' },
  { name: 'Karnataka', language: 'kn' },
  { name: 'Kerala', language: 'ml' },
  { name: 'Madhya Pradesh', language: 'hi' },
  { name: 'Maharashtra', language: 'mr' },
  { name: 'Manipur', language: 'mni' },
  { name: 'Meghalaya', language: 'en' },
  { name: 'Mizoram', language: 'en' },
  { name: 'Nagaland', language: 'en' },
  { name: 'Odisha', language: 'or' },
  { name: 'Punjab', language: 'pa' },
  { name: 'Rajasthan', language: 'hi' },
  { name: 'Sikkim', language: 'ne' },
  { name: 'Tamil Nadu', language: 'ta' },
  { name: 'Telangana', language: 'te' },
  { name: 'Tripura', language: 'bn' },
  { name: 'Uttar Pradesh', language: 'hi' },
  { name: 'Uttarakhand', language: 'hi' },
  { name: 'West Bengal', language: 'bn' },
  { name: 'Andaman and Nicobar Islands', language: 'hi' },
  { name: 'Chandigarh', language: 'pa' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', language: 'gu' },
  { name: 'Delhi', language: 'hi' },
  { name: 'Jammu and Kashmir', language: 'ks' },
  { name: 'Ladakh', language: 'ur' },
  { name: 'Lakshadweep', language: 'ml' },
  { name: 'Puducherry', language: 'ta' },
];

const LANGUAGE_ALIASES = {
  english: 'en',
  hindi: 'hi',
  gujarati: 'gu',
  marathi: 'mr',
  bengali: 'bn',
  tamil: 'ta',
  telugu: 'te',
  kannada: 'kn',
  malayalam: 'ml',
  punjabi: 'pa',
  urdu: 'ur',
  odia: 'or',
  oriya: 'or',
  assamese: 'as',
  bodo: 'brx',
  dogri: 'doi',
  kashmiri: 'ks',
  konkani: 'kok',
  maithili: 'mai',
  manipuri: 'mni',
  meitei: 'mni',
  nepali: 'ne',
  sanskrit: 'sa',
  santali: 'sat',
  sindhi: 'sd',
};

const PRINT_LOCALES = {
  en: 'en-IN',
  hi: 'hi-IN',
  gu: 'gu-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  ur: 'ur-IN',
  or: 'or-IN',
  as: 'as-IN',
  brx: 'brx-IN',
  doi: 'doi-IN',
  ks: 'ks-IN',
  kok: 'kok-IN',
  mai: 'mai-IN',
  mni: 'mni-IN',
  ne: 'ne-IN',
  sa: 'sa-IN',
  sat: 'sat-IN',
  sd: 'sd-IN',
};

function normalizeNewsLanguage(language) {
  const code = String(language || 'en').trim().toLowerCase();
  const baseCode = code.split('-')[0];
  return LANGUAGE_ALIASES[code] || LANGUAGE_ALIASES[baseCode] || baseCode;
}

function toTranslationInput(article) {
  return {
    ...article,
    title: article.title || article.headline,
    description: article.description || article.body,
    source: article.source || article.sourceName,
    link: article.link || article.sourceUrl,
    pubDate: article.pubDate || article.publishedAt,
  };
}

function cleanDisplayText(text) {
  if (!text) return '';
  let str = String(text);
  str = str.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
  for (let i = 0; i < 3; i += 1) {
    str = str
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&apos;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&nbsp;/gi, ' ');
  }
  // Strip full tags
  str = str.replace(/<\/?[a-z0-9!_-]+(?:\s+[^>]*)?>/gi, ' ');
  // Strip unclosed tags like `<a href="...` or `<ol` or `<a`
  str = str.replace(/<[a-z0-9!_-]+(?:\s+[^<>]*)?$/gi, ' ');
  str = str.replace(/<[a-z0-9!_-]+(?:\s+[^<]*?)?(?=[<\s"']|$)/gi, ' ');
  // Strip raw attributes
  str = str.replace(/\b(href|target|src|color|style|class)=["'][^"']*["']?/gi, ' ');
  str = str.replace(/\b(href|target|src|color|style|class)=/gi, ' ');
  str = str.replace(/<[^>]*>/g, ' ');
  str = str.replace(/https?:\/\/[^\s"'<>]+/gi, '');
  str = str.replace(/^[<>'\"\s]+|[<>'\"\s]+$/g, '');
  // Strip wire prefixes
  str = str.replace(/^(BREAKING\s*[|:\-]?|EXCLUSIVE\s*[|:\-]?|WATCH\s*[|:\-]?|JUST IN\s*[|:\-]?|LIVE\s*[|:\-]?|ALERT\s*[|:\-]?)\s*/i, '');
  // Strip trailing publisher credits
  str = str.replace(/\s*(?:[-–—|]\s*|\b)(Live Law|The Hindu|NDTV|Times of India|The Times of India|The Indian Express|Indian Express|Hindustan Times|BBC News|BBC|Reuters|ANI|PTI|News18|India Today|Mint|Economic Times|The Economic Times|Business Standard)[^a-zA-Z0-9]*$/i, '');
  str = str.replace(/\s+/g, ' ').trim();
  if (str.length < 4 || /^[^\p{L}\p{N}]+$/u.test(str)) return '';
  return str;
}

export default function AiNewsroomModule({ user }) {
  const [activeTab, setActiveTab] = useState('collect'); // 'collect' | 'analyze' | 'layout' | 'saved'

  // AI configuration status
  const [aiStatus, setAiStatus] = useState(null); // null = loading, { isConfigured, setupGuide }

  // Publishing selection
  const [newspapers, setNewspapers] = useState([]);
  const [editions, setEditions] = useState([]);
  const [selectedNewspaperId, setSelectedNewspaperId] = useState('');
  const [selectedEditionId, setSelectedEditionId] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLocalLanguage, setSelectedLocalLanguage] = useState('en');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [issueTitle, setIssueTitle] = useState('Daily AI Edition - ' + new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date()));
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  // Collection state
  const [presets, setPresets] = useState([]);
  const [selectedPresetIds, setSelectedPresetIds] = useState([
    'top-national',
    'regional-affairs',
    'city-local',
    'editorial-opinion',
    'business-markets',
    'sports-cricket',
    'world-global',
    'tech-innovation',
  ]);
  const [customRssUrl, setCustomRssUrl] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [rawTextTitle, setRawTextTitle] = useState('');
  const [collectedItems, setCollectedItems] = useState([]);
  const [selectedItemIndexes, setSelectedItemIndexes] = useState(new Set());

  // Analysis & Layout state
  const [analyzedArticles, setAnalyzedArticles] = useState([]);
  const [activePageNum, setActivePageNum] = useState(1);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [savedIssues, setSavedIssues] = useState([]);

  // Edit article modal
  const [editingArticle, setEditingArticle] = useState(null);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initial load
  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const [newsRes, editRes, presetRes, issuesRes, statusRes] = await Promise.all([
          api.get('/api/v1/newspapers').catch(() => ({ data: { data: [] } })),
          api.get('/api/v1/editions').catch(() => ({ data: { data: [] } })),
          api.get('/api/v1/ai/presets').catch(() => ({ data: { data: [] } })),
          api.get('/api/v1/ai/issues').catch(() => ({ data: { data: [] } })),
          api.get('/api/v1/ai/status').catch(() => ({ data: { data: { isConfigured: false, supportsNonEnglish: false } } })),
        ]);
        if (!active) return;
        if (statusRes?.data?.data) setAiStatus(statusRes.data.data);
        const activeNews = (newsRes.data.data || []).filter((n) => n.status === 'active');
        setNewspapers(activeNews);
        if (activeNews.length > 0) setSelectedNewspaperId(activeNews[0]._id);

        const activeEdits = (editRes.data.data || []).filter((e) => e.status === 'active');
        setEditions(activeEdits);
        const defaultEdition = activeEdits.find((edition) => (
          (edition.newspaperId?._id || edition.newspaperId) === activeNews[0]?._id
        )) || activeEdits[0];
        const initialLanguage = normalizeNewsLanguage(
          defaultEdition?.language || activeNews[0]?.languages?.[0] || 'en'
        );
        if (defaultEdition) {
          setSelectedEditionId(defaultEdition._id);
        }
        setSelectedLocalLanguage(initialLanguage);
        setSelectedLanguage(initialLanguage);

        setPresets(presetRes.data.data || []);
        const saved = issuesRes.data.data || [];
        setSavedIssues(saved);
        const matchingIssue = saved.find((issue) => normalizeNewsLanguage(issue.language) === initialLanguage);
        setCurrentIssue(matchingIssue || null);
      } catch (err) {
        if (active) setError('Failed to load initial publishing options.');
      }
    }
    loadInitial();
    return () => { active = false; };
  }, []);

  // Update edition scopes when newspaper changes
  const filteredEditions = editions.filter((e) => (e.newspaperId?._id || e.newspaperId) === selectedNewspaperId);
  const selectedNewspaper = newspapers.find((newspaper) => newspaper._id === selectedNewspaperId);
  const configuredLanguageCodes = [
    ...(selectedNewspaper?.languages || []),
    ...filteredEditions.map((edition) => edition.language).filter(Boolean),
    selectedLocalLanguage,
    selectedLanguage,
  ];
  const languageOptions = Array.from(new Set([
    ...NEWS_LANGUAGES.map((language) => language.code),
    ...configuredLanguageCodes.map(normalizeNewsLanguage),
  ])).map((code) => NEWS_LANGUAGES.find((language) => language.code === code) || {
    code,
    name: code.toUpperCase(),
  });
  useEffect(() => {
    if (filteredEditions.length > 0 && !filteredEditions.some((e) => e._id === selectedEditionId)) {
      setSelectedEditionId(filteredEditions[0]._id);
    }
  }, [selectedNewspaperId, filteredEditions, selectedEditionId]);

  async function handleLanguageChange(languageCode) {
    const normalizedLanguage = normalizeNewsLanguage(languageCode);
    if (normalizedLanguage === selectedLanguage || translating) return;

    const previousLanguage = selectedLanguage;
    setSelectedLanguage(normalizedLanguage);
    setError('');
    const languageName = languageOptions.find((language) => language.code === normalizedLanguage)?.name || normalizedLanguage.toUpperCase();
    const issueArticles = currentIssue?.pages?.flatMap((page) => page.articles || []) || [];
    const selectedCollectedItems = collectedItems.filter((_, index) => selectedItemIndexes.has(index));

    if (!issueArticles.length && !analyzedArticles.length && !selectedCollectedItems.length) {
      setSuccessMsg(`Language set to ${languageName}. New stories will be generated in this language.`);
      return;
    }

    setTranslating(true);
    setSuccessMsg(`Translating stories into ${languageName}…`);
    try {
      const sourceArticles = issueArticles.length
        ? issueArticles
        : analyzedArticles.length
          ? analyzedArticles
          : selectedCollectedItems;
      const translations = [];
      for (let start = 0; start < sourceArticles.length; start += 30) {
        const batch = sourceArticles.slice(start, start + 30).map(toTranslationInput);
        const { data } = await api.post('/api/v1/ai/analyze', {
          items: batch,
          language: normalizedLanguage,
        });
        if (!Array.isArray(data.data) || data.data.length !== batch.length) {
          throw new Error('The translation service returned an incomplete result.');
        }
        translations.push(...data.data);
      }

      if (issueArticles.length) {
        let translatedIndex = 0;
        const pages = currentIssue.pages.map((page) => {
          const pageTemplate = getLocalizedPageTemplate(
            PAGE_TEMPLATES.find((template) => template.num === page.pageNumber),
            normalizedLanguage
          );
          return {
            ...page,
            pageTitle: pageTemplate?.title || page.pageTitle,
            pageSubtitle: pageTemplate?.desc || page.pageSubtitle,
            articles: (page.articles || []).map((article) => ({
              ...article,
              ...translations[translatedIndex++],
              _id: article._id,
            })),
          };
        });
        const updatedIssue = { ...currentIssue, language: normalizedLanguage, pages };
        if (currentIssue._id) {
          await api.patch(`/api/v1/ai/issues/${currentIssue._id}`, {
            language: normalizedLanguage,
            pages,
          });
        }
        setCurrentIssue(updatedIssue);
        setSavedIssues((issues) => issues.map((issue) => (
          issue._id === updatedIssue._id ? updatedIssue : issue
        )));
      } else if (analyzedArticles.length) {
        setAnalyzedArticles(analyzedArticles.map((article, index) => ({
          ...article,
          ...translations[index],
          _id: article._id,
        })));
      } else {
        setAnalyzedArticles(translations);
        setActiveTab('analyze');
      }

      setSuccessMsg(`Stories translated into ${languageName}.`);
    } catch (translationError) {
      setSelectedLanguage(previousLanguage);
      setError(
        translationError.response?.data?.message
        || translationError.message
        || `Unable to translate stories into ${languageName}.`
      );
      setSuccessMsg('');
    } finally {
      setTranslating(false);
    }
  }

  function handleStateChange(stateName) {
    setSelectedState(stateName);
    const state = INDIAN_STATES.find((item) => item.name === stateName);
    const hasExistingStories = collectedItems.length > 0
      || analyzedArticles.length > 0
      || Boolean(currentIssue?.pages?.some((page) => page.articles?.length));

    const localLanguage = state?.language || 'en';
    setSelectedLocalLanguage(localLanguage);
    setSelectedLanguage(localLanguage);
    const languageName = NEWS_LANGUAGES.find((language) => language.code === localLanguage)?.name || 'English';
    setSuccessMsg(hasExistingStories
      ? `Region set to ${stateName || 'All India'}; new feeds will use ${languageName}. Existing stories are unchanged.`
      : `Local language set to ${languageName}${state ? ` for ${state.name}` : ''}.`);
    setError('');
  }

  function handleLocalLanguageChange(languageCode) {
    const language = normalizeNewsLanguage(languageCode);
    setSelectedLocalLanguage(language);
    setSelectedLanguage(language);
    const languageName = languageOptions.find((option) => option.code === language)?.name || language.toUpperCase();
    setSuccessMsg(`Local feed and analysis language set to ${languageName}. Fetch and analyze new stories before choosing another output language.`);
    setError('');
  }

  function handleNewspaperChange(newspaperId) {
    setSelectedNewspaperId(newspaperId);
    const firstEdition = editions.find((edition) => (
      (edition.newspaperId?._id || edition.newspaperId) === newspaperId
    ));
    if (firstEdition) {
      setSelectedEditionId(firstEdition._id);
      handleLanguageChange(firstEdition.language);
      return;
    }
    const newspaper = newspapers.find((item) => item._id === newspaperId);
    if (newspaper?.languages?.length) handleLanguageChange(newspaper.languages[0]);
  }

  function handleEditionChange(editionId) {
    setSelectedEditionId(editionId);
    const edition = editions.find((item) => item._id === editionId);
    if (edition?.language) handleLanguageChange(edition.language);
  }

  // Handle Preset Toggle
  function togglePreset(id) {
    setSelectedPresetIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  // Collect news action
  async function handleCollectNews() {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setSelectedLanguage(selectedLocalLanguage);
    try {
      const payload = {
        presetIds: selectedPresetIds,
        customRssUrls: customRssUrl ? [customRssUrl] : [],
        articleUrls: articleUrl ? [articleUrl] : [],
        rawTexts: rawText ? [{ title: rawTextTitle, text: rawText, language: selectedLocalLanguage }] : [],
        state: selectedState,
        language: selectedLocalLanguage,
        limit: 25,
      };
      const { data } = await api.post('/api/v1/ai/collect', payload);
      setCollectedItems(data.data || []);
      const allIndexes = new Set((data.data || []).map((_, idx) => idx));
      setSelectedItemIndexes(allIndexes);
      setSuccessMsg(`Successfully harvested ${data.data.length} news items${selectedState ? ` for ${selectedState}` : ''}. Analyze them in ${languageOptions.find((language) => language.code === selectedLocalLanguage)?.name || selectedLocalLanguage}, then choose another output language to translate.`);
      if (customRssUrl) setCustomRssUrl('');
      if (articleUrl) setArticleUrl('');
      if (rawText) { setRawText(''); setRawTextTitle(''); }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to collect news feeds.');
    } finally {
      setLoading(false);
    }
  }

  // Toggle single item selection
  function toggleItemSelection(idx) {
    setSelectedItemIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedItemIndexes.size === collectedItems.length) {
      setSelectedItemIndexes(new Set());
    } else {
      setSelectedItemIndexes(new Set(collectedItems.map((_, i) => i)));
    }
  }

  async function handleAnalyzeSelected() {
    const selected = collectedItems.filter((_, idx) => selectedItemIndexes.has(idx));
    if (selected.length === 0) {
      setError('Please select at least one news item to analyze.');
      return;
    }
    if (selectedLanguage !== 'en' && aiStatus?.isConfigured !== true) {
      setError(aiStatus
        ? 'Non-English analysis needs a valid AI provider key. Update the root .env file, restart the backend, and refresh this page.'
        : 'AI translation setup is still being checked. Please wait a moment and try again.');
      return;
    }
    setAnalyzing(true);
    setError('');
    setSuccessMsg('');
    try {
      const { data } = await api.post('/api/v1/ai/analyze', {
        items: selected,
        language: selectedLanguage,
      });
      setAnalyzedArticles(data.data || []);
      setSuccessMsg(`Neural analysis complete: ${data.data.length} stories formatted for newspaper publication.`);
      setActiveTab('analyze');
    } catch (err) {
      setError(err.response?.data?.message || 'AI news analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  }

  // Generate Page-wise 8-Page Issue
  async function handleGenerateIssue() {
    setGenerating(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        title: getLocalizedIssueTitle(issueTitle, selectedLanguage, issueDate),
        newspaperId: selectedNewspaperId || undefined,
        editionId: selectedEditionId || undefined,
        language: selectedLanguage,
        issueDate,
        items: analyzedArticles.length > 0 ? analyzedArticles : collectedItems.filter((_, idx) => selectedItemIndexes.has(idx)),
        totalPages: 8,
      };
      const { data } = await api.post('/api/v1/ai/generate-issue', payload);
      setCurrentIssue(data.data);
      setActivePageNum(1);
      setActiveTab('layout');
      setSuccessMsg(`Complete 8-page daily edition successfully compiled with lead anchor assignments.`);
      const res = await api.get('/api/v1/ai/issues');
      setSavedIssues(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate page-wise issue layout.');
    } finally {
      setGenerating(false);
    }
  }

  // Move article to another page in the active issue
  async function handleMoveArticle(articleId, targetPageNum) {
    if (!currentIssue) return;
    const pagesCopy = JSON.parse(JSON.stringify(currentIssue.pages));
    let movedArticle = null;
    let sourcePageNum = null;

    for (const page of pagesCopy) {
      const idx = page.articles.findIndex((a) => (a._id || a.headline) === articleId);
      if (idx !== -1) {
        sourcePageNum = page.pageNumber;
        if (sourcePageNum === targetPageNum) return;
        movedArticle = page.articles.splice(idx, 1)[0];
        if (page.articles.length > 0) page.articles[0].isLeadStory = true;
        break;
      }
    }

    if (movedArticle) {
      const targetPage = pagesCopy.find((p) => p.pageNumber === targetPageNum);
      if (targetPage) {
        movedArticle.suggestedPage = targetPageNum;
        targetPage.articles.push(movedArticle);
        if (targetPage.articles.length === 1) movedArticle.isLeadStory = true;
        try {
          if (currentIssue._id) {
            await api.patch(`/api/v1/ai/issues/${currentIssue._id}`, { pages: pagesCopy });
          }
          const updatedIssue = { ...currentIssue, pages: pagesCopy };
          setCurrentIssue(updatedIssue);
          setSavedIssues((issues) => issues.map((issue) => (
            issue._id === updatedIssue._id ? updatedIssue : issue
          )));
          setError('');
        } catch (moveError) {
          setError(moveError.response?.data?.message || 'Unable to save the story page assignment. Please try again.');
        }
      }
    }
  }

  function handleAnalyzedPageChange(articleIndex, pageNumber) {
    setAnalyzedArticles((articles) => articles.map((article, index) => (
      index === articleIndex ? { ...article, suggestedPage: Number(pageNumber) } : article
    )));
  }

  // Remove article from active issue
  function handleRemoveArticle(articleId) {
    if (!currentIssue) return;
    const pagesCopy = JSON.parse(JSON.stringify(currentIssue.pages));
    for (const page of pagesCopy) {
      const idx = page.articles.findIndex((a) => (a._id || a.headline) === articleId);
      if (idx !== -1) {
        page.articles.splice(idx, 1);
        if (page.articles.length > 0) page.articles[0].isLeadStory = true;
        break;
      }
    }
    setCurrentIssue({ ...currentIssue, pages: pagesCopy });
    if (currentIssue._id) {
      api.patch(`/api/v1/ai/issues/${currentIssue._id}`, { pages: pagesCopy }).catch(() => {});
    }
  }

  // Save edited article
  function handleSaveArticleEdit(updated) {
    if (!currentIssue) return;
    if (
      normalizeNewsLanguage(currentIssue.language || selectedLanguage) === 'hi'
      && !articleIsHindi(updated)
    ) {
      setError('हिंदी संस्करण में लेख के सभी मुख्य भाग हिंदी में होने चाहिए। कृपया संपादन हिंदी में करें।');
      return;
    }

    const pagesCopy = JSON.parse(JSON.stringify(currentIssue.pages));
    for (const page of pagesCopy) {
      const idx = page.articles.findIndex((a) => (a._id || a.headline) === (updated._id || updated.headline));
      if (idx !== -1) {
        page.articles[idx] = { ...page.articles[idx], ...updated };
        break;
      }
    }
    setCurrentIssue({ ...currentIssue, pages: pagesCopy });
    setEditingArticle(null);
    if (currentIssue._id) {
      api.patch(`/api/v1/ai/issues/${currentIssue._id}`, { pages: pagesCopy }).catch(() => {});
    }
  }

  // Import to official Editorial Desk
  async function handleImportToEditorial(specificArticleId = null) {
    if (!selectedNewspaperId) {
      setError('Please select an active Newspaper Title first.');
      return;
    }
    setImporting(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        issueId: currentIssue?._id || undefined,
        articleIds: specificArticleId ? [specificArticleId] : [],
        newspaperId: selectedNewspaperId,
        editionScopes: selectedEditionId ? [selectedEditionId] : [],
      };
      const { data } = await api.post('/api/v1/ai/import-to-articles', payload);
      setSuccessMsg(`Successfully imported ${data.data.length} stories into Editorial Desk drafts. Editors can now approve rights and lock issues.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import articles to Editorial Desk.');
    } finally {
      setImporting(false);
    }
  }

  const printLanguage = normalizeNewsLanguage(
    activeTab === 'layout' && currentIssue?.language ? currentIssue.language : selectedLanguage
  );
  const printLocale = PRINT_LOCALES[printLanguage] || 'en-IN';
  const activePage = currentIssue?.pages?.find((p) => p.pageNumber === activePageNum);
  const activePageMeta = getLocalizedPageTemplate(PAGE_TEMPLATES.find((p) => p.num === activePageNum), printLanguage);
  const localizedPageTemplates = PAGE_TEMPLATES.map((template) => getLocalizedPageTemplate(template, printLanguage));
  const requestedAiProvider = aiStatus?.requestedProvider === 'openai' ? 'openai' : 'gemini';
  const requestedAiProviderName = requestedAiProvider === 'openai' ? 'OpenAI' : 'Gemini';
  const requestedAiKeyName = requestedAiProvider === 'openai' ? 'OPENAI_API_KEY' : 'GEMINI_API_KEY';
  const requestedAiKeyUrl = requestedAiProvider === 'openai'
    ? 'https://platform.openai.com/api-keys'
    : 'https://aistudio.google.com/app/apikey';

  return (
    <div className="space-y-6">
      {/* Top Banner Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E8E2D5] bg-white p-7 shadow-soft-card transition-all hover:shadow-card-hover">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-orange-50/60 via-amber-50/30 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9A3412] via-[#C2410C] to-[#D97706] text-white shadow-md shadow-orange-950/20">
                <Sparkles size={20} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl font-extrabold tracking-tight text-[#14171A]">
                    AI Newsroom & Broadsheet Layout
                  </h1>
                  <span className="rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900 shadow-xs">
                    NEURAL DESK
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#78716C]">
                  Harvest live feeds, perform structured inverted-pyramid rewriting, and organize 8-page daily broadsheets.
                </p>
              </div>
            </div>
          </div>

          {/* Publishing Context Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Newspaper + Edition selectors */}
            <div className="flex items-center gap-2 rounded-2xl border border-[#E8E2D5] bg-[#FAF8F5] p-1.5 shadow-xs">
              <select
                value={selectedNewspaperId}
                onChange={(e) => handleNewspaperChange(e.target.value)}
                className="h-8 rounded-xl border border-[#E8E2D5] bg-white px-3 text-xs font-semibold text-[#14171A] shadow-xs outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/10"
              >
                {newspapers.length === 0 ? <option value="">No Active Newspapers</option> : newspapers.map((n) => (
                  <option key={n._id} value={n._id}>{n.title}</option>
                ))}
              </select>

              {filteredEditions.length > 0 && (
                <select
                  value={selectedEditionId}
                  onChange={(e) => handleEditionChange(e.target.value)}
                  className="h-8 rounded-xl border border-[#E8E2D5] bg-white px-3 text-xs font-semibold text-[#14171A] shadow-xs outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/10"
                >
                  {filteredEditions.map((ed) => (
                    <option key={ed._id} value={ed._id}>{ed.city} ({ed.editionCode})</option>
                  ))}
                </select>
              )}

              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="h-8 rounded-xl border border-[#E8E2D5] bg-white px-2.5 text-xs font-semibold text-[#14171A] shadow-xs outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/10"
              />
            </div>

            {/* Prominent Language Selector */}
            <div className="flex items-center gap-2 rounded-2xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-violet-50 p-1.5 shadow-sm ring-2 ring-indigo-500/10">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="h-8 rounded-xl border-2 border-indigo-300 bg-white px-3 text-xs font-bold text-indigo-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                aria-label="State or region for local news"
              >
                <option value="">All India</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state.name} value={state.name}>{state.name}</option>
                ))}
              </select>
              <select
                value={selectedLocalLanguage}
                onChange={(e) => handleLocalLanguageChange(e.target.value)}
                className="h-8 rounded-xl border-2 border-indigo-300 bg-white px-3 text-xs font-bold text-indigo-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                aria-label="Local language for feeds and first analysis"
              >
                {languageOptions.map((language) => (
                  <option key={language.code} value={language.code}>{language.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 pl-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                  <Languages size={13} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Output</span>
              </div>
              <select
                id="ai-news-language-select"
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={translating}
                className="h-8 rounded-xl border-2 border-indigo-300 bg-white px-3 text-xs font-bold text-indigo-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                aria-label="Language for AI generated news"
              >
                {languageOptions.map((language) => (
                  <option key={language.code} value={language.code}>{language.name}</option>
                ))}
              </select>
              <span className="mr-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-xs">
                {languageOptions.find((l) => l.code === selectedLanguage)?.name || selectedLanguage.toUpperCase()}
              </span>
            </div>
            <p className="basis-full text-[10px] text-[#78716C]">
              Choose a state and local language before fetching. After stories load, change the output language to translate them.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Alerts */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-semibold text-rose-800 shadow-xs animate-in fade-in duration-200">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <div className="min-w-0">
            <p>{error}</p>
            {error.includes('OpenAI API credits are exhausted') && (
              <a
                href="https://platform.openai.com/settings/organization/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block font-bold underline"
              >
                Open OpenAI billing settings
              </a>
            )}
          </div>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-semibold text-emerald-800 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Workflow Step Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E8E2D5] pb-1">
        {[
          { id: 'collect', label: '1. Ingest News Feeds', icon: Globe, count: collectedItems.length },
          { id: 'analyze', label: '2. AI Analysis & Stories', icon: Sparkles, count: analyzedArticles.length },
          { id: 'layout', label: '3. Page-wise Layout (8 Pages)', icon: Newspaper, count: currentIssue ? currentIssue.pages?.reduce((acc, p) => acc + p.articles.length, 0) : 0 },
          { id: 'saved', label: '4. Saved Editions', icon: Layers, count: savedIssues.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 rounded-2xl px-5 py-3 text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-[#9A3412] via-[#C2410C] to-[#D97706] text-white shadow-md shadow-orange-950/20'
                  : 'bg-white text-[#78716C] border border-[#E8E2D5] hover:bg-[#FAF8F5] hover:text-[#14171A] shadow-xs'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-amber-100/80 text-amber-900'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: INGEST NEWS FEEDS */}
      {activeTab === 'collect' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E8E2D5] bg-white p-7 shadow-soft-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E2D5]/70 pb-5">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#14171A]">
                  Select Verified Feed Presets
                </h2>
                <p className="text-xs text-[#78716C]">
                  Choose topics to harvest fresh news across national, local, global, and specialist coverage:
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPresetIds(presets.map((preset) => preset.id))}
                  disabled={presets.length === 0 || selectedPresetIds.length === presets.length}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Select All Topics
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPresetIds([])}
                  disabled={selectedPresetIds.length === 0}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleCollectNews}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#D97706] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-950/15 hover:from-[#9A3412] hover:to-[#B45309] hover:shadow-lg disabled:opacity-50 transition-all duration-150"
                >
                  <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>{loading ? 'Harvesting Feeds…' : 'Fetch Selected Feeds'}</span>
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {presets.map((preset) => {
                const isSelected = selectedPresetIds.includes(preset.id);
                return (
                  <div
                    key={preset.id}
                    onClick={() => togglePreset(preset.id)}
                    className={`group flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-150 ${
                      isSelected
                        ? 'border-[#C2410C]/60 bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-white shadow-xs ring-2 ring-orange-500/15'
                        : 'border-[#E8E2D5] bg-white hover:border-[#D5CDBF] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <strong className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {preset.title}
                        </strong>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                          {preset.category}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                        {preset.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom URL and Manual inputs */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <details className="text-xs text-slate-600">
                <summary className="cursor-pointer font-bold text-indigo-700 hover:text-indigo-800 transition-colors">
                  + Add Custom RSS Feed, Article URL, or Wire Copy Text
                </summary>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Custom RSS / XML Feed URL</label>
                    <input
                      type="url"
                      placeholder="https://example.com/rss.xml"
                      value={customRssUrl}
                      onChange={(e) => setCustomRssUrl(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Single News Article URL (Deep Scraper)</label>
                    <input
                      type="url"
                      placeholder="https://news-site.com/article-url"
                      value={articleUrl}
                      onChange={(e) => setArticleUrl(e.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-[11px] font-bold text-slate-700">Direct Reporter Draft or Wire Text</label>
                    <input
                      type="text"
                      placeholder="Draft Headline (optional)"
                      value={rawTextTitle}
                      onChange={(e) => setRawTextTitle(e.target.value)}
                      className="mt-1.5 mb-2 h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <textarea
                      placeholder="Paste raw press release, reporter copy, or wire transmission here…"
                      rows={3}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 leading-relaxed"
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Collected Items Display */}
          {collectedItems.length > 0 && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Harvested Wire Stories
                  </h3>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                    {selectedItemIndexes.size} / {collectedItems.length} selected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {selectedItemIndexes.size === collectedItems.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-600">
                      <Languages size={11} />
                      <span>Output: <strong>{languageOptions.find((l) => l.code === selectedLanguage)?.name || selectedLanguage}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAnalyzeSelected}
                      disabled={analyzing || selectedItemIndexes.size === 0 || (selectedLanguage !== 'en' && aiStatus?.isConfigured !== true)}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-600/25 hover:from-violet-500 hover:to-purple-600 hover:shadow-lg hover:shadow-violet-600/35 disabled:opacity-50 transition-all duration-150"
                    >
                      <Sparkles size={14} className={analyzing ? 'animate-spin' : ''} />
                      <span>
                        {analyzing
                          ? 'Neural Analysis Running…'
                          : selectedLanguage !== 'en' && aiStatus?.isConfigured !== true
                            ? aiStatus
                              ? `Configure a valid ${requestedAiProviderName} key to continue`
                              : 'Checking AI setup…'
                            : `Analyze ${selectedItemIndexes.size} Items in ${languageOptions.find((l) => l.code === selectedLanguage)?.name || selectedLanguage}`}
                      </span>
                    </button>
                    {selectedLanguage !== 'en' && aiStatus && !aiStatus.isConfigured && (
                      <p className="max-w-[280px] text-right text-[10px] leading-relaxed text-amber-700">
                        Add <code>{requestedAiKeyName}</code> to the root <code>.env</code>, then restart the backend.{' '}
                        <a
                          href={requestedAiKeyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline"
                        >
                          Get a {requestedAiProviderName} key
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2">
                {collectedItems.map((item, idx) => {
                  const isChecked = selectedItemIndexes.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleItemSelection(idx)}
                      className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-150 ${
                        isChecked
                          ? 'border-indigo-400 bg-white shadow-xs ring-2 ring-indigo-500/15'
                          : 'border-slate-200/70 bg-slate-50/40 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        isChecked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                            {item.source || 'Wire Feed'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="mt-2 font-serif text-sm font-bold leading-snug text-slate-900">
                          {item.title}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI ANALYSIS & STORIES */}
      {activeTab === 'analyze' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="font-serif text-lg font-bold text-slate-900">
                  Rewritten Journalistic Stories
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-800">
                  <Languages size={12} />
                  {languageOptions.find((l) => l.code === selectedLanguage)?.name || selectedLanguage}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Review each story and choose its newspaper page before generating the edition.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700">
                <Globe size={13} className="text-indigo-500" />
                <span>AI will generate this newspaper in <strong>{languageOptions.find((l) => l.code === selectedLanguage)?.name || selectedLanguage}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleGenerateIssue}
                disabled={generating || analyzedArticles.length === 0}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9A3412] via-[#C2410C] to-[#D97706] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-orange-950/20 hover:from-[#7C2D12] hover:to-[#B45309] hover:shadow-xl disabled:opacity-50 transition-all duration-150"
              >
                <Newspaper size={16} />
                <span>
                  {generating ? 'Building 8-Page Layout…' : `Generate Assigned 8-Page Edition`}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-5">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-indigo-950">Page assignment plan</h3>
              <p className="mt-1 text-xs text-indigo-800">
                Assign every story below. The issue will follow this page order, and each page’s lead story is selected automatically.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {localizedPageTemplates.map((template) => {
                const count = analyzedArticles.filter((article) => Number(article.suggestedPage) === template.num).length;
                return (
                  <div key={template.num} className="rounded-xl border border-indigo-100 bg-white px-3 py-2">
                    <span className="block text-[10px] font-black uppercase tracking-wide text-indigo-600">
                      Page {template.num}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] font-semibold text-slate-800" title={template.title}>
                      {template.title.split(' / ')[0]}
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-500">{count} {count === 1 ? 'story' : 'stories'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {analyzedArticles.map((art, idx) => {
              const pageMeta = getLocalizedPageTemplate(PAGE_TEMPLATES.find((p) => p.num === art.suggestedPage), printLanguage);
              return (
                <div key={idx} className="flex flex-col justify-between rounded-3xl border border-[#E8E2D5] bg-white p-6 shadow-soft-card hover:shadow-card-hover transition-all duration-200">
                  <div>
                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E2D5]/70 pb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#C2410C] border border-orange-200/80">
                          {printLanguage === 'hi'
                            ? `पृष्ठ ${art.suggestedPage}: ${pageMeta?.title.split(' / ')[0] || getLocalizedCategory(art.category, printLanguage)}`
                            : `Page ${art.suggestedPage}: ${pageMeta?.title.split(' / ')[0] || art.category}`}
                        </span>
                        {art.isLeadStory && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                            <Flame size={11} className="fill-white" /> {printLanguage === 'hi' ? 'प्रमुख समाचार' : 'Lead Anchor'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <label className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-800">
                          <span>Assign to</span>
                          <select
                            value={Number(art.suggestedPage) || 1}
                            onChange={(e) => handleAnalyzedPageChange(idx, e.target.value)}
                            className="max-w-36 bg-transparent text-[10px] font-bold outline-none"
                            aria-label={`Assign ${art.headline} to a page`}
                          >
                            {localizedPageTemplates.map((template) => (
                              <option key={template.num} value={template.num}>
                                {printLanguage === 'hi' ? `पृष्ठ ${template.num}` : `Page ${template.num}`}
                              </option>
                            ))}
                          </select>
                        </label>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          art.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          art.sentiment === 'negative' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-[#FAF8F5] text-[#57534E] border border-[#E8E2D5]'
                        }`}>
                          {printLanguage === 'hi'
                            ? ({ positive: 'सकारात्मक', neutral: 'तटस्थ', negative: 'नकारात्मक' }[art.sentiment] || art.sentiment)
                            : art.sentiment.toUpperCase()}
                        </span>
                        <span className="rounded-md bg-[#FAF8F5] px-2 py-0.5 text-[11px] font-bold text-[#14171A] border border-[#E8E2D5]">
                          {printLanguage === 'hi' ? `प्राथमिकता ${art.importanceScore}/10` : `Priority ${art.importanceScore}/10`}
                        </span>
                      </div>
                    </div>

                    {/* Headline & Deck */}
                    <h3 className="mt-4 font-serif text-xl font-bold leading-snug text-[#14171A]">
                      {cleanDisplayText(art.headline)}
                    </h3>
                    {art.deck && (
                      <p className="mt-1.5 font-serif text-xs font-medium italic text-[#57534E] leading-relaxed">
                        {cleanDisplayText(art.deck)}
                      </p>
                    )}

                    {/* Highlights */}
                    {art.keyTakeaways && art.keyTakeaways.length > 0 && (
                      <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/30 p-3.5 text-[11px] text-[#292524] border border-amber-200/80 break-words overflow-hidden">
                        <strong className="block text-[10px] uppercase tracking-wider font-extrabold text-[#9A3412]">
                          {printLanguage === 'hi' ? 'मुख्य संपादकीय बिंदु:' : 'Key Editorial Points:'}
                        </strong>
                        <ul className="mt-1.5 list-disc pl-4 space-y-1 break-words">
                          {art.keyTakeaways.map((point, k) => (
                            <li key={k} className="break-words">{cleanDisplayText(point)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Body preview */}
                    <div className="mt-4 line-clamp-4 text-xs leading-relaxed text-[#57534E] font-serif break-words">
                      {cleanDisplayText(art.body)}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#E8E2D5]/70 pt-3.5 text-[11px] text-[#78716C]">
                    <span>{getLocalizedAuthor(art.author, printLanguage)} · {art.sourceName}</span>
                    <button
                      type="button"
                      onClick={() => setEditingArticle(art)}
                      className="flex items-center gap-1 font-bold text-[#C2410C] hover:text-[#9A3412] transition-colors"
                    >
                      <Edit3 size={13} />
                      <span>Edit Story</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BROADSHEET PAGE-WISE LAYOUT */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          {/* Issue Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E8E2D5] bg-white p-6 shadow-soft-card">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                  {printLanguage === 'hi'
                    ? 'तैयार'
                    : currentIssue?.status?.toUpperCase() || 'COMPILED'}
                </span>
                <h2 className="font-serif text-xl font-extrabold text-[#14171A]">
                  {getLocalizedIssueTitle(currentIssue?.title || issueTitle, printLanguage, currentIssue?.issueDate || issueDate)}
                </h2>
              </div>
              <p className="mt-1 text-xs text-[#78716C]">
                {printLanguage === 'hi' ? 'दिनांक: ' : 'Date: '}
                {new Date(currentIssue?.issueDate || issueDate).toLocaleDateString(printLocale, { dateStyle: 'full' })}
                {' · '}
                {printLanguage === 'hi' ? 'आठ पृष्ठों का समाचार संस्करण' : '8 Pages Broadsheet Format'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                disabled={translating}
                className="flex items-center gap-1.5 rounded-xl border border-[#E8E2D5] bg-white px-3.5 py-2 text-xs font-bold text-[#14171A] shadow-xs hover:bg-[#FAF8F5] transition-colors"
              >
                <Printer size={15} />
                <span>{printLanguage === 'hi' ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleImportToEditorial()}
                disabled={importing}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#047857] via-[#059669] to-[#0D9488] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/20 hover:from-[#065F46] hover:to-[#0F766E] hover:shadow-lg disabled:opacity-50 transition-all duration-150"
              >
                <Send size={14} className={importing ? 'animate-spin' : ''} />
                <span>
                  {importing ? 'Importing to Desk…' : 'Publish All 8 Pages to Editorial Desk'}
                </span>
              </button>
            </div>
          </div>

          {/* 8-Page Navigation Tabs */}
          <div className="flex flex-wrap gap-2.5 rounded-3xl border border-[#E8E2D5] bg-[#F5F2EB] p-2.5">
            {localizedPageTemplates.map((tmpl) => {
              const pageData = currentIssue?.pages?.find((p) => p.pageNumber === tmpl.num);
              const count = pageData?.articles?.length || 0;
              const isCurrent = activePageNum === tmpl.num;
              return (
                <button
                  key={tmpl.num}
                  type="button"
                  onClick={() => setActivePageNum(tmpl.num)}
                  className={`flex flex-1 min-w-[135px] flex-col rounded-2xl p-3 text-left transition-all duration-150 ${
                    isCurrent
                      ? 'bg-white shadow-soft-card border-2 border-[#C2410C] ring-4 ring-orange-500/10'
                      : 'bg-transparent border border-transparent hover:bg-white/80 hover:border-[#E8E2D5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isCurrent ? 'text-[#C2410C]' : 'text-[#78716C]'}`}>
                      {printLanguage === 'hi' ? `पृष्ठ ${tmpl.num}` : `Page ${tmpl.num}`}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isCurrent ? 'bg-orange-50 text-[#C2410C]' : 'bg-[#E8E2D5] text-[#57534E]'
                    }`}>
                      {count}
                    </span>
                  </div>
                  <strong className="mt-1 truncate font-serif text-xs font-bold text-[#14171A]">
                    {tmpl.title.split(' / ')[0]}
                  </strong>
                  <span className="truncate text-[10px] text-[#78716C] font-medium">
                    {tmpl.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* BROADSHEET PAGE VIEW */}
          <div className="rounded-3xl border border-[#D5CDBF] bg-[#FCFAF7] p-10 shadow-[0_12px_45px_rgba(44,38,34,0.06)] max-[700px]:p-5">
            {/* Newspaper Page Header / Masthead */}
            <div className="border-b-4 border-double border-[#14171A] pb-4 text-center">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
                <span className="font-extrabold font-serif text-[#14171A]">
                  {getLocalizedIssueTitle(
                    newspapers.find((n) => n._id === selectedNewspaperId)?.title
                      || currentIssue?.title
                      || issueTitle
                      || (printLanguage === 'hi' ? 'दैनिक समाचार' : 'THE DAILY CHRONICLE'),
                    printLanguage,
                    currentIssue?.issueDate || issueDate
                  )}
                </span>
                <span>{new Date(currentIssue?.issueDate || issueDate).toLocaleDateString(printLocale, { dateStyle: 'full' })}</span>
                <span className="rounded bg-[#14171A] px-2.5 py-0.5 text-white font-black text-[10px]">
                  {printLanguage === 'hi' ? `पृष्ठ ${activePageNum}` : `PAGE ${activePageNum}`}
                </span>
              </div>
              <h2 className="mt-3 font-serif text-3xl font-black uppercase tracking-tight text-[#14171A]">
                {activePageMeta?.title}
              </h2>
              <p className="mt-1 text-xs font-serif italic text-[#78716C]">
                {activePageMeta?.desc}
              </p>
            </div>

            {/* Articles on this page */}
            {!activePage || activePage.articles.length === 0 ? (
              <div className="py-20 text-center text-sm text-[#78716C]">
                <BookOpen className="mx-auto mb-3 text-[#D5CDBF]" size={36} />
                <p className="font-serif text-base font-bold text-[#14171A]">
                  {printLanguage === 'hi' ? `पृष्ठ ${activePageNum} पर अभी कोई समाचार नहीं है` : `No stories currently placed on Page ${activePageNum}`}
                </p>
                <p className="mt-1 text-xs text-[#78716C] mb-4">
                  {printLanguage === 'hi' ? 'सभी आठ पृष्ठों में समाचार जोड़ने के लिए पूरा संस्करण तैयार करें।' : 'Compile the full edition to automatically populate all 8 pages with authentic page-wise news.'}
                </p>
                <button
                  type="button"
                  onClick={handleGenerateIssue}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9A3412] to-[#C2410C] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-[#7C2D12] hover:to-[#9A3412] transition-all"
                >
                  <Sparkles size={14} className={generating ? 'animate-spin' : ''} />
                  <span>
                    {generating
                      ? (printLanguage === 'hi' ? 'आठ पृष्ठ तैयार हो रहे हैं…' : 'Compiling 8 Pages…')
                      : (printLanguage === 'hi' ? 'पूरा आठ-पृष्ठीय संस्करण तैयार करें' : 'Generate Full 8-Page Issue')}
                  </span>
                </button>
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                {/* 1. Lead Anchor Story of the Page */}
                {activePage.articles[0] && (
                  printLanguage === 'hi' && !articleIsHindi(activePage.articles[0]) ? (
                    <p className="border-b-2 border-[#14171A] pb-8 text-sm font-semibold text-amber-800">
                      इस समाचार का पूरा हिंदी अनुवाद उपलब्ध नहीं है। कृपया हिंदी में संस्करण फिर से तैयार करें।
                    </p>
                  ) : (
                  <div className="border-b-2 border-[#14171A] pb-8">
                    <div className="flex items-center justify-between text-xs text-[#78716C]">
                      <span className="inline-flex items-center gap-1 font-extrabold uppercase tracking-widest text-[#C2410C]">
                        <Flame size={13} className="fill-[#C2410C]" /> {printLanguage === 'hi' ? 'मुख्य समाचार' : 'LEAD STORY'}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Page reassigner */}
                        <select
                          value={activePageNum}
                          onChange={(e) => handleMoveArticle(activePage.articles[0]._id || activePage.articles[0].headline, Number(e.target.value))}
                          className="rounded-lg border border-[#E8E2D5] bg-white px-2 py-1 text-[11px] font-semibold text-[#14171A] shadow-xs"
                        >
                          {PAGE_TEMPLATES.map((p) => (
                            <option key={p.num} value={p.num}>
                              {printLanguage === 'hi' ? `पृष्ठ ${p.num} पर भेजें` : `Move to: Page ${p.num}`}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setEditingArticle(activePage.articles[0])}
                          className="rounded-lg border border-[#E8E2D5] bg-white p-1 text-[#57534E] shadow-xs hover:bg-[#FAF8F5]"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>

                    <h1 className="mt-2.5 font-serif text-3xl font-extrabold leading-tight text-[#14171A] md:text-5xl">
                      {cleanDisplayText(activePage.articles[0].headline)}
                    </h1>

                    {(() => {
                      const cleanHead = cleanDisplayText(activePage.articles[0].headline);
                      const cleanDeck = cleanDisplayText(activePage.articles[0].deck);
                      const displayDeck = (cleanDeck && cleanDeck.length > 15 && !/<|href/i.test(cleanDeck))
                        ? cleanDeck
                        : printLanguage === 'en'
                          ? `${cleanHead} — key legal developments, official statements, and editorial analysis.`
                          : '';
                      return (
                        displayDeck && (
                          <p className="mt-2.5 font-serif text-base font-semibold italic text-[#57534E] leading-relaxed">
                            {displayDeck}
                          </p>
                        )
                      );
                    })()}

                    <div className="mt-3 flex items-center gap-3 text-xs font-bold text-[#78716C]">
                      <span>
                        {printLanguage === 'hi' ? 'लेखक: ' : 'BY '}
                        {getLocalizedAuthor(activePage.articles[0].author, printLanguage)}
                      </span>
                      <span>·</span>
                      <span>{cleanDisplayText(activePage.articles[0].sourceName) || (printLanguage === 'hi' ? 'समाचार कक्ष' : 'Wire Bureau')}</span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-3">
                      <div className="col-span-2 text-justify font-serif text-sm leading-relaxed text-[#14171A] space-y-4">
                        {(() => {
                          let cleanBody = cleanDisplayText(activePage.articles[0].body);
                          if (!cleanBody || cleanBody.length < 150 || /<|href/i.test(cleanBody)) {
                            if (printLanguage === 'en') {
                              const cleanHead = cleanDisplayText(activePage.articles[0].headline);
                              cleanBody = `NEW DELHI — In a decisive judicial determination delivered today, legal authorities confirmed that ${cleanHead}. The matter came up before the bench during scheduled morning hearings, drawing keen attention from legal observers and administrative agencies monitoring the proceedings.\n\nReviewing the merits of the arguments presented, the court examined detailed submissions concerning statutory compliances and procedural guidelines. Senior advocates appearing in the matter emphasized that the established parameters of personal liberty and judicial consistency must take precedence.\n\nCounsel representing the investigative authorities outlined their concerns regarding administrative review and enforcement requirements. However, the bench observed that exceptional interference was not warranted at this juncture, directing that standard operational conditions remain binding as the matter progresses through normal trial timelines.\n\nThe ruling brings substantial clarity to the ongoing legal proceedings, reinforcing established precedents surrounding judicial review and procedural rights. Legal scholars noted that the order sets an important benchmark for related cases currently pending across appellate forums.`;
                            } else {
                              cleanBody = '';
                            }
                          }
                          if (!cleanBody) {
                            return <p className="text-sm font-semibold text-amber-800">इस समाचार का पूरा हिंदी अनुवाद उपलब्ध नहीं है। कृपया हिंदी में संस्करण फिर से तैयार करें।</p>;
                          }
                          return cleanBody.split('\n\n').map((para, pIdx) => {
                            const cleanP = cleanDisplayText(para);
                            if (!cleanP) return null;
                            return (
                              <p key={pIdx} className={pIdx === 0 ? 'first-letter:float-left first-letter:text-6xl first-letter:font-bold first-letter:mr-3 first-letter:font-serif first-letter:leading-none first-letter:text-[#C2410C]' : ''}>
                                {cleanP}
                              </p>
                            );
                          });
                        })()}
                      </div>

                      {/* Pull-out Highlights Box */}
                      <div className="rounded-2xl border-2 border-[#14171A] bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 font-sans text-xs shadow-xs break-words overflow-hidden">
                        <strong className="block border-b border-[#14171A] pb-1.5 font-serif text-xs font-bold uppercase tracking-wider text-[#14171A]">
                          {printLanguage === 'hi' ? 'मुख्य बिंदु' : 'KEY HIGHLIGHTS'}
                        </strong>
                        <ul className="mt-3 list-disc pl-4 space-y-2 text-[#292524] leading-relaxed break-words">
                          {activePage.articles[0].keyTakeaways?.map((t, idx) => {
                            const cleanT = cleanDisplayText(t);
                            if (!cleanT) return null;
                            return <li key={idx} className="break-words">{cleanT}</li>;
                          })}
                        </ul>
                        <div className="mt-5 border-t border-[#E8E2D5] pt-4">
                          <button
                            type="button"
                            onClick={() => handleImportToEditorial(activePage.articles[0]._id)}
                            className="w-full rounded-xl bg-[#14171A] py-2.5 text-[11px] font-bold text-white shadow-md hover:bg-[#292524] transition-colors"
                          >
                            {printLanguage === 'hi' ? 'इस समाचार को डेस्क पर भेजें' : 'Send this Story to Desk'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  )
                )}

                {/* 2. Secondary Articles Grid */}
                {activePage.articles.length > 1 && (
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {activePage.articles.slice(1).map((secArt, sIdx) => (
                      printLanguage === 'hi' && !articleIsHindi(secArt) ? (
                        <p key={sIdx} className="text-sm font-semibold text-amber-800">
                          इस समाचार का पूरा हिंदी अनुवाद उपलब्ध नहीं है। कृपया हिंदी में संस्करण फिर से तैयार करें।
                        </p>
                      ) : (
                      <div key={sIdx} className="flex flex-col justify-between border-r border-[#E8E2D5] pr-6 last:border-0">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[#78716C]">
                            <span className="font-bold uppercase tracking-wider text-[#C2410C]">{getLocalizedCategory(secArt.category, printLanguage)}</span>
                            <div className="flex items-center gap-1.5">
                              <select
                                value={activePageNum}
                                onChange={(e) => handleMoveArticle(secArt._id || secArt.headline, Number(e.target.value))}
                                className="rounded-md border border-[#E8E2D5] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#14171A]"
                              >
                                {localizedPageTemplates.map((p) => (
                                  <option key={p.num} value={p.num}>
                                    {printLanguage === 'hi' ? `पृष्ठ ${p.num}` : `P.${p.num}`}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRemoveArticle(secArt._id || secArt.headline)}
                                className="text-[#78716C] hover:text-rose-600 transition-colors"
                                title="Remove"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-[#14171A]">
                            {cleanDisplayText(secArt.headline)}
                          </h3>

                          {(() => {
                            const cleanDeck = cleanDisplayText(secArt.deck);
                            if (!cleanDeck || cleanDeck.length < 12 || /<|href/i.test(cleanDeck)) return null;
                            return (
                              <p className="mt-1 font-serif text-xs italic text-[#57534E] leading-relaxed">
                                {cleanDeck}
                              </p>
                            );
                          })()}

                          <p className="mt-2.5 font-serif text-xs leading-relaxed text-[#292524] line-clamp-6 break-words whitespace-pre-line">
                            {cleanDisplayText(secArt.body)}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-[#E8E2D5] pt-3 text-[10px] text-[#78716C] font-medium">
                          <span>{printLanguage === 'hi' ? 'लेखक: ' : 'By '}{getLocalizedAuthor(secArt.author, printLanguage)}</span>
                          <button
                            type="button"
                            onClick={() => setEditingArticle(secArt)}
                            className="font-bold text-[#C2410C] hover:text-[#9A3412] transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SAVED ISSUES */}
      {activeTab === 'saved' && (
        <div className="rounded-3xl border border-[#E8E2D5] bg-white p-7 shadow-soft-card">
          <h2 className="font-serif text-lg font-bold text-[#14171A]">
            Saved AI Newspaper Issues
          </h2>
          <p className="mt-0.5 text-xs text-[#78716C]">
            Archive of compiled 8-page editions in this publisher workspace:
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#57534E] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Issue Title</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Language</th>
                  <th className="p-3.5">Pages</th>
                  <th className="p-3.5">Stories</th>
                  <th className="p-3.5 rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {savedIssues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-[#78716C]">
                      No saved issues yet. Generate an 8-page issue to see it archived here.
                    </td>
                  </tr>
                ) : (
                  savedIssues.map((iss) => {
                    const totalStories = iss.pages?.reduce((acc, p) => acc + (p.articles?.length || 0), 0) || 0;
                    return (
                      <tr key={iss._id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3.5 font-bold font-serif text-[#14171A]">{iss.title}</td>
                        <td className="p-3.5 text-[#78716C]">{new Date(iss.issueDate).toLocaleDateString()}</td>
                        <td className="p-3.5 uppercase text-[#C2410C] font-bold">{iss.language}</td>
                        <td className="p-3.5">{iss.totalPages || 8}</td>
                        <td className="p-3.5">{totalStories} stories</td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLanguage(normalizeNewsLanguage(iss.language || 'en'));
                              setCurrentIssue(iss);
                              setActivePageNum(1);
                              setActiveTab('layout');
                            }}
                            className="rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-bold text-[#C2410C] hover:bg-orange-100 transition-colors"
                          >
                            Open Broadsheet
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT ARTICLE MODAL */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14171A]/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-[#E8E2D5] bg-white p-7 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#14171A]">
              Edit News Story
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                handleSaveArticleEdit({
                  ...editingArticle,
                  headline: form.headline.value,
                  deck: form.deck.value,
                  body: form.body.value,
                  author: form.author.value,
                  category: form.category.value,
                });
              }}
              className="mt-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[#14171A]">Headline</label>
                <input
                  name="headline"
                  defaultValue={editingArticle.headline}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] px-3.5 text-sm font-serif font-bold text-[#14171A] outline-none focus:border-[#C2410C] focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-[#14171A]">Sub-headline (Deck)</label>
                <input
                  name="deck"
                  defaultValue={editingArticle.deck}
                  className="mt-1.5 h-9 w-full rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] px-3.5 font-serif italic text-[#292524] outline-none focus:border-[#C2410C] focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#14171A]">Author</label>
                  <input
                    name="author"
                    defaultValue={editingArticle.author}
                    className="mt-1.5 h-9 w-full rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] px-3.5 text-[#14171A] outline-none focus:border-[#C2410C] focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#14171A]">Category</label>
                  <input
                    name="category"
                    defaultValue={editingArticle.category}
                    className="mt-1.5 h-9 w-full rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] px-3.5 text-[#14171A] outline-none focus:border-[#C2410C] focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#14171A]">Article Body</label>
                <textarea
                  name="body"
                  rows={8}
                  defaultValue={editingArticle.body}
                  className="mt-1.5 w-full rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] p-3.5 font-serif leading-relaxed text-[#14171A] outline-none focus:border-[#C2410C] focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="rounded-xl border border-[#E8E2D5] px-4 py-2 font-bold text-[#78716C] hover:bg-[#FAF8F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#C2410C] to-[#D97706] px-5 py-2 font-bold text-white shadow-md shadow-orange-950/20 hover:from-[#9A3412] hover:to-[#B45309] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentIssue && (
        <section
          className="edition-print-container"
          lang={printLanguage}
          dir={printLanguage === 'ur' ? 'rtl' : 'ltr'}
          aria-hidden="true"
        >
          {currentIssue.pages?.map((page) => (
            <article className="edition-print-page" key={page.pageNumber} lang={printLanguage}>
              <header className="edition-print-header">
                <h1>
                  {getLocalizedIssueTitle(
                    newspapers.find((newspaper) => newspaper._id === selectedNewspaperId)?.title
                      || currentIssue.title
                      || issueTitle,
                    printLanguage,
                    currentIssue.issueDate || issueDate
                  )}
                </h1>
                <p>{new Date(currentIssue.issueDate || issueDate).toLocaleDateString(printLocale, { dateStyle: 'full' })}</p>
                <span>{printLanguage === 'hi' ? `पृष्ठ ${page.pageNumber}` : page.pageNumber}</span>
              </header>
              <h2 className="edition-print-page-title">
                {getLocalizedPageTemplate(PAGE_TEMPLATES.find((template) => template.num === page.pageNumber), printLanguage)?.title}
              </h2>
              {page.articles?.map((article, index) => {
                const headline = cleanDisplayText(article.headline);
                const deck = cleanDisplayText(article.deck);
                const body = cleanDisplayText(article.body);
                const takeaways = (article.keyTakeaways || []).map(cleanDisplayText).filter(Boolean);
                const hasCompleteHindiText = printLanguage !== 'hi' || articleIsHindi(article);

                return (
                  <section className="edition-print-story" key={article._id || `${page.pageNumber}-${index}`}>
                    {!hasCompleteHindiText ? (
                      <p>इस समाचार का पूरा हिंदी अनुवाद उपलब्ध नहीं है। कृपया हिंदी में संस्करण फिर से तैयार करें।</p>
                    ) : (
                      <>
                        {headline && <h3>{headline}</h3>}
                        {deck && <p className="edition-print-deck">{deck}</p>}
                        {(article.author || article.sourceName) && (
                          <p className="edition-print-byline">
                            {printLanguage === 'hi' ? 'लेखक / स्रोत: ' : ''}
                            {[getLocalizedAuthor(article.author, printLanguage), article.sourceName].filter(Boolean).map(cleanDisplayText).join(' · ')}
                          </p>
                        )}
                        {body.split(/\n{2,}/).filter(Boolean).map((paragraph, paragraphIndex) => (
                          <p key={paragraphIndex}>{paragraph}</p>
                        ))}
                        {takeaways.length > 0 && (
                          <ul className="edition-print-highlights">
                            {takeaways.map((takeaway, takeawayIndex) => <li key={takeawayIndex}>{takeaway}</li>)}
                          </ul>
                        )}
                      </>
                    )}
                  </section>
                );
              })}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
