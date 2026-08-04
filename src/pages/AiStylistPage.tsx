import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Search, 
  Image as ImageIcon, 
  Wand2, 
  Grid, 
  Layout, 
  Download, 
  ChevronRight, 
  HelpCircle,
  FileEdit,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle,
  ShoppingBag
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  grounding?: { title: string; uri: string }[];
}

export function AiStylistPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { products, showToast, addToCart } = useStore();
  
  // TABS: 'chat' | 'visualizer'
  const [activeTab, setActiveTab] = useState<'chat' | 'visualizer'>('chat');
  
  // CHAT STATE
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your PGmart AI Personal Stylist. I have access to real-time Google Search fashion data to give you style matches, trend lookups for 2026, and accessory recommendations. Ask me anything, or try selecting one of our trending suggestions below!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // VISUALIZER STATE
  const [vizType, setVizType] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('An elegant Crimson Red Banarasi Saree with gold floral zari borders, displayed on a high-end minimalist studio mannequin, warm studio lighting, 1K photography');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // EDIT STATE SPECIALS
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState('Change the background to a festive terrace party decorated with warm golden fairy lights and flowers, night setting');

  // API configuration warning
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const triggerPaidModelFlow = () => {
    // Attempt to open the paid model selection UI
    if ((window as any).show_aistudio_ui) {
      (window as any).show_aistudio_ui({ ui_type: 'paid_model_flow' });
    } else {
      showToast("Triggering premium key selection. Check the AI Studio dashboard if available.");
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isChatLoading) return;

    if (!textToSend) {
      setInputMessage('');
    }

    const newMessages = [...chatMessages, { role: 'user', content: text } as Message];
    setChatMessages(newMessages);
    setIsChatLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/ai-stylist/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to communicate with AI');
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text,
        grounding: data.grounding
      }]);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message);
      showToast(err.message || "Failed to contact AI Stylist");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setApiError(null);

    try {
      const response = await fetch('/api/ai-stylist/visualize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          imageSize,
          model: selectedModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.image);
      showToast("Outfit generated successfully!");
    } catch (err: any) {
      console.error(err);
      setApiError(err.message);
      showToast(err.message || "Failed to generate visual outfit");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = async () => {
    if (!selectedProductForEdit || !editPrompt.trim() || isGenerating) {
      showToast("Please select a product and describe how to style it!");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setApiError(null);

    // Find the product image path
    const productObj = products.find(p => p.id === selectedProductForEdit);
    const targetImage = productObj?.colors[0]?.images[0] || productObj?.variants[0]?.images[0];

    if (!targetImage) {
      showToast("Could not find product image for styling.");
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch('/api/ai-stylist/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imagePath: targetImage,
          prompt: editPrompt,
          aspectRatio,
          imageSize,
          model: selectedModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit image');
      }

      const data = await response.json();
      setGeneratedImage(data.image);
      showToast("Slightly edited look generated!");
    } catch (err: any) {
      console.error(err);
      setApiError(err.message);
      showToast(err.message || "Failed to modify image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCartGenerated = () => {
    if (!generatedImage) return;
    
    // Create a mock customizable styled product item
    const mockStyledProduct = {
      id: `styled-${Date.now()}`,
      name: `Custom Styled Look (${vizType === 'generate' ? 'AI Draft' : 'AI Edit'})`,
      slug: `custom-styled-${Date.now()}`,
      categoryId: 'styled',
      subcategoryId: 'styled',
      description: `AI Visualized outfit generated from prompt: "${vizType === 'generate' ? prompt : editPrompt}"`,
      fabric: 'Premium Silk / Cotton Blend',
      fit: 'Tailored Tailor Fit',
      occasion: 'Festive Ceremonial',
      hsnCode: '6204',
      gstPercent: 5,
      basePrice: 4999,
      tags: ['new_arrival'],
      status: 'published' as const,
      colors: [{ name: 'Customized Hue', hex: '#FFFFFF', images: [generatedImage] }],
      variants: [{
        id: `styled-var-${Date.now()}`,
        productId: `styled-${Date.now()}`,
        size: 'Custom Size (Consult Stylist)',
        color: 'Customized Hue',
        colorHex: '#FFFFFF',
        sku: `AI-STY-${Date.now()}`,
        price: 4999,
        stock: 10,
        images: [generatedImage]
      }],
      availableSizes: ['Custom Fit'],
      rating: 5.0,
      reviewCount: 1,
      created_at: new Date().toISOString()
    };

    addToCart(mockStyledProduct as any, mockStyledProduct.variants[0]);
    showToast("Added custom tailored Look to cart!");
  };

  const samplePrompts = [
    "What accessories match the Hand-Woven Royal Banarasi Saree?",
    "What are the absolute trending outfit styles for weddings in 2026?",
    "How do I determine the right Kurta size for a chest size of 40 inches?",
    "Suggest a complete modern-fusion look combining traditional sarees with jackets"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      {/* HEADER HERO */}
      <div className="text-center mb-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C0654B]/10 text-[#C0654B] font-medium text-xs uppercase tracking-wider mb-4 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Gen AI Assistant
        </div>
        <h1 className="text-3xl lg:text-4xl font-serif text-stone-900 tracking-tight mb-3">
          PGmart AI Fashion Stylist & Visualizer
        </h1>
        <p className="text-stone-600 text-sm md:text-base">
          Get real-time style advice grounded in 2026 Google trends, get size chart analysis, or design and edit high-quality custom ethnic ensembles.
        </p>
      </div>

      {/* ERROR CORNER */}
      {apiError && (
        <div className="max-w-4xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-start text-red-800 text-sm">
          <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Configuration Needed</h4>
            <p className="mb-3">{apiError}</p>
            <button 
              onClick={triggerPaidModelFlow}
              className="px-4 py-1.5 bg-red-800 text-white font-medium text-xs rounded-lg hover:bg-red-900 transition-colors"
            >
              Select / Unlock API Keys
            </button>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT WITH TABS */}
      <div className="max-w-5xl mx-auto bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[620px]">
        {/* TAB NAVIGATION */}
        <div className="flex border-b border-stone-100 bg-stone-50/50 p-2 gap-1.5">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-white text-[#C0654B] shadow-xs border border-stone-100'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Stylist Chat & Advice
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'visualizer'
                ? 'bg-white text-[#C0654B] shadow-xs border border-stone-100'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            AI Lookbook & Outfit Visualizer
          </button>
        </div>

        {/* TAB CONTENT - CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col flex-1 h-[520px]">
            {/* MESSAGES FRAME */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[420px]">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm md:text-base leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#C0654B] text-white rounded-br-none shadow-xs'
                        : 'bg-stone-50 text-stone-800 border border-stone-100 rounded-bl-none'
                    }`}
                  >
                    {/* SENDER LABEL */}
                    <div className={`text-[10px] uppercase tracking-wider font-semibold mb-1 opacity-70 ${msg.role === 'user' ? 'text-stone-200' : 'text-stone-500'}`}>
                      {msg.role === 'user' ? 'You' : 'PGmart Fashion AI'}
                    </div>
                    
                    {/* TEXT BODY */}
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* SEARCH GROUNDING REFERENCES */}
                    {msg.grounding && msg.grounding.length > 0 && (
                      <div className="mt-3.5 pt-3.5 border-t border-stone-200/50">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C0654B] mb-2">
                          <Search className="w-3.5 h-3.5" />
                          Grounded Trends & Sources (2026):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.grounding.map((g, gIdx) => (
                            <a
                              key={gIdx}
                              href={g.uri}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-200 rounded-lg text-xs font-medium transition-all"
                            >
                              <span className="truncate max-w-[150px]">{g.title}</span>
                              <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 rounded-bl-none flex items-center gap-2.5 text-stone-500 text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C0654B]" />
                    Searching Google & styling recommendations...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* SUGGESTION PILLS */}
            {chatMessages.length === 1 && (
              <div className="px-4 md:px-6 py-2.5 bg-stone-50/50 border-t border-stone-100">
                <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">Suggested Styling Queries:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {samplePrompts.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSendMessage(p)}
                      className="text-left p-2.5 text-xs text-stone-700 hover:text-[#C0654B] bg-white border border-stone-200 hover:border-[#C0654B]/30 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center justify-between"
                    >
                      <span className="truncate pr-2">{p}</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* INPUT PANEL */}
            <div className="p-4 border-t border-stone-100 bg-white flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about trend colors, accessory matches, or size coordination..."
                className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#C0654B] bg-stone-50/30"
                disabled={isChatLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isChatLoading || !inputMessage.trim()}
                className="bg-[#C0654B] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-[#A9533B] disabled:bg-stone-200 disabled:text-stone-400 flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB CONTENT - VISUALIZER */}
        {activeTab === 'visualizer' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            {/* CONTROL BAR (LEFT COLUMN) */}
            <div className="md:col-span-5 p-5 md:p-6 border-r border-stone-100 flex flex-col gap-5 bg-stone-50/40">
              {/* SUB-TABS: CREATE NEW / EDIT EXISTING */}
              <div className="flex bg-stone-100 rounded-lg p-1 text-xs font-semibold">
                <button
                  onClick={() => setVizType('generate')}
                  className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
                    vizType === 'generate' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Create Custom Design
                </button>
                <button
                  onClick={() => setVizType('edit')}
                  className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
                    vizType === 'edit' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Style Store Garment
                </button>
              </div>

              {/* DYNAMIC FORM */}
              {vizType === 'generate' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Describe Dress to Generate</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-24 border border-stone-200 bg-white rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#C0654B]"
                    placeholder="Describe textures, garment types (Saree, Lehenga, Kurta), colors, background settings..."
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">1. Select Catalog Product</label>
                    <select
                      value={selectedProductForEdit}
                      onChange={(e) => setSelectedProductForEdit(e.target.value)}
                      className="w-full border border-stone-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C0654B]"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.basePrice})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">2. How to Style / Edit it?</label>
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className="w-full h-24 border border-stone-200 bg-white rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#C0654B]"
                      placeholder="e.g. Change the background to a festive party scene with diwali lights, or make background a royal wedding court..."
                    />
                  </div>
                </div>
              )}

              {/* SETTINGS BENTO */}
              <div className="space-y-4 pt-3 border-t border-stone-200/50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-stone-500" />
                  Generation Parameters
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* ASPECT RATIOS */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full border border-stone-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="1:1">1:1 Square</option>
                      <option value="3:4">3:4 Portrait</option>
                      <option value="4:3">4:3 Landscape</option>
                      <option value="9:16">9:16 Story</option>
                      <option value="16:9">16:9 Screen</option>
                    </select>
                  </div>

                  {/* IMAGE SIZES */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Image Quality</label>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full border border-stone-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="512px">512px (Draft)</option>
                      <option value="1K">1K (Standard)</option>
                      <option value="2K">2K (High-Res)</option>
                      <option value="4K">4K (Ultra Detail)</option>
                    </select>
                  </div>
                </div>

                {/* AI MODEL SELECT */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">AI Model Engine</label>
                    <button 
                      onClick={triggerPaidModelFlow}
                      className="text-[9px] text-[#C0654B] hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <Info className="w-2.5 h-2.5" /> Unlock / Pick Keys
                    </button>
                  </div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full border border-stone-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (Recommended)</option>
                    <option value="gemini-3-pro-image">gemini-3-pro-image (Pro Ultra Detail)</option>
                  </select>
                </div>
              </div>

              {/* ACTION TRIGGER BUTTON */}
              <button
                onClick={vizType === 'generate' ? handleGenerateImage : handleEditImage}
                disabled={isGenerating}
                className="w-full mt-auto bg-stone-900 text-white hover:bg-[#C0654B] text-xs font-bold uppercase py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:bg-stone-200 disabled:text-stone-400"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Styling outfit... (may take 10-20s)
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {vizType === 'generate' ? 'Generate Dress with AI' : 'Re-Style Garment'}
                  </>
                )}
              </button>
            </div>

            {/* PREVIEW FRAME (RIGHT COLUMN) */}
            <div className="md:col-span-7 p-6 flex flex-col justify-center items-center bg-stone-50 border-t md:border-t-0 border-stone-100 min-h-[380px]">
              {generatedImage ? (
                <div className="w-full max-w-sm flex flex-col items-center gap-4">
                  {/* GENERATED IMAGE WITH RATIO BOUNDS */}
                  <div className="w-full border border-stone-200 bg-white rounded-xl overflow-hidden shadow-sm aspect-square flex items-center justify-center">
                    <img
                      src={generatedImage}
                      alt="AI generated lookbook garment"
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* DOWNLOAD & ORDER ACTIONS */}
                  <div className="flex w-full gap-2.5">
                    <a
                      href={generatedImage}
                      download="custom-ai-dress.png"
                      className="flex-1 py-2 px-3 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-all flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Look
                    </a>
                    <button
                      onClick={handleAddToCartGenerated}
                      className="flex-1 py-2 px-3 bg-[#C0654B] text-white rounded-lg text-xs font-semibold hover:bg-[#A9533B] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Order Styled Outfit
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-500 text-center italic leading-relaxed">
                    This custom-generated masterpiece can be custom-tailored to your precise measurements by our styling consultants!
                  </p>
                </div>
              ) : isGenerating ? (
                <div className="text-center max-w-xs space-y-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#C0654B]/30 border-t-[#C0654B] animate-spin mx-auto mb-2" />
                  <h4 className="font-bold text-stone-800 text-sm">Weaving your garment look...</h4>
                  <p className="text-stone-500 text-xs">
                    Gemini is rendering your customized outfit request using state-of-the-art neural generation. Please hold on...
                  </p>
                </div>
              ) : (
                <div className="text-center p-8 max-w-xs space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-stone-800 text-sm">AI Visualization Studio</h4>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    Configure your design or select a catalog garment on the left, then trigger Gemini to render a realistic model lookbook scene.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER INFO CARDS */}
      <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-5 space-y-2">
          <div className="text-[#C0654B] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-4 h-4" />
            2026 Grounded Search
          </div>
          <h4 className="font-serif font-semibold text-stone-900 text-sm">Live Trend Lookups</h4>
          <p className="text-stone-600 text-xs leading-relaxed">
            Unlike static search, our stylist consults actual live Google search indexes to evaluate wedding, bridal, festive, and seasonal color trends as they emerge.
          </p>
        </div>
        <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-5 space-y-2">
          <div className="text-[#C0654B] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" />
            High-Resolution Rendering
          </div>
          <h4 className="font-serif font-semibold text-stone-900 text-sm">Draft up to 4K Details</h4>
          <p className="text-stone-600 text-xs leading-relaxed">
            Specify standard draft sizes or high-detail 4K resolution options to visually capture fine embroidery details, sequins, fabrics, and border patterns beautifully.
          </p>
        </div>
        <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-5 space-y-2">
          <div className="text-[#C0654B] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            No Copyright Risk
          </div>
          <h4 className="font-serif font-semibold text-stone-900 text-sm">Genuine & Custom Made</h4>
          <p className="text-stone-600 text-xs leading-relaxed">
            All styled output is rendered completely originally by Gemini, meaning you get a fresh, bespoke blueprint style designed entirely for you.
          </p>
        </div>
      </div>
    </div>
  );
}
