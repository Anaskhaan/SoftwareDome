"use client";

import React from "react";
import {
  Plus,
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
} from "@/lib/fa-icons";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";
import { getSoftwareById, updateSoftware } from "../../actions";
import { getCategories } from "@/app/categories/actions";
import { useRouter, useParams } from "next/navigation";

export default function EditSoftwarePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [activeTab, setActiveTab] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Form State
  const [basicInfo, setBasicInfo] = React.useState({
    name: "",
    rating: 0,
    reportUrl: "",
    introduction: "",
  });
  const [categories, setCategories] = React.useState<
    { id: string; name: string; slug: string; subcategories: { id: string; name: string; isGeneral: boolean }[] }[]
  >([]);
  const [categorySlug, setCategorySlug] = React.useState("");
  const [subcategoryId, setSubcategoryId] = React.useState("");

  React.useEffect(() => {
    getCategories().then((res) => {
      if (res.success) setCategories((res.data as any) || []);
    });
  }, []);

  const selectedCategory = categories.find((c) => c.slug === categorySlug);
  const subcategoryOptions = selectedCategory
    ? [...selectedCategory.subcategories].sort((a, b) => (a.isGeneral === b.isGeneral ? 0 : a.isGeneral ? -1 : 1))
    : [];
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
  });
  const [extraData, setExtraData] = React.useState({
    specifications: [{ key: "", value: "" }],
    faqs: [{ question: "", answer: "" }],
    sentiments: [{ theme: "", sentiment: "Positive", summary: "" }],
  });
  
  // Files & Existing Media
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [existingLogo, setExistingLogo] = React.useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [existingPictures, setExistingPictures] = React.useState<string[]>([]);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function loadData() {
      if (!id) return;
      const result = await getSoftwareById(id);
      if (result.success && result.data) {
        const s = result.data;
        setBasicInfo({
          name: s.name || "",
          rating: s.rating || 0,
          reportUrl: s.reportUrl || "",
          introduction: s.introduction || "",
        });
        const sub = (s as any).subcategory;
        if (sub) {
          setCategorySlug(sub.category.slug);
          setSubcategoryId(sub.id);
        }
        setAnalysis({
          ourVerdict: s.ourVerdict || "",
          keyTakeaways: s.keyTakeaways && s.keyTakeaways.length > 0 ? s.keyTakeaways : ["", "", ""],
          pros: s.pros && s.pros.length > 0 ? s.pros : ["", ""],
          cons: s.cons && s.cons.length > 0 ? s.cons : ["", ""],
        });
        setContentParts({
          howItWorks: s.howItWorks || "",
          whoIsItFor: s.whoIsItFor || "",
          howItIsDifferent: s.howItIsDifferent || "",
        });

        // Specs: Convert Map/Object to Array
        const specs = s.specifications as Record<string, string>;
        const specArray = specs ? Object.entries(specs).map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }];

        setExtraData({
          specifications: specArray.length > 0 ? specArray : [{ key: "", value: "" }],
          faqs: (s.faqs as any[])?.length > 0 ? (s.faqs as any[]) : [{ question: "", answer: "" }],
          sentiments: (s.sentiments as any[])?.length > 0 ? (s.sentiments as any[]) : [{ theme: "", sentiment: "Positive", summary: "" }],
        });
        
        setExistingLogo(s.logo || null);
        setExistingPictures(s.pictures || []);
      } else {
        setError("Could not find software profile.");
      }
      setIsLoading(false);
    }
    loadData();
  }, [id]);

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

  const handlePublish = async () => {
    if (isSubmitting) return;

    if (!basicInfo.name.trim()) {
      setError("Software name is required");
      setActiveTab(0);
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    
    // Basic Info
    formData.append("name", basicInfo.name);
    formData.append("subcategoryId", subcategoryId);
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

    // Extra Data
    const specs = extraData.specifications.reduce((acc: any, curr) => {
      if (curr.key.trim()) acc[curr.key] = curr.value;
      return acc;
    }, {});
    formData.append("specifications", JSON.stringify(specs));
    formData.append("faqs", JSON.stringify(extraData.faqs.filter(f => f.question.trim())));
    formData.append("sentiments", JSON.stringify(extraData.sentiments.filter(s => s.theme.trim())));
    
    // Files
    if (logoFile) formData.append("logo", logoFile);
    galleryFiles.forEach(file => formData.append("pictures", file));
    formData.append("existingPictures", JSON.stringify(existingPictures));

    try {
      const result = await updateSoftware(id, formData);
      if (result.success) {
        router.push("/dashboard/softwares");
      } else {
        setError(result.error || "Failed to update software");
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#0a192f] rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-bold">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <input
        ref={logoInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        tabIndex={-1}
        onChange={(e) => {
          setLogoFile(e.target.files?.[0] || null);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            setGalleryFiles((prev) => [...prev, ...files]);
          }
          e.target.value = "";
        }}
      />

      <AdminOutletHeading heading="Edit Software Profile" />

      <div className="max-w-5xl mx-auto mt-6">
        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 mb-6 shadow-sm">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.label}
                type="button"
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
          <form
            onSubmit={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                e.preventDefault();
              }
            }}
            className="p-8"
          >
            
            {/* TAB 0: GENERAL INFO */}
            {activeTab === 0 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Box size={16} className="text-brand-green-dark" /> Software Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium"
                      placeholder="e.g. SoftwareDome"
                      value={basicInfo.name}
                      onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Layers size={16} className="text-brand-green-dark" /> Category
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium"
                      value={categorySlug}
                      onChange={(e) => {
                        setCategorySlug(e.target.value);
                        setSubcategoryId("");
                      }}
                    >
                      <option value="">Select a category…</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium disabled:opacity-50"
                      value={subcategoryId}
                      onChange={(e) => setSubcategoryId(e.target.value)}
                      disabled={!selectedCategory}
                    >
                      <option value="">Select a subcategory…</option>
                      {subcategoryOptions.map((s) => (
                        <option key={s.id} value={s.id}>{s.isGeneral ? s.name : s.name}</option>
                      ))}
                    </select>
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium"
                      value={basicInfo.rating}
                      onChange={(e) => setBasicInfo({...basicInfo, rating: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-brand-green-dark" /> External Report URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium"
                    placeholder="https://trustpilot.com/..."
                    value={basicInfo.reportUrl}
                    onChange={(e) => setBasicInfo({...basicInfo, reportUrl: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Upload size={16} className="text-brand-green-dark" /> Software Logo
                  </label>
                  <div className="flex items-center gap-6 p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                      {logoFile ? (
                        <img src={URL.createObjectURL(logoFile)} className="w-full h-full object-contain" />
                      ) : existingLogo ? (
                        <img src={existingLogo} className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-700 mb-1">Click to {existingLogo ? 'update' : 'upload'} logo</p>
                      <p className="text-[10px] text-slate-500">PNG, JPG up to 2MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="cursor-pointer px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
                    >
                      Choose File
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700">Introduction</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium resize-none"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium resize-none"
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
                    <button type="button" onClick={() => addArrayItem(setAnalysis, "keyTakeaways")} className="text-brand-green-dark text-xs font-bold hover:underline">+ Add Point</button>
                  </div>
                  <div className="space-y-3">
                    {analysis.keyTakeaways.map((item, idx) => (
                      <div key={idx} className="relative group">
                        <input
                          type="text"
                          className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/15 font-medium"
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
                      <button type="button" onClick={() => addArrayItem(setAnalysis, "pros")} className="text-brand-green-dark text-xs font-bold hover:underline">+ Add Pro</button>
                    </div>
                    <div className="space-y-3">
                      {analysis.pros.map((item, idx) => (
                        <div key={idx} className="relative group">
                          <input
                            type="text"
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/15 font-medium"
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
                      <button type="button" onClick={() => addArrayItem(setAnalysis, "cons")} className="text-brand-green-dark text-xs font-bold hover:underline">+ Add Con</button>
                    </div>
                    <div className="space-y-3">
                      {analysis.cons.map((item, idx) => (
                        <div key={idx} className="relative group">
                          <input
                            type="text"
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/15 font-medium"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium resize-none"
                    placeholder="Describe the workflow or architecture..."
                    value={contentParts.howItWorks}
                    onChange={(e) => setContentParts({...contentParts, howItWorks: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <UsersIcon size={16} className="text-brand-green-dark" /> Who Is It For?
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium resize-none"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium resize-none"
                    placeholder="Unique selling points..."
                    value={contentParts.howItIsDifferent}
                    onChange={(e) => setContentParts({...contentParts, howItIsDifferent: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: MEDIA & DATA */}
            {activeTab === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* GALLERY */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 font-bold">Gallery Pictures</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Existing Pictures */}
                    {existingPictures.map((url, idx) => (
                      <div key={`exist-${idx}`} className="aspect-video relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setExistingPictures(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {/* New Pictures */}
                    {galleryFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="aspect-video relative rounded-2xl border border-brand-green/30 bg-brand-green/5 overflow-hidden group">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setGalleryFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-brand-green/100 text-white text-[8px] font-bold rounded uppercase">New</div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        galleryInputRef.current?.click();
                      }}
                      className="aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <Plus size={24} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500">Add Picture</span>
                    </button>
                  </div>
                </div>

                {/* SPECIFICATIONS */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Specifications (Key-Value)</label>
                    <button type="button" onClick={() => setExtraData(prev => ({ ...prev, specifications: [...prev.specifications, { key: "", value: "" }] }))} className="text-brand-green-dark text-xs font-bold hover:underline">+ Add Spec</button>
                  </div>
                  <div className="space-y-3">
                    {extraData.specifications.map((spec, idx) => (
                      <div key={idx} className="flex gap-4 items-center group">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/15 text-sm"
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
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/15 text-sm"
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
                    <button type="button" onClick={() => setExtraData(prev => ({ ...prev, faqs: [...prev.faqs, { question: "", answer: "" }] }))} className="text-brand-green-dark text-xs font-bold hover:underline">+ Add FAQ</button>
                  </div>
                  <div className="space-y-6">
                    {extraData.faqs.map((faq, idx) => (
                      <div key={idx} className="space-y-3 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl relative group">
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/15 text-sm font-semibold"
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
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/15 text-sm resize-none"
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

                {/* SENTIMENTS */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <MessageSquare size={16} className="text-emerald-500" /> Market Sentiment
                    </label>
                    <button type="button" onClick={() => setExtraData(prev => ({ ...prev, sentiments: [...prev.sentiments, { theme: "", sentiment: "Positive", summary: "" }] }))} className="text-brand-green-dark text-xs font-bold hover:underline">+ Add Row</button>
                  </div>
                  <div className="space-y-6">
                    {extraData.sentiments.map((row, idx) => (
                      <div key={idx} className="space-y-3 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl relative group">
                        <div className="flex gap-4">
                          <input
                            type="text"
                            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/15 text-sm font-semibold"
                            placeholder="Theme, e.g. Customer Support"
                            value={row.theme}
                            onChange={(e) => {
                              const next = [...extraData.sentiments];
                              next[idx] = { ...next[idx], theme: e.target.value };
                              setExtraData({ ...extraData, sentiments: next });
                            }}
                          />
                          <select
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/15 text-sm font-semibold"
                            value={row.sentiment}
                            onChange={(e) => {
                              const next = [...extraData.sentiments];
                              next[idx] = { ...next[idx], sentiment: e.target.value };
                              setExtraData({ ...extraData, sentiments: next });
                            }}
                          >
                            <option value="Positive">Positive</option>
                            <option value="Negative">Negative</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Mixed">Mixed</option>
                          </select>
                        </div>
                        <textarea
                          rows={2}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/15 text-sm resize-none"
                          placeholder="What users say, in plain English..."
                          value={row.summary}
                          onChange={(e) => {
                            const next = [...extraData.sentiments];
                            next[idx] = { ...next[idx], summary: e.target.value };
                            setExtraData({ ...extraData, sentiments: next });
                          }}
                        />
                        <button type="button" onClick={() => setExtraData(prev => ({ ...prev, sentiments: prev.sentiments.filter((_, i) => i !== idx) }))} className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm">
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
                    className="flex items-center gap-2 px-8 py-3 bg-brand-green/10 text-brand-green-dark font-bold rounded-2xl hover:bg-brand-green/20 transition-all"
                  >
                    Next Section
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-10 py-3 bg-[#0a192f] text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating Profile...
                      </>
                    ) : (
                      "Save Profile Changes"
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
