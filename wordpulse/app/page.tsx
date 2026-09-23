'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Trash2,
  Clock,
  Volume2,
  Sparkles,
  Sun,
  Moon,
  BarChart2,
  RotateCcw,
  Sliders,
  BookOpen,
  Search,
  ArrowUpDown,
  AlignLeft,
  CheckCircle2,
  ExternalLink,
  Code2,
  type LucideIcon,
} from 'lucide-react';

// Common English stop words to filter out in keyword density analysis
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't",
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', "can't",
  'cannot', 'could', "couldn't", 'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't", 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', "hadn't", 'has', "hasn't", 'have', "haven't",
  'having', 'he', "he'd", "he'll", "he's", 'her', 'here', "here's", 'hers', 'herself', 'him', 'himself',
  'his', 'how', "how's", 'i', "i'd", "i'll", "i'm", "i've", 'if', 'in', 'into', 'is', "isn't", 'it',
  "it's", 'its', 'itself', "let's", 'me', 'more', 'most', "mustn't", 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', "shan't", 'she', "she'd", "she'll", "she's", 'should', "shouldn't", 'so', 'some', 'such',
  'than', 'that', "that's", 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', "there's",
  'these', 'they', "they'd", "they'll", "they're", "they've", 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', "wasn't", 'we', "we'd", "we'll", "we're", "we've", 'were',
  "weren't", 'what', "what's", 'when', "when's", 'where', "where's", 'which', 'while', 'who', "who's",
  'whom', 'why', "why's", 'with', "won't", 'would', "wouldn't", 'you', "you'd", "you'll", "you're",
  "you've", 'your', 'yours', 'yourself', 'yourselves'
]);

const SAMPLE_TEXT = `Welcome to WordPulse! A modern, minimalist word counting and text analysis application built for writers, editors, and developers.

Simply paste your text or start typing here to measure real-time stats including word count, character count, sentence structure, and estimated reading time. You can also analyze top keyword density and transform text formatting with a single click.

Try setting a target word goal or toggling stop-word filtering to see how your text breaks down!`;

type MetricSummary = {
  words: number;
  charsWithSpaces: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  avgWordLength: number;
};

type KeywordDensityItem = {
  word: string;
  count: number;
  percentage: number;
};

/**
 * Utility functions for precise text breakdown
 */
const calculateMetrics = (text: string): MetricSummary => {
  if (!text) {
    return {
      words: 0,
      charsWithSpaces: 0,
      charsNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      avgWordLength: 0,
    };
  }

  // Trimmed text
  const trimmed = text.trim();

  // Words (split by whitespace, ignoring empty strings)
  const wordsArray = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const words = wordsArray.length;

  // Characters
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;

  // Sentences (splitting on terminal punctuation: . ! ?)
  const sentencesArray = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
  const sentences = sentencesArray.length;

  // Paragraphs (splitting on double/single linebreaks with non-whitespace content)
  const paragraphsArray = text.split(/\n+/).filter((p: string) => p.trim().length > 0);
  const paragraphs = paragraphsArray.length;

  // Average Reading Speed: ~200 words per minute
  const readingTimeMinutes = Math.ceil(words / 200);

  // Average Speaking Speed: ~130 words per minute
  const speakingTimeMinutes = Math.ceil(words / 130);

  // Average Word Length
  const totalLetters = wordsArray.reduce((acc: number, word: string) => acc + word.replace(/[^a-zA-Z0-9]/g, '').length, 0);
  const avgWordLength = words > 0 ? Number((totalLetters / words).toFixed(1)) : 0;

  return {
    words,
    charsWithSpaces,
    charsNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    speakingTimeMinutes,
    avgWordLength,
  };
};

const colorMap = {
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
} as const;

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subtext?: string;
  color?: keyof typeof colorMap;
};

const StatCard = ({ icon: Icon, label, value, subtext, color = 'emerald' }: StatCardProps) => {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        {displayValue}
      </div>
      {subtext && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default function App() {
  const [text, setText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);
  const [targetWordGoal, setTargetWordGoal] = useState(500);
  const [enableGoal, setEnableGoal] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showTools, setShowTools] = useState(false);

  // Sync dark mode class with state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toast notification system
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (!text) return;
    setText('');
    showToast('Text cleared');
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    showToast('Sample text loaded');
  };

  const handleCaseChange = (mode: 'UPPER' | 'lower' | 'Title' | 'Sentence') => {
    if (!text) return;
    let converted = text;
    switch (mode) {
      case 'UPPER':
        converted = text.toUpperCase();
        break;
      case 'lower':
        converted = text.toLowerCase();
        break;
      case 'Title':
        converted = text
          .toLowerCase()
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        break;
      case 'Sentence':
        converted = text
          .toLowerCase()
          .replace(/(^\s*|\.\s*)([a-z])/g, (match: string, separator: string, char: string) => separator + char.toUpperCase());
        break;
      default:
        break;
    }
    setText(converted);
    showToast(`Converted to ${mode} case`);
  };

  const handleReplace = () => {
    if (!findText) return;
    const regex = new RegExp(findText, 'gi');
    const matches = (text.match(regex) || []).length;
    if (matches === 0) {
      showToast('No occurrences found');
      return;
    }
    const updated = text.replace(regex, replaceText);
    setText(updated);
    showToast(`Replaced ${matches} occurrence(s)`);
  };

  // Derived primary metrics
  const metrics = useMemo(() => calculateMetrics(text), [text]);

  // Goal progress calculation
  const goalProgress = useMemo(() => {
    if (!enableGoal || targetWordGoal <= 0) return 0;
    return Math.min(100, Math.round((metrics.words / targetWordGoal) * 100));
  }, [metrics.words, targetWordGoal, enableGoal]);

  // Keyword Density Analysis
  const keywordDensity = useMemo<KeywordDensityItem[]>(() => {
    if (!text.trim()) return [];

    const rawWords = text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w: string) => w.length > 1);

    const filteredWords = ignoreStopWords
      ? rawWords.filter((w: string) => !STOP_WORDS.has(w))
      : rawWords;

    if (filteredWords.length === 0) return [];

    const counts: Record<string, number> = {};
    filteredWords.forEach((word: string) => {
      counts[word] = (counts[word] || 0) + 1;
    });

    const totalFiltered = filteredWords.length;

    return Object.entries(counts)
      .map(([word, count]) => ({
        word,
        count,
        percentage: Number(((count / totalFiltered) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [text, ignoreStopWords]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-xl text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md shadow-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                WordPulse
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Real-time text metrics & content analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Sample Text
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle Theme"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Text Analytics Workspace
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Type or paste your text below to analyze length, readability, and keywords.
              </p>
            </div>

            {/* Target Word Goal Controller */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={enableGoal}
                  onChange={(e) => setEnableGoal(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                />
                Target Goal
              </label>

              {enableGoal && (
                <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
                  <input
                    type="number"
                    min="10"
                    step="50"
                    value={targetWordGoal}
                    onChange={(e) => setTargetWordGoal(Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-center font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-slate-500">words</span>
                </div>
              )}
            </div>
          </div>

          {/* Goal Progress Bar */}
          {enableGoal && (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">
                  Goal Progress: {metrics.words} / {targetWordGoal} words
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {goalProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {}
        <section className="space-y-3">
          <div className="relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden">
            
            {/* Input Action Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <AlignLeft className="w-4 h-4" />
                <span>Input Area</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTools(!showTools)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg text-xs font-medium transition-colors ${
                    showTools
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Format Tools
                </button>

                <button
                  onClick={handleCopy}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={handleClear}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>

            {/* Optional Format Tools Bar */}
            {showTools && (
              <div className="px-4 py-3 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Change Case:</span>
                  {(['UPPER', 'lower', 'Title', 'Sentence'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleCaseChange(mode)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Find & Replace */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Find & Replace:</span>
                  <input
                    type="text"
                    placeholder="Find..."
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-28 sm:w-36"
                  />
                  <input
                    type="text"
                    placeholder="Replace with..."
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-28 sm:w-36"
                  />
                  <button
                    onClick={handleReplace}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors"
                  >
                    Replace All
                  </button>
                </div>
              </div>
            )}

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or start typing your content here..."
              rows={10}
              className="w-full p-4 sm:p-6 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y min-h-[220px] font-sans text-base leading-relaxed"
            />

            {/* Footer indicator within textarea */}
            <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/40 flex justify-between items-center text-xs text-slate-400">
              <span>{metrics.charsNoSpaces} characters (no spaces)</span>
              <span>Avg word length: {metrics.avgWordLength} chars</span>
            </div>
          </div>
        </section>

        {}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-500" />
            Core Statistics
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FileText}
              label="Words"
              value={metrics.words}
              subtext={`${metrics.sentences} sentences total`}
              color="emerald"
            />
            <StatCard
              icon={AlignLeft}
              label="Characters"
              value={metrics.charsWithSpaces}
              subtext={`${metrics.charsNoSpaces} excluding spaces`}
              color="blue"
            />
            <StatCard
              icon={BookOpen}
              label="Paragraphs"
              value={metrics.paragraphs}
              subtext="Distinct content blocks"
              color="purple"
            />
            <StatCard
              icon={Clock}
              label="Reading Time"
              value={`~${metrics.readingTimeMinutes}`}
              subtext="Minutes (@ 200 wpm)"
              color="amber"
            />
          </div>
        </section>

        {}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Keyword Density Panel */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Top Keyword Density
                </h3>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreStopWords}
                  onChange={(e) => setIgnoreStopWords(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500"
                />
                Exclude common stop words (e.g., "the", "and")
              </label>
            </div>

            {keywordDensity.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                Type text above to extract top keyword frequencies.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {keywordDensity.map((item, index) => (
                  <div key={item.word} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize text-slate-700 dark:text-slate-200 font-mono">
                        {index + 1}. {item.word}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.count} times ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, item.percentage * 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          {/* Estimated Speech & Reading Summary Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-500" />
              Delivery Insights
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated Speech Duration</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {metrics.speakingTimeMinutes} min{metrics.speakingTimeMinutes !== 1 ? 's' : ''}
                </p>
                <p className="text-slate-400">Based on standard speaking cadence of ~130 words/min.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Average Sentence Length</span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {metrics.sentences > 0 ? (metrics.words / metrics.sentences).toFixed(1) : 0} words
                </p>
                <p className="text-slate-400">Optimal readability is usually 15-20 words per sentence.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Content Structure</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium mt-1">
                  {metrics.paragraphs} paragraph(s) • {metrics.sentences} sentence(s)
                </p>
              </div>
            </div>
          </div>

        </section>

        {}
        {/* Freelancer Portfolio Footer Banner */}
        <footer className="pt-8 border-t border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <Code2 className="w-3.5 h-3.5" />
            <span>Built with React & Tailwind CSS • High-Performance Web Service</span>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Client-side calculation ensures complete privacy—no text is sent or saved on external servers.
          </p>
        </footer>

      </main>
    </div>
  );
}