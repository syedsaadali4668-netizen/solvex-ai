import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, LayoutDashboard, Compass, FolderKanban, History, 
  BarChart3, Settings, Bell, Search, Menu, X, ChevronRight,
  LogOut, Plus, CheckCircle2, Circle, AlertCircle, ArrowRight,
  Download, Copy, Save, Share2, Sparkles, Target, Zap, Clock,
  BookOpen, Briefcase, User, Lightbulb, TrendingUp, Calendar,
  ListChecks, Star
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Toaster, toast } from 'sonner';

// --- CONTEXT & STATE MANAGEMENT ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('solvex_auth') === 'true'
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('solvex_user')) || { name: 'User', email: 'user@solvex.ai' }
  );
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [solutions, setSolutions] = useState(
    JSON.parse(localStorage.getItem('solvex_solutions')) || []
  );

  useEffect(() => {
    localStorage.setItem('solvex_auth', isAuthenticated);
    localStorage.setItem('solvex_user', JSON.stringify(user));
    localStorage.setItem('solvex_solutions', JSON.stringify(solutions));
  }, [isAuthenticated, user, solutions]);

  const login = (email) => {
    setIsAuthenticated(true);
    setUser({ name: email.split('@')[0], email });
    setCurrentPage('dashboard');
    toast.success("Successfully logged in");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
    toast.info("Logged out safely");
  };

  const addSolution = (solution) => {
    setSolutions([solution, ...solutions]);
    toast.success("Solution saved to workspace!");
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated, login, logout, 
      user, currentPage, setCurrentPage,
      solutions, addSolution
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => useContext(AppContext);

// --- UTILS ---
const exportToPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) {
    toast.error("Could not find the document to export.");
    return;
  }
  
  toast.loading("Generating professional PDF...", { id: 'pdf-toast' });
  
  try {
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Page Dimensions & Margins
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const marginX = 12; // 12mm Left & Right Margin
    const marginTop = 15; // 15mm Top Margin
    const marginBottom = 15; // 15mm Bottom Margin
    
    const contentWidth = pdfWidth - (marginX * 2);
    const contentHeightPerPage = pdfHeight - marginTop - marginBottom;

    // Canvas scaling to match print area
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const pxToMmRatio = contentWidth / canvasWidth;
    const totalImageHeightMm = canvasHeight * pxToMmRatio;

    let heightLeft = totalImageHeightMm;
    let sY = 0; // Source Y position on canvas

    while (heightLeft > 0) {
      const sliceHeightMm = Math.min(contentHeightPerPage, heightLeft);
      const sliceHeightPx = sliceHeightMm / pxToMmRatio;

      // Create temporary canvas for each page slice
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth;
      tempCanvas.height = sliceHeightPx;
      const ctx = tempCanvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      ctx.drawImage(
        canvas,
        0, sY, canvasWidth, sliceHeightPx,
        0, 0, canvasWidth, sliceHeightPx
      );

      const sliceDataUrl = tempCanvas.toDataURL('image/png');

      // Add image slice within defined page margins
      pdf.addImage(
        sliceDataUrl,
        'PNG',
        marginX,
        marginTop,
        contentWidth,
        sliceHeightMm
      );

      heightLeft -= sliceHeightMm;
      sY += sliceHeightPx;

      if (heightLeft > 0) {
        pdf.addPage();
      }
    }
    
    pdf.save(`${filename}.pdf`);
    toast.success("PDF Downloaded successfully!", { id: 'pdf-toast' });
  } catch (error) {
    console.error(error);
    toast.error("Failed to generate PDF.", { id: 'pdf-toast' });
  }
};


// --- COMPONENTS ---

// 1. Navigation / Sidebar
const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { currentPage, setCurrentPage, logout } = useAppContext();
  
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'solver', icon: Brain, label: 'Solve a Problem' },
    { id: 'discover', icon: Compass, label: 'Discover' },
    { id: 'workspace', icon: FolderKanban, label: 'Workspace' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-border w-64 p-4">
      <div className="flex items-center gap-2 px-2 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight">SOLVEX AI</span>
      </div>
      
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-cyan-50 text-cyan-600 font-medium' 
                  : 'text-textMuted hover:bg-slate-50 hover:text-text'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-500' : ''}`} />
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="pt-4 border-t border-border mt-4">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">
        <NavContent />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 shadow-2xl md:hidden"
            >
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// 2. Header
const Header = ({ setIsMobileOpen }) => {
  const { user } = useAppContext();
  
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 md:hidden"
        >
          <Menu className="w-5 h-5 text-text" />
        </button>
        <div>
          <h2 className="font-semibold text-text">Good morning, {user.name}</h2>
          <p className="text-xs text-textMuted hidden sm:block">Let's turn today's challenges into meaningful progress.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:flex relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search solutions..." 
            className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-cyan-200 focus:ring-2 focus:ring-cyan-100 outline-none transition-all w-64"
          />
        </div>
        <button className="p-2 rounded-full hover:bg-slate-100 relative">
          <Bell className="w-5 h-5 text-textMuted" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-magenta-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm cursor-pointer">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

// 3. Problem Solver Engine Component (HARDWIRED TO LIVE AI ONLY)
const ProblemSolver = () => {
  const { addSolution, setCurrentPage } = useAppContext();
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('Business');
  const [status, setStatus] = useState('idle'); 
  const [activeStep, setActiveStep] = useState(0);
  const [generatedResult, setGeneratedResult] = useState(null);
  
  const analysisSteps = [
    "Understanding the core challenge...",
    "Analyzing contextual factors...",
    "Consulting AI knowledge base...",
    "Developing comprehensive strategy...",
    "Generating step-by-step roadmap...",
    "Extracting actionable insights..."
  ];

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please describe your problem first.");
      return;
    }
    
    setStatus('analyzing');
    setActiveStep(0);
    
    // Animate loading text
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < analysisSteps.length) {
        setActiveStep(step);
      }
    }, 800);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'your_api_key_here_without_quotes' || apiKey === '') {
        throw new Error("Missing API Key in .env file");
      }

      // Using the highly stable gemini-2.5-flash with key strictly in the URL
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const systemPrompt = `You are SOLVEX AI, an elite, professional problem-solving consultant. Analyze the user's problem and provide a highly detailed, comprehensive, and professional step-by-step guide.
      You MUST respond ONLY with a raw, valid JSON object. Do not wrap it in markdown blockquotes like \`\`\`json.
      Schema required:
      {
        "summary": "String (Detailed executive summary of the approach and why it works)",
        "strategy": "String (In-depth recommended overall strategy and mindset required)",
        "steps": [
          {
            "title": "String (Phase/Step name)", 
            "desc": "String (Comprehensive explanation of what to do and why it is critical)",
            "action_items": ["String (Specific actionable task 1)", "String (Specific actionable task 2)", "String (Specific actionable task 3)"]
          }
        ],
        "pro_tips": ["String (Expert advice or common pitfall to avoid 1)", "String (Expert advice 2)"]
      }
      Ensure the solution is exhaustive, highly actionable, realistic, and formatted beautifully. Do not use markdown inside the strings. Only return the JSON.`;

      const payload = {
        contents: [{ parts: [{ text: `Category: ${category}\nProblem: ${input}` }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API Network Error. Check console.");
      }
      
      const result = await response.json();
      
      if (!result.candidates || !result.candidates[0].content || !result.candidates[0].content.parts) {
          throw new Error("Invalid response format received from Google Gemini.");
      }
      
      let rawText = result.candidates[0].content.parts[0].text;
      
      // Force clean any accidental markdown from the AI response to guarantee JSON validity
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const aiData = JSON.parse(rawText);

      clearInterval(interval);
      setGeneratedResult({
        id: Date.now(),
        title: input.substring(0, 40) + '...',
        category,
        date: new Date().toLocaleDateString(),
        ...aiData
      });
      setStatus('result');

    } catch (error) {
      console.error("AI Generation failed:", error);
      clearInterval(interval);
      
      toast.error(`Google API Error: ${error.message}`);
      setStatus('idle');
    }
  };

  const handleSave = () => {
    if (generatedResult) {
      addSolution(generatedResult);
      setCurrentPage('workspace');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Live AI Problem Solver</h1>
        <p className="text-textMuted">Powered by Gemini AI. Describe any challenge, and the AI will engineer a comprehensive, professional action plan in real-time.</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="input-stage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 shadow-sm"
          >
            <div className="space-y-4">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="E.g., I need a comprehensive strategy to transition from a full-time job to launching my own digital agency within 6 months, including financial and client acquisition steps..."
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none transition-all text-text"
              />
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-textMuted font-medium">Category:</span>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-cyan-400 text-text font-medium"
                  >
                    <option>Business</option>
                    <option>Career</option>
                    <option>Education</option>
                    <option>Productivity</option>
                    <option>Personal</option>
                  </select>
                </div>
                <button 
                  onClick={handleGenerate}
                  className="px-6 py-2.5 bg-text text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-slate-200"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask Gemini AI
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-textMuted mb-4">Or try an example prompt:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Design a 3-month roadmap for learning full-stack web development",
                  "Create a strategy to scale my freelance business to $10k/month",
                  "Develop a system to organize my complex daily workflows and avoid burnout"
                ].map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="text-xs bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-full hover:bg-cyan-100 transition-colors border border-cyan-100 text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {status === 'analyzing' && (
          <motion.div 
            key="analysis-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 space-y-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-cyan-500 animate-spin"></div>
              <Brain className="w-6 h-6 text-cyan-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="h-6 text-center">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-text font-medium"
                >
                  {analysisSteps[activeStep]}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-textMuted mt-1">Connecting to Live Gemini API...</p>
            </div>
          </motion.div>
        )}

        {status === 'result' && generatedResult && (
          <motion.div 
            key="result-stage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div id="solution-document" className="glass-card p-6 sm:p-10 bg-white space-y-10 shadow-sm border border-slate-200">
              {/* Header Section */}
              <div className="border-b border-border pb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-full text-xs font-bold uppercase tracking-wider">
                      {generatedResult.category} Plan
                    </span>
                  </div>
                  <span className="text-xs font-medium text-textMuted flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {generatedResult.date}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-text mb-4 leading-tight">Comprehensive Action Strategy</h2>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-textMuted text-sm shadow-inner">
                  <span className="font-semibold text-text block mb-1">Challenge Analyzed:</span>
                  "{input}"
                </div>
              </div>

              {/* Summary Section */}
              <div>
                <h3 className="text-xl font-bold text-text flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <Target className="w-6 h-6 text-cyan-500" />
                  Executive Summary
                </h3>
                <p className="text-text leading-relaxed text-base">{generatedResult.summary}</p>
              </div>

              {/* Strategy Section */}
              <div>
                <h3 className="text-xl font-bold text-text flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <Brain className="w-6 h-6 text-purple-500" />
                  Core Strategy & Mindset
                </h3>
                <p className="text-text leading-relaxed text-base">{generatedResult.strategy}</p>
              </div>

              {/* Step-by-Step Guide Section */}
              <div>
                <h3 className="text-xl font-bold text-text flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                  <FolderKanban className="w-6 h-6 text-blue-500" />
                  Step-by-Step Execution Guide
                </h3>
                <div className="space-y-6">
                  {generatedResult.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>
                      
                      <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 font-bold flex items-center justify-center shrink-0 border border-cyan-100 text-lg">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-text mb-2">{step.title}</h4>
                        <p className="text-sm text-textMuted mb-4 leading-relaxed">{step.desc}</p>
                        
                        {step.action_items && step.action_items.length > 0 && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <ListChecks className="w-4 h-4" /> Action Items
                            </h5>
                            <ul className="space-y-2.5">
                              {step.action_items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-text">
                                  <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tips Section */}
              {generatedResult.pro_tips && generatedResult.pro_tips.length > 0 && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    Expert Tips & Pitfalls to Avoid
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 relative z-10">
                    {generatedResult.pro_tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                        <Lightbulb className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-200 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-3 justify-end pt-4">
              <button 
                onClick={() => setStatus('idle')}
                className="px-5 py-2.5 text-textMuted hover:bg-slate-100 rounded-xl transition-colors font-semibold text-sm border border-transparent"
              >
                Solve Another Challenge
              </button>
              <button 
                onClick={() => exportToPDF('solution-document', 'SOLVEX_Comprehensive_Plan')}
                className="px-5 py-2.5 border border-slate-200 text-text hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export as PDF
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-text text-white rounded-xl hover:bg-black transition-colors flex items-center gap-2 text-sm font-semibold shadow-lg"
              >
                <Save className="w-4 h-4" />
                Save to Workspace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// 4. Pages Structure
const Dashboard = ({ setIsMobileOpen }) => {
  const { user, solutions, setCurrentPage } = useAppContext();
  
  const stats = [
    { label: 'Problems Solved', value: solutions.length, icon: CheckCircle2, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { label: 'Active Projects', value: '3', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Productivity Score', value: '94%', icon: TrendingUp, color: 'text-magenta-500', bg: 'bg-magenta-50' },
  ];

  const chartData = [
    { name: 'Mon', tasks: 4 },
    { name: 'Tue', tasks: 3 },
    { name: 'Wed', tasks: 7 },
    { name: 'Thu', tasks: 5 },
    { name: 'Fri', tasks: 8 },
    { name: 'Sat', tasks: 2 },
    { name: 'Sun', tasks: 6 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Quick Action */}
      <div className="glass-card p-8 bg-gradient-to-br from-white to-cyan-50/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-32 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold text-text mb-4">What would you like to solve today?</h1>
          <p className="text-textMuted mb-6">Describe your challenge, and our intelligent engine will generate a comprehensive step-by-step roadmap for you.</p>
          <button 
            onClick={() => setCurrentPage('solver')}
            className="px-6 py-3 bg-text text-white rounded-xl font-medium hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
          >
            <Sparkles className="w-4 h-4" />
            Start New Analysis
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-text">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Weekly Activity</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EAF2" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Recent Solutions</h3>
            <button onClick={() => setCurrentPage('workspace')} className="text-sm text-cyan-600 font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {solutions.length === 0 ? (
              <p className="text-sm text-textMuted text-center py-8">No solutions saved yet.</p>
            ) : (
              solutions.slice(0, 4).map((sol, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                    <FolderKanban className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-text truncate">{sol.title}</p>
                    <p className="text-xs text-textMuted">{sol.category} • {sol.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const Workspace = () => {
  const { solutions } = useAppContext();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">My Workspace</h1>
          <p className="text-textMuted">Manage your saved solutions and active projects.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:border-cyan-400 outline-none w-full sm:w-48"
            />
          </div>
        </div>
      </div>

      {solutions.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center mt-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-text mb-2">Your workspace is empty</h3>
          <p className="text-textMuted mb-6 max-w-sm">Use the Problem Solver to generate intelligent action plans and save them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((sol, i) => (
            <div key={i} className="glass-card p-5 group hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-md text-slate-500 hover:text-cyan-600">
                   <Download className="w-4 h-4" />
                 </button>
              </div>
              <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold mb-3">
                {sol.category}
              </span>
              <h3 className="font-bold text-text mb-2 line-clamp-2">{sol.title}</h3>
              <p className="text-sm text-textMuted mb-4 line-clamp-2">{sol.summary}</p>
              <div className="flex items-center justify-between text-xs text-textMuted pt-4 border-t border-slate-100">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {sol.date}</span>
                <span className="flex items-center gap-1 font-medium text-cyan-600 cursor-pointer hover:underline">
                  View Plan <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// 5. Landing & Auth Logic
const LandingPage = () => {
  const { login } = useAppContext();
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if(email) login(email);
    else login('user@solvex.ai');
  };

  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-200/40 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-200/40 rounded-full blur-[100px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-md p-8 shadow-xl"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-xl gradient-bg flex items-center justify-center mb-4 shadow-lg shadow-cyan-200">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text">Welcome Back</h2>
            <p className="text-sm text-textMuted mt-1">Sign in to your intelligent workspace</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-text text-white rounded-xl font-semibold hover:bg-black transition-colors shadow-lg"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <button onClick={() => setShowAuth(false)} className="text-sm text-textMuted hover:text-text transition-colors">
               ← Back to Home
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      {/* Landing Navigation */}
      <nav className="fixed w-full z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-text">SOLVEX AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-textMuted">
            <a href="#" className="hover:text-cyan-600 transition-colors">Features</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Solutions</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowAuth(true)}
              className="text-sm font-medium text-text hover:text-cyan-600 transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button 
              onClick={() => setShowAuth(true)}
              className="px-5 py-2 bg-text text-white text-sm font-medium rounded-full hover:bg-black transition-colors shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
            Intelligence for everyday challenges
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-text tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Every Problem Has a <br/>
            <span className="gradient-text">Smarter Way Forward.</span>
          </h1>
          <p className="text-lg md:text-xl text-textMuted mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform complex challenges into comprehensive solutions. SOLVEX AI brings elite consulting strategies and structured execution plans directly into your workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setShowAuth(true)}
              className="w-full sm:w-auto px-8 py-4 bg-text text-white rounded-full font-semibold text-lg hover:bg-black transition-transform hover:scale-105 shadow-xl"
            >
              Start Solving Free
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-text border border-border rounded-full font-semibold text-lg hover:bg-slate-50 transition-colors shadow-sm">
              Explore Platform
            </button>
          </div>
        </motion.div>
        
        {/* Mockup Dashboard Image / Graphic */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 rounded-2xl"></div>
          <div className="glass-card p-2 md:p-4 rounded-2xl shadow-2xl border border-white/40 bg-white/50 backdrop-blur-xl">
             <div className="bg-slate-50 rounded-xl border border-border h-64 md:h-96 flex items-center justify-center relative overflow-hidden">
                <div className="absolute -left-10 top-10 w-32 h-32 bg-cyan-200 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute right-20 bottom-10 w-40 h-40 bg-magenta-200 rounded-full blur-3xl opacity-50"></div>
                <div className="text-center z-10">
                  <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Interactive Dashboard Interface</p>
                </div>
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};


// 6. Main App Shell
const AppLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { currentPage } = useAppContext();

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard setIsMobileOpen={setIsMobileOpen} />;
      case 'solver': return <ProblemSolver />;
      case 'workspace': return <Workspace />;
      default: return <Dashboard setIsMobileOpen={setIsMobileOpen} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};


// 7. Root App Component
export default function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" richColors />
      <AuthRouter />
    </AppProvider>
  );
}

const AuthRouter = () => {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? <AppLayout /> : <LandingPage />;
};