"use client";

import React from "react";
import { 
  Plus, 
  Globe, 
  FileText, 
  Star, 
  AlertCircle, 
  Box, 
  Image as ImageIcon, 
  CheckCircle, 
  XCircle, 
  Info,
  Layers,
  Users as UsersIcon,
  Zap,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  X,
  Trash2,
  Upload
} from "lucide-react";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";
import { createSoftware } from "../actions";
import { useRouter } from "next/navigation";

export default function AddSoftwarePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form State
  const [basicInfo, setBasicInfo] = React.useState({
    name: "",
    website: "",
    rating: 0,
    reportUrl: "",
    introduction: "",
  });
  const [analysis, setAnalysis] = React.useState({
    ourVerdict: "",
    keyTakeaways: ["", "", ""],
    pros: ["", ""],
    cons: ["", ""],
  });
  const [contentParts, setContentParts] = React.useState({
    howItWorks: "",
    whoIsItFor: "",
    howItIsDifferent: "",
    sentiments: "",
  });
  const [extraData, setExtraData] = React.useState({
    specifications: [{ key: "", value: "" }],
    faqs: [{ question: "", answer: "" }],
  });
  
  // Files
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);

  const tabs = [
    { label: "General Info", icon: Info },
    { label: "Analysis", icon: Star },
    { label: "Deep Dive", icon: Layers },
    { label: "Media & Data", icon: ImageIcon },
  ];

  const handleArrayChange = (setter: any, index: number, value: string, field: string) => {
    setter((prev: any) => {
      const next = { ...prev };
      next[field][index] = value;
      return next;
    });
  };

  const addArrayItem = (setter: any, field: string) => {
    setter((prev: any) => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const removeArrayItem = (setter: any, field: string, index: number) => {
    setter((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    
    // Basic Info
    formData.append("name", basicInfo.name);
    formData.append("website", basicInfo.website);
    formData.append("rating", basicInfo.rating.toString());
    formData.append("reportUrl", basicInfo.reportUrl);
    formData.append("introduction", basicInfo.introduction);
    
    // Analysis
    formData.append("ourVerdict", analysis.ourVerdict);
    formData.append("keyTakeaways", JSON.stringify(analysis.keyTakeaways.filter(t => t.trim())));
    formData.append("pros", JSON.stringify(analysis.pros.filter(p => p.trim())));
    formData.append("cons", JSON.stringify(analysis.cons.filter(c => c.trim())));
    
    // Content Parts
    formData.append("howItWorks", contentParts.howItWorks);
    formData.append("whoIsItFor", contentParts.whoIsItFor);
    formData.append("howItIsDifferent", contentParts.howItIsDifferent);
    formData.append("sentiments", contentParts.sentiments);
    
    // Extra Data
    const specs = extraData.specifications.reduce((acc: any, curr) => {
      if (curr.key.trim()) acc[curr.key] = curr.value;
      return acc;
    }, {});
    formData.append("specifications", JSON.stringify(specs));
    formData.append("faqs", JSON.stringify(extraData.faqs.filter(f => f.question.trim())));
    
    // Files
    if (logoFile) formData.append("logo", logoFile);
    galleryFiles.forEach(file => formData.append("pictures", file));

    try {
      const result = await createSoftware(formData);
      if (result.success) {
        router.push("/dashboard/softwares");
      } else {
        setError(result.error || "Failed to create software");
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <AdminOutletHeading heading="Create Software Profile" />

      <div className="max-w-5xl mx-auto mt-6">
        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 mb-6 shadow-sm">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(idx)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-semibold text-sm ${
                  activeTab === idx 
                  ? "bg-[#0a192f] text-white shadow-md shadow-slate-200" 
                  : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 font-medium">
            <XCircle size={20} />
            {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[600px]">
          <form onSubmit={handleSubmit} className="p-8">
            
            {/* TAB 0: GENERAL INFO */}
            {activeTab === 0 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Box size={16} className="text-blue-500" /> Software Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                      placeholder="e.g. SoftwareDome"
                      value={basicInfo.name}
                      onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Globe size={16} className="text-blue-500" /> Website URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                      placeholder="https://example.com"
                      value={basicInfo.website}
                      onChange={(e) => setBasicInfo({...basicInfo, website: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Star size={16} className="text-yellow-500" /> Rating (0-5)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                      value={basicInfo.rating}
                      onChange={(e) => setBasicInfo({...basicInfo, rating: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" /> External Report URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                      placeholder="https://trustpilot.com/..."
                      value={basicInfo.reportUrl}
                      onChange={(e) => setBasicInfo({...basicInfo, reportUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Upload size={16} className="text-blue-500" /> Software Logo
                  </label>
                  <div className="flex items-center gap-6 p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                      {logoFile ? <img src={URL.createObjectURL(logoFile)} className="w-full h-full object-contain" /> : <ImageIcon size={24} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-700 mb-1">Click to upload logo</p>
                      <p className="text-[10px] text-slate-500">PNG, JPG up to 2MB</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      id="logo-upload" 
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50">
                      Choose File
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700">Introduction</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium resize-none"
                    placeholder="Briefly describe the software..."
                    value={basicInfo.introduction}
                    onChange={(e) => setBasicInfo({...basicInfo, introduction: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* TAB 1: ANALYSIS */}
            {activeTab === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700">Our Verdict</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium resize-none"
                    placeholder="Our professional take..."
                    value={analysis.ourVerdict}
                    onChange={(e) => setAnalysis({...analysis, ourVerdict: e.target.value})}
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" /> Key Takeaways
                    </label>
                    <button type="button" onClick={() => addArrayItem(setAnalysis, "keyTakeaways")} className="text-blue-600 text-xs font-bold hover:underline">+ Add Point</button>
                  </div>
                  <div className="space-y-3">
                    {analysis.keyTakeaways.map((item, idx) => (
                      <div key={idx} className="relative group">
                        <input
                          type="text"
                          className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                          value={item}
                          onChange={(e) => handleArrayChange(setAnalysis, idx, e.target.value, "keyTakeaways")}
                          placeholder={`Takeaway #${idx + 1}`}
                        />
                        <button type="button" onClick={() => removeArrayItem(setAnalysis, "keyTakeaways", idx)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-500" /> Pros
                      </label>
                      <button type="button" onClick={() => addArrayItem(setAnalysis, "pros")} className="text-blue-600 text-xs font-bold hover:underline">+ Add Pro</button>
                    </div>
                    <div className="space-y-3">
                      {analysis.pros.map((item, idx) => (
                        <div key={idx} className="relative group">
                          <input
                            type="text"
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                            value={item}
                            onChange={(e) => handleArrayChange(setAnalysis, idx, e.target.value, "pros")}
                            placeholder={`Pro #${idx + 1}`}
                          />
                          <button type="button" onClick={() => removeArrayItem(setAnalysis, "pros", idx)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <XCircle size={16} className="text-red-500" /> Cons
                      </label>
                      <button type="button" onClick={() => addArrayItem(setAnalysis, "cons")} className="text-blue-600 text-xs font-bold hover:underline">+ Add Con</button>
                    </div>
                    <div className="space-y-3">
                      {analysis.cons.map((item, idx) => (
                        <div key={idx} className="relative group">
                          <input
                            type="text"
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                            value={item}
                            onChange={(e) => handleArrayChange(setAnalysis, idx, e.target.value, "cons")}
                            placeholder={`Con #${idx + 1}`}
                          />
                          <button type="button" onClick={() => removeArrayItem(setAnalysis, "cons", idx)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DEEP DIVE */}
            {activeTab === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-500" /> How It Works
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium resize-none"
                    placeholder="Describe the workflow or architecture..."
                    value={contentParts.howItWorks}
                    onChange={(e) => setContentParts({...contentParts, howItWorks: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <UsersIcon size={16} className="text-blue-500" /> Who Is It For?
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium resize-none"
                    placeholder="Target audience or industry..."
                    value={contentParts.whoIsItFor}
                    onChange={(e) => setContentParts({...contentParts, whoIsItFor: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Layers size={16} className="text-purple-500" /> How Is It Different?
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium resize-none"
                    placeholder="Unique selling points..."
                    value={contentParts.howItIsDifferent}
                    onChange={(e) => setContentParts({...contentParts, howItIsDifferent: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MessageSquare size={16} className="text-emerald-500" /> Sentiments
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium resize-none"
                    placeholder="General market perception..."
                    value={contentParts.sentiments}
                    onChange={(e) => setContentParts({...contentParts, sentiments: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: MEDIA & DATA */}
            {activeTab === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* GALLERY */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700">Gallery Pictures</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryFiles.map((file, idx) => (
                      <div key={idx} className="aspect-video relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden group">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setGalleryFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                      <Plus size={24} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500">Add Picture</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setGalleryFiles(prev => [...prev, ...files]);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* SPECIFICATIONS */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Specifications (Key-Value)</label>
                    <button type="button" onClick={() => setExtraData(prev => ({ ...prev, specifications: [...prev.specifications, { key: "", value: "" }] }))} className="text-blue-600 text-xs font-bold hover:underline">+ Add Spec</button>
                  </div>
                  <div className="space-y-3">
                    {extraData.specifications.map((spec, idx) => (
                      <div key={idx} className="flex gap-4 items-center group">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                          placeholder="e.g. License"
                          value={spec.key}
                          onChange={(e) => {
                            const next = [...extraData.specifications];
                            next[idx].key = e.target.value;
                            setExtraData({...extraData, specifications: next});
                          }}
                        />
                        <input
                          type="text"
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                          placeholder="e.g. SaaS"
                          value={spec.value}
                          onChange={(e) => {
                            const next = [...extraData.specifications];
                            next[idx].value = e.target.value;
                            setExtraData({...extraData, specifications: next});
                          }}
                        />
                        <button type="button" onClick={() => setExtraData(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== idx) }))} className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQS */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">FAQs</label>
                    <button type="button" onClick={() => setExtraData(prev => ({ ...prev, faqs: [...prev.faqs, { question: "", answer: "" }] }))} className="text-blue-600 text-xs font-bold hover:underline">+ Add FAQ</button>
                  </div>
                  <div className="space-y-6">
                    {extraData.faqs.map((faq, idx) => (
                      <div key={idx} className="space-y-3 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl relative group">
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold"
                          placeholder="Question..."
                          value={faq.question}
                          onChange={(e) => {
                            const next = [...extraData.faqs];
                            next[idx].question = e.target.value;
                            setExtraData({...extraData, faqs: next});
                          }}
                        />
                        <textarea
                          rows={2}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm resize-none"
                          placeholder="Answer..."
                          value={faq.answer}
                          onChange={(e) => {
                            const next = [...extraData.faqs];
                            next[idx].answer = e.target.value;
                            setExtraData({...extraData, faqs: next});
                          }}
                        />
                        <button type="button" onClick={() => setExtraData(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== idx) }))} className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => activeTab > 0 ? setActiveTab(activeTab - 1) : router.push("/dashboard/softwares")}
                className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                <ChevronLeft size={20} />
                {activeTab === 0 ? "Cancel" : "Previous Section"}
              </button>

              <div className="flex gap-4">
                {activeTab < 3 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab + 1)}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-100 transition-all"
                  >
                    Next Section
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-10 py-3 bg-[#0a192f] text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      "Publish Software Profile"
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
