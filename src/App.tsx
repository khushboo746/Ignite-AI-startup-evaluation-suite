/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Rocket, 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  ShieldAlert, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface AnalysisResult {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  riskAssessment: string;
  strategicSuggestions: string[];
  solutions: string[];
  improvements: {
    businessPlan: string[];
    marketing: string[];
  };
  evaluationScore: number;
  marketTrends: { name: string; value: number }[];
  revenuePotential: { name: string; value: number }[];
  marketShare: { name: string; value: number }[];
  summary: string;
}

export default function App() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const evaluateIdea = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setHeroImage(null);

    try {
      // 1. Generate Analysis
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this startup idea: "${idea}". 
        Provide a detailed evaluation including SWOT, risk assessment, strategic suggestions, solutions to potential problems, and improvements for business plan and marketing.
        Also provide mock data for trends, revenue potential (5 years), and market share.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              swot: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["strengths", "weaknesses", "opportunities", "threats"],
              },
              riskAssessment: { type: Type.STRING },
              strategicSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              solutions: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: {
                type: Type.OBJECT,
                properties: {
                  businessPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                  marketing: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["businessPlan", "marketing"],
              },
              evaluationScore: { type: Type.NUMBER },
              marketTrends: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                  },
                },
              },
              revenuePotential: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                  },
                },
              },
              marketShare: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                  },
                },
              },
              summary: { type: Type.STRING },
            },
            required: [
              "swot", "riskAssessment", "strategicSuggestions", "solutions", 
              "improvements", "evaluationScore", "marketTrends", 
              "revenuePotential", "marketShare", "summary"
            ],
          },
        },
      });

      const parsedResult = JSON.parse(response.text || '{}') as AnalysisResult;
      setResult(parsedResult);

      // 2. Generate Cinematic Image
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A cinematic, high-quality, professional business-related image representing the startup idea: ${idea}. 
              Style: Modern, sleek, futuristic, corporate but innovative. 4k resolution, dramatic lighting.`,
            },
          ],
        },
      });

      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setHeroImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }

    } catch (err) {
      console.error(err);
      setError("Failed to evaluate the idea. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen cinematic-gradient flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Rocket className="text-white w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Ignite<span className="text-emerald-500">AI</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
          <a href="#" className="hover:text-white transition-colors">Methodology</a>
          <a href="#" className="hover:text-white transition-colors">Case Studies</a>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all">
            Documentation
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" /> AI-Powered Intelligence
            </span>
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Evaluate Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                Billion-Dollar Idea
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Transform raw concepts into data-driven strategies. Our AI analyzes market trends, 
              identifies risks, and provides a cinematic roadmap for your startup journey.
            </p>
          </motion.div>

          {/* Input Area */}
          <div className="max-w-3xl mx-auto relative">
            <div className="glass-card p-2 flex flex-col md:flex-row gap-2 animate-glow">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your startup idea in detail..."
                className="flex-1 bg-transparent border-none focus:ring-0 p-4 text-lg resize-none min-h-[100px] md:min-h-0"
              />
              <button
                onClick={evaluateIdea}
                disabled={loading || !idea.trim()}
                className="md:w-48 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/40 text-white font-bold rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Analyze Idea <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-4 flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="space-y-12"
            >
              {/* Top Summary & Score */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 glass-card p-8 relative overflow-hidden">
                  {heroImage && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <img src={heroImage} alt="Idea Visualization" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                      <Zap className="text-emerald-500" /> Executive Summary
                    </h3>
                    <div className="markdown-body text-white/80">
                      <Markdown>{result.summary}</Markdown>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
                  <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-white/5"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * result.evaluationScore) / 100}
                        className="text-emerald-500 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-display font-bold">{result.evaluationScore}</span>
                      <span className="text-xs text-white/40 uppercase tracking-tighter">Idea Score</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/60">
                    Based on market viability, scalability, and technical feasibility.
                  </p>
                </div>
              </div>

              {/* SWOT Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Strengths', items: result.swot.strengths, color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
                  { title: 'Weaknesses', items: result.swot.weaknesses, color: 'text-amber-400', bg: 'bg-amber-400/10', icon: AlertCircle },
                  { title: 'Opportunities', items: result.swot.opportunities, color: 'text-blue-400', bg: 'bg-blue-400/10', icon: TrendingUp },
                  { title: 'Threats', items: result.swot.threats, color: 'text-red-400', bg: 'bg-red-400/10', icon: ShieldAlert },
                ].map((category, idx) => (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card p-6"
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", category.bg)}>
                      <category.icon className={cn("w-6 h-6", category.color)} />
                    </div>
                    <h4 className={cn("font-display font-bold mb-4", category.color)}>{category.title}</h4>
                    <ul className="space-y-3">
                      {category.items.map((item, i) => (
                        <li key={i} className="text-sm text-white/70 flex gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-40" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                  <h4 className="text-xl font-display font-bold mb-8 flex items-center gap-2">
                    <LineChartIcon className="text-blue-400" /> Market Trends Over Time
                  </h4>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.marketTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff20', borderRadius: '8px' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={3} 
                          dot={{ fill: '#3b82f6', strokeWidth: 2 }} 
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h4 className="text-xl font-display font-bold mb-8 flex items-center gap-2">
                    <BarChart3 className="text-emerald-400" /> Revenue Potential (5Y Forecast)
                  </h4>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.revenuePotential}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff20', borderRadius: '8px' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Risk & Solutions */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card p-8 border-l-4 border-l-red-500/50">
                  <h4 className="text-xl font-display font-bold mb-6 flex items-center gap-2 text-red-400">
                    <ShieldAlert /> Risk Assessment
                  </h4>
                  <p className="text-white/80 leading-relaxed mb-8">
                    {result.riskAssessment}
                  </p>
                  <h5 className="font-bold mb-4 flex items-center gap-2">
                    <Lightbulb className="text-amber-400" /> Strategic Solutions
                  </h5>
                  <ul className="space-y-4">
                    {result.solutions.map((sol, i) => (
                      <li key={i} className="bg-white/5 p-4 rounded-xl text-sm text-white/70 border border-white/5">
                        {sol}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card p-8 border-l-4 border-l-blue-500/50">
                  <h4 className="text-xl font-display font-bold mb-8 flex items-center gap-2 text-blue-400">
                    <PieChartIcon /> Market Share Distribution
                  </h4>
                  <div className="h-[300px] w-full flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.marketShare}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {result.marketShare.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff20', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 ml-4">
                      {result.marketShare.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs text-white/60">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          {entry.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Improvements Section */}
              <div className="glass-card p-8">
                <h4 className="text-2xl font-display font-bold mb-10 text-center">Optimization Roadmap</h4>
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h5 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-400">
                      <Target className="w-5 h-5" /> Business Plan Improvements
                    </h5>
                    <div className="space-y-4">
                      {result.improvements.businessPlan.map((item, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 text-xs font-bold">
                            {i + 1}
                          </div>
                          <p className="text-white/70 text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-400">
                      <Sparkles className="w-5 h-5" /> Marketing Strategy
                    </h5>
                    <div className="space-y-4">
                      {result.improvements.marketing.map((item, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 text-xs font-bold">
                            {i + 1}
                          </div>
                          <p className="text-white/70 text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Suggestions */}
              <div className="bg-emerald-500 p-12 rounded-[2rem] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Rocket className="w-64 h-64 rotate-12" />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <h4 className="text-3xl font-display font-bold mb-6">Strategic Suggestions</h4>
                  <div className="space-y-4">
                    {result.strategicSuggestions.map((suggestion, i) => (
                      <div key={i} className="flex items-center gap-3 text-lg font-medium">
                        <ArrowRight className="shrink-0" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-12 border-t border-white/5 text-center text-white/40 text-sm">
        <div className="flex justify-center gap-8 mb-8">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p>© 2026 IgniteAI Evaluation Suite. Powered by Gemini.</p>
      </footer>
    </div>
  );
}
