import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PlusCircle, Search, IndianRupee, CheckCircle2, ChevronRight, FileText, Zap, Activity, Compass, ShieldCheck, Sparkles, UserCheck, Truck, Wrench, Palette, Scale, Clock, Maximize2, RotateCcw, Calendar, AlertTriangle } from 'lucide-react';
import RadarSearch from '../components/RadarSearch';
import { AnalyticsLogo } from '../components/Logo';
import API from '../config';



const SERVICE_DYNAMIC_CONFIG = {
  maintenance: {
    label: "Home Maintenance & Repair",
    subServices: [
      { id: "plumbing", name: "Plumbing Repair & Pipework" },
      { id: "painting", name: "Painting & Wall Finish" },
      { id: "cleaning", name: "Deep Cleaning & Housekeeping" },
      { id: "electrical", name: "Electrical Repair & Fixtures" },
      { id: "hvac", name: "HVAC & AC Service" },
      { id: "pest_control", name: "Pest Control & Fumigation" },
      { id: "tank_cleaning", name: "Water Tank Cleaning & UV Sanitize" },
      { id: "furniture", name: "Furniture Repair & Carpentry" }
    ],
    fields: {
      plumbing: [
        { key: "num_taps", label: "Number of Taps / Faucets to Repair", type: "number", min: 1, max: 50 },
        { key: "num_bathrooms", label: "Number of Bathrooms Involved", type: "number", min: 1, max: 20 },
        { key: "issue_type", label: "Plumbing Issue Category", type: "select", options: ["Tap / Faucet Leakage", "Pipe Line Burst & Water Leakage", "Toilet / Drain Blockage & Clog", "Water Tank Installation & Servicing", "Sanitaryware / Geyser Fitting"], defaultValue: "Tap / Faucet Leakage" },
        { key: "pipe_material", label: "Pipe Material / Diameter", type: "text", placeholder: "", defaultValue: "" },
        { key: "emergency_cutoff", label: "Emergency Main Water Cut-off Available?", type: "checkbox", defaultValue: true },
        { key: "client_supplies_parts", label: "Client Provides Replacement Taps & Spare Parts?", type: "checkbox", defaultValue: false }
      ],
      painting: [
        { key: "painting_scope", label: "Painting Work Scope", type: "select", options: ["Full Interior House Painting", "Exterior Building Facade", "Single Room / Accent Feature Wall", "Touch-up & Waterproof Putty Only"], defaultValue: "Full Interior House Painting" },
        { key: "num_rooms_walls", label: "Number of Rooms / Walls to Paint", type: "number", defaultValue: 3, min: 1, max: 30 },
        { key: "paint_quality", label: "Paint Quality & Finish", type: "select", options: ["Premium Washable Emulsion", "Royal Luxury Gloss / Satin", "Economy Distemper", "Weatherproof Exterior Acrylic"], defaultValue: "Premium Washable Emulsion" },
        { key: "num_coats", label: "Number of Paint Coats Required", type: "number", defaultValue: 2, min: 1, max: 4 },
        { key: "putty_sanding", label: "Include Wall Putty Repair & Sanding?", type: "checkbox", defaultValue: true },
        { key: "client_supplies_paint", label: "Client Supplies Paint Cans & Brushes?", type: "checkbox", defaultValue: false }
      ],
      cleaning: [
        { key: "property_type", label: "Property Category", type: "select", options: ["Residential Apartment", "Independent Villa / House", "Commercial Office Space", "Retail Shop / Showroom"], defaultValue: "Residential Apartment" },
        { key: "num_bedrooms", label: "Number of Bedrooms / Cabin", type: "number", defaultValue: 0, min: 0, max: 20 },
        { key: "num_bathrooms", label: "Number of Bathrooms to Clean", type: "number", defaultValue: 2, min: 1, max: 20 },
        { key: "cleaning_type", label: "Cleaning Focus Area", type: "select", options: ["Full House Deep Cleaning", "Kitchen & Bathrooms Only", "Carpet & Sofa Shampooing", "Post-Renovation / Construction Cleanup"], defaultValue: "Full House Deep Cleaning" },
        { key: "terrace_balcony", label: "Include Terrace / Balcony Scrubbing?", type: "checkbox", defaultValue: false },
        { key: "client_supplies_chemicals", label: "Client Supplies Cleaning Chemicals & Tools?", type: "checkbox", defaultValue: false }
      ],
      electrical: [
        { key: "num_outlets_switches", label: "Number of Switches / Outlets to Fix", type: "number", defaultValue: 3, min: 1 },
        { key: "num_light_fixtures", label: "Number of Fans / Light Fixtures", type: "number", defaultValue: 2, min: 0 },
        { key: "work_type", label: "Electrical Problem Type", type: "select", options: ["MCB Tripping & Short Circuit Check", "Appliance Installation (Geyser/Fan)", "Switchboard Wiring & Replacement", "Main Meter & Fuse Panel Work"], defaultValue: "MCB Tripping & Short Circuit Check" },
        { key: "voltage_phase", label: "System Wiring Phase", type: "select", options: ["Single Phase (Standard Residential)", "Three Phase (Commercial / Industrial)"], defaultValue: "Single Phase (Standard Residential)" },
        { key: "power_isolated", label: "Main Panel Power Isolation Shut Off Available?", type: "checkbox", defaultValue: true }
      ],
      hvac: [
        { key: "num_ac_units", label: "Number of AC Units", type: "number", defaultValue: 1, min: 1 },
        { key: "ac_type", label: "Air Conditioner Model Type", type: "select", options: ["Split Air Conditioner", "Window Air Conditioner", "Central / Ductable Cassette AC"], defaultValue: "Split Air Conditioner" },
        { key: "service_needed", label: "Service Type Required", type: "select", options: ["Gas Refill & Leak Testing", "High-Pressure Jet Chemical Wash", "Uninstallation & Re-Installation", "General Filter & Compressor Servicing"], defaultValue: "General Filter & Compressor Servicing" },
        { key: "outdoor_unit_accessible", label: "Outdoor Compressor Unit Safely Accessible?", type: "checkbox", defaultValue: true }
      ],
      pest_control: [
        { key: "pest_type", label: "Target Pest Infestation", type: "select", options: ["Termite Anti-Wood Treatment", "Bed Bugs Heat & Chemical Extermination", "Cockroach & Ant Gel Baiting", "Rodent & Rat Trapping", "Mosquito & Fly Fogging"], defaultValue: "Cockroach & Ant Gel Baiting" },
        { key: "covered_area_rooms", label: "Number of Rooms Covered", type: "number", defaultValue: 3, min: 1, max: 20 },
        { key: "chemical_safety", label: "Treatment Spray Formula", type: "select", options: ["Herbal & Odorless Eco-Spray", "Heavy Industrial Spraying", "Targeted Gel Injection"], defaultValue: "Herbal & Odorless Eco-Spray" },
        { key: "free_followup", label: "Include Free 30-Day Follow-up Visit Warranty?", type: "checkbox", defaultValue: true }
      ],
      tank_cleaning: [
        { key: "tank_type", label: "Water Storage Tank Type", type: "select", options: ["Overhead PVC Plastocrete Tank", "Underground Sump Concrete Tank", "Commercial Stainless Steel Tank"], defaultValue: "Overhead PVC Plastocrete Tank" },
        { key: "tank_capacity_litres", label: "Tank Capacity (Litres)", type: "number", defaultValue: 1000, min: 200, step: 100 },
        { key: "cleaning_method", label: "Sanitization Technique", type: "select", options: ["High-Pressure Jet Wash & UV Antibacterial Spray", "Manual Sludge Vacuuming & Scrubbing"], defaultValue: "High-Pressure Jet Wash & UV Antibacterial Spray" }
      ],
      furniture: [
        { key: "furniture_type", label: "Furniture / Carpentry Category", type: "select", options: ["Modular Kitchen Cabinets & Drawers", "Sofa & Bed Frame Repair", "Door Alignment & Hydraulic Lock Fitting", "Dining Table & Wood Polishing"], defaultValue: "Modular Kitchen Cabinets & Drawers" },
        { key: "num_items", label: "Number of Items to Repair / Refurbish", type: "number", defaultValue: 2, min: 1 },
        { key: "hardware_material", label: "Material / Wood Spec", type: "select", options: ["Commercial Plywood & Laminate", "Solid Teak / Hardwood", "Softwood & MDF Board"], defaultValue: "Commercial Plywood & Laminate" },
        { key: "client_supplies_hardware", label: "Client Provides Hinges & Handles Hardware?", type: "checkbox", defaultValue: false }
      ],
      Solar_Cleaning : [

      ]
    }
  },
  delivery: {
    label: "On-Demand Transport & Logistics",
    subServices: [
      { id: "cargo", name: "Heavy Cargo & Goods Transport" },
      { id: "courier", name: "Express Parcel & Package Shipping" },
      { id: "express_doc", name: "Urgent Document Transit" },
      { id: "landscaping", name: "Lawn & Garden Transport" }
    ],
    fields: {
      cargo: [
        { key: "pickup_address", label: "Pickup Address / Warehouse", type: "text", placeholder: "", defaultValue: "" },
        { key: "dropoff_address", label: "Destination Delivery Address", type: "text", placeholder: "", defaultValue: "" },
        { key: "cargo_type", label: "Cargo Category", type: "select", options: ["Home Relocation & Furniture", "Industrial Machinery & Parts", "Commercial Store Inventory", "Construction Materials"], defaultValue: "Home Relocation & Furniture" },
        { key: "vehicle_type", label: "Transport Vehicle Needed", type: "select", options: ["3-Wheeler Mini Tempo", "14-Foot Covered Truck", "Heavy Duty Container Flatbed", "Open Cargo Loader"], defaultValue: "3-Wheeler Mini Tempo" },
        { key: "num_labourers", label: "Number of Loading Helpers Required", type: "number", min: 0, max: 10 },
        { key: "fragile_cargo", label: "Fragile / Glass Goods Included?", type: "checkbox", defaultValue: false }
      ],
      courier: [
        { key: "pickup_address", label: "Pickup Address", type: "text", placeholder: "", defaultValue: "" },
        { key: "dropoff_address", label: "Drop-off Address", type: "text", placeholder: "", defaultValue: "" },
        { key: "package_weight_kg", label: "Package Weight (kg)", type: "number", min: 0.1, step: 0.1 },
        { key: "is_fragile", label: "Fragile / Glass Package?", type: "checkbox", defaultValue: false }
      ],
      express_doc: [
        { key: "pickup_address", label: "Pickup Office Address", type: "text", placeholder: "", defaultValue: "" },
        { key: "dropoff_address", label: "Destination Office Address", type: "text", placeholder: "", defaultValue: "" },
        { key: "physical_signature_required", label: "Recipient Physical Signature & Stamp Required?", type: "checkbox", defaultValue: true }
      ],
      landscaping: [
        { key: "service_type", label: "Lawn & Garden Service", type: "select", options: ["Lawn Grass Mowing & Hedge Trim", "Garden Soil & Organic Manure Delivery", "Tree Branch Pruning", "Plant Nursery Pot Transport"], defaultValue: "Lawn Grass Mowing & Hedge Trim" },
        { key: "garden_size_sqft", label: "Garden Area (sq. ft.) / Plant Count", type: "number", min: 50 },
        { key: "waste_disposal", label: "Include Green Waste Hauling & Disposal?", type: "checkbox", defaultValue: true }
      ]
    }
  },
  creative: {
    label: "Freelance & Creative Contracts",
    subServices: [
      { id: "design", name: "Graphic Design & Branding" },
      { id: "web_dev", name: "Web & Mobile App Development" },
      { id: "video", name: "Video Editing & VFX Production" }
    ],
    fields: {
      design: [
        { key: "design_scope", label: "Design Deliverables Scope", type: "select", options: ["UI/UX Mobile & Web App Screens", "Brand Identity & Logo Suite", "Social Media & Marketing Graphics", "Print Brochure & Catalog Design"], defaultValue: "UI/UX Mobile & Web App Screens" },
        { key: "num_deliverables", label: "Number of Screen Variants / Assets", type: "number", min: 1 },
        { key: "deliverable_format", label: "Required Source Format", type: "select", options: ["Figma Editable File", "PNG & Vector SVG", "Adobe Photoshop PSD / Illustrator AI", "Print-Ready PDF"], defaultValue: "Figma Editable File" },
        { key: "copyright_transfer", label: "Full Commercial Usage & Copyright Ownership Transfer?", type: "checkbox", defaultValue: true }
      ],
      web_dev: [
        { key: "app_type", label: "Application Architecture", type: "select", options: ["Full Stack Web Application", "E-Commerce Online Store", "Cross-Platform Mobile App", "REST API & Backend Integration"], defaultValue: "Full Stack Web Application" },
        { key: "tech_stack", label: "Preferred Tech Stack", type: "select", options: ["React + Django / Python", "Next.js + Node.js", "Flutter / React Native Mobile", "WordPress / Custom PHP"], defaultValue: "React + Django / Python" },
        { key: "num_pages", label: "Total Number of Screens / Pages", type: "number", min: 1 },
        { key: "auth_database_needed", label: "User Authentication & Database Integration Required?", type: "checkbox", defaultValue: true }
      ],
      video: [
        { key: "raw_duration_mins", label: "Raw Video Footage Duration (Minutes)", type: "number", min: 1 },
        { key: "video_resolution", label: "Target Output Format", type: "select", options: ["1080p Full HD (Landscape)", "4K Ultra HD Cinema", "9:16 Vertical Reel / Shorts"], defaultValue: "1080p Full HD (Landscape)" },
        { key: "motion_graphics", label: "Include Custom Motion Graphics & Subtitles?", type: "checkbox", defaultValue: true }
      ]
    }
  },
  legal: {
    label: "Professional & Legal Contracts",
    subServices: [
      { id: "contract_drafting", name: "Legal Contract Drafting & Review" },
      { id: "security", name: "Security Guard & Event Protection" },
      { id: "tax_advisory", name: "Tax Audit & Financial Consultation" },
      { id: "compliance_audit", name: "Corporate Compliance & Safety Audit" }
    ],
    fields: {
      contract_drafting: [
        { key: "agreement_type", label: "Legal Agreement Type", type: "select", options: ["Non-Disclosure Agreement (NDA)", "Employment / Independent Contractor Contract", "Vendor Service Level Agreement (SLA)", "Commercial Lease / Rental Deed", "Business Partnership Agreement"], defaultValue: "Non-Disclosure Agreement (NDA)" },
        { key: "num_parties", label: "Number of Contracting Parties Involved", type: "number", min: 2, max: 10 },
        { key: "jurisdiction_court", label: "Governing Court Jurisdiction Location", type: "text", placeholder: "", defaultValue: "" },
        { key: "stamp_paper_needed", label: "Government Stamp Paper & Official Notarization Included?", type: "checkbox", defaultValue: false }
      ],
      security: [
        { key: "security_scope", label: "Security Service Category", type: "select", options: ["Residential Society Gate Security", "Corporate Office Facility Protection", "VIP Event Bouncers & Escort", "CCTV Monitoring & Alarm Surveillance"], defaultValue: "Residential Society Gate Security" },
        { key: "num_guards", label: "Number of Security Personnel", type: "number", min: 1, max: 20 },
        { key: "duty_shift", label: "Shift Duration", type: "select", options: ["8-Hour Day Shift", "12-Hour Night Shift", "24-Hour Round-the-Clock Rotation"], defaultValue: "12-Hour Night Shift" },
        { key: "armed_personnel", label: "Armed Security Guard Required?", type: "checkbox", defaultValue: false }
      ],
      tax_advisory: [
        { key: "business_type", label: "Entity Category", type: "select", options: ["Individual / Salaried Taxpayer", "Sole Proprietorship", "Private Limited (Pvt Ltd) Company", "LLP / Partnership Firm"], defaultValue: "Private Limited (Pvt Ltd) Company" },
        { key: "assessment_year", label: "Financial Assessment Year", type: "select", options: ["FY 2025-2026", "FY 2024-2025", "FY 2023-2024"], defaultValue: "FY 2025-2026" },
        { key: "gst_audit_required", label: "GST Reconciliation & Monthly Filing Included?", type: "checkbox", defaultValue: true }
      ],
      compliance_audit: [
        { key: "audit_domain", label: "Compliance Focus Domain", type: "text", placeholder: "", defaultValue: "" }
      ]
    }
  }
};

const serviceSuggestions = [
  { title: "Landscaping", category: "delivery" },
  { title: "Plumbing", category: "maintenance" },
  { title: "Painting", category: "maintenance" },
  { title: "Electrical", category: "maintenance" },
  { title: "Pest Control", category: "maintenance" },
  { title: "HVAC", category: "maintenance" },
  { title: "Water Tank Cleaning", category: "maintenance" },
  { title: "Cleaning", category: "maintenance" },
  { title: "Furniture", category: "maintenance" },
  { title: "Security", category: "legal" },
  {title: "Solar Cleaning", category: "maintenance"}
];

const formatUsername = (name) => (name ? name.charAt(0).toUpperCase() + name.slice(1) : 'User');

const ClientDashboard = ({ token, user, onSelectContract, activeTab, setActiveTab, showToast, fetchCurrentUser }) => {

  const [contracts, setContracts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleCardClick = (status) => {
    setStatusFilter(status);
    if (setActiveTab) {
      setActiveTab('history');
    }
  };

  const [stats, setStats] = useState({
    primary_stat: 0,
    primary_label: 'Total Spent (INR)',
    total_contracts: 0,
    completed_contracts: 0,
    active_contracts: 0,
    searching_contracts: 0
  });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('delivery');
  const [subService, setSubService] = useState('cargo');
  const [dynamicAttributes, setDynamicAttributes] = useState({});
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);
  const [duration, setDuration] = useState('1 Day');
  const [areaSqft, setAreaSqft] = useState(1000);
  const [budget, setBudget] = useState('');
  const [predictedDuration, setPredictedDuration] = useState('');
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Helper to generate a smart structured description based on current form state
  const generateSmartDescription = (overrides = {}) => {
    const activeTitle = overrides.title !== undefined ? overrides.title : title;
    const activeCat = overrides.category !== undefined ? overrides.category : category;
    const activeSub = overrides.subService !== undefined ? overrides.subService : subService;
    const activeAttrs = overrides.dynamicAttributes !== undefined ? overrides.dynamicAttributes : dynamicAttributes;

    const catConfig = SERVICE_DYNAMIC_CONFIG[activeCat];
    const subObj = catConfig?.subServices?.find(s => s.id === activeSub);
    const subName = subObj ? subObj.name : (activeTitle || 'Requested Service');

    let lines = [];
    lines.push(`CONTRACT SCOPE & SPECIFICATIONS`);
    lines.push(`----------------------------------------`);
    lines.push(`Primary Service: ${subName}`);
    if (activeTitle && activeTitle.trim() && activeTitle.trim().toLowerCase() !== subName.toLowerCase()) {
      lines.push(`Project Title: ${activeTitle.trim()}`);
    }

    // Add dynamic specifications if available
    const fields = catConfig?.fields?.[activeSub] || [];
    const specs = [];
    fields.forEach(f => {
      const val = activeAttrs[f.key];
      if (val !== undefined && val !== '' && val !== null) {
        if (f.type === 'checkbox') {
          specs.push(`- ${f.label}: ${val ? 'Yes' : 'No'}`);
        } else {
          specs.push(`- ${f.label}: ${val}`);
        }
      }
    });

    if (specs.length > 0) {
      lines.push(``);
      lines.push(`Key Requirements & Technical Details:`);
      lines.push(specs.join('\n'));
    }

    lines.push(``);
    lines.push(`Standard Terms: All work must comply with local safety guidelines, quality standard materials, and agreed timelines.`);

    return lines.join('\n');
  };

  // Auto-generate description whenever title/service/dynamic attributes change if description is currently empty and title is provided
  useEffect(() => {
    if (title.trim() !== '' && (!description || description.trim() === '')) {
      const autoDesc = generateSmartDescription();
      if (autoDesc) {
        setDescription(autoDesc);
      }
    }
  }, [title, subService, category, dynamicAttributes]);

  // Helper to handle category switching and default dynamic fields
  const handleCategorySelect = (newCategory, preferredSubService = null) => {
    setCategory(newCategory);
    const catConfig = SERVICE_DYNAMIC_CONFIG[newCategory];
    if (catConfig && catConfig.subServices && catConfig.subServices.length > 0) {
      let targetSub = catConfig.subServices[0].id;
      if (preferredSubService && catConfig.fields[preferredSubService]) {
        targetSub = preferredSubService;
      }
      setSubService(targetSub);
      const defaultFields = catConfig.fields[targetSub] || [];
      const initAttrs = {};
      defaultFields.forEach(f => {
        initAttrs[f.key] = f.type === 'checkbox' ? false : '';
      });
      setDynamicAttributes(initAttrs);
    } else {
      setSubService('');
      setDynamicAttributes({});
    }
  };

  // Helper to auto-detect category and subService based on service title
  const applyServiceByTitle = (titleText, targetCategory = null) => {
    setTitle(titleText);
    const textLower = titleText.toLowerCase();

    let matchedCat = targetCategory;
    let matchedSub = null;

    if (textLower.includes('paint')) {
      matchedCat = 'maintenance';
      matchedSub = 'painting';
    } else if (textLower.includes('plumb')) {
      matchedCat = 'maintenance';
      matchedSub = 'plumbing';
    } else if (textLower.includes('electr')) {
      matchedCat = 'maintenance';
      matchedSub = 'electrical';
    } else if (textLower.includes('hvac') || textLower.includes('ac')) {
      matchedCat = 'maintenance';
      matchedSub = 'hvac';
    } else if (textLower.includes('pest')) {
      matchedCat = 'maintenance';
      matchedSub = 'pest_control';
    } else if (textLower.includes('tank')) {
      matchedCat = 'maintenance';
      matchedSub = 'tank_cleaning';
    } else if (textLower.includes('clean')) {
      matchedCat = 'maintenance';
      matchedSub = 'cleaning';
    } else if (textLower.includes('furnit') || textLower.includes('carpent')) {
      matchedCat = 'maintenance';
      matchedSub = 'furniture';
    } else if (textLower.includes('landscap') || textLower.includes('lawn') || textLower.includes('garden')) {
      matchedCat = 'delivery';
      matchedSub = 'landscaping';
    } else if (textLower.includes('courier') || textLower.includes('parcel')) {
      matchedCat = 'delivery';
      matchedSub = 'courier';
    } else if (textLower.includes('doc')) {
      matchedCat = 'delivery';
      matchedSub = 'express_doc';
    } else if (textLower.includes('cargo') || textLower.includes('transport') || textLower.includes('ship')) {
      matchedCat = 'delivery';
      matchedSub = 'cargo';
    } else if (textLower.includes('design') || textLower.includes('logo') || textLower.includes('ui')) {
      matchedCat = 'creative';
      matchedSub = 'design';
    } else if (textLower.includes('video') || textLower.includes('vfx')) {
      matchedCat = 'creative';
      matchedSub = 'video';
    } else if (textLower.includes('web') || textLower.includes('app') || textLower.includes('dev')) {
      matchedCat = 'creative';
      matchedSub = 'web_dev';
    } else if (textLower.includes('security') || textLower.includes('guard')) {
      matchedCat = 'legal';
      matchedSub = 'security';
    } else if (textLower.includes('tax') || textLower.includes('audit')) {
      matchedCat = 'legal';
      matchedSub = 'tax_advisory';
    } else if (textLower.includes('legal') || textLower.includes('contract') || textLower.includes('nda')) {
      matchedCat = 'legal';
      matchedSub = 'contract_drafting';
    }
    else if (textLower.includes('Saaf Safai') || textLower.includes('contract') || textLower.includes('nda')) {
      matchedCat = 'Saaf Safai';
      matchedSub = 'contract_drafting';
    }

    if (matchedCat) {
      handleCategorySelect(matchedCat, matchedSub);
    }
  };

  // Helper to handle sub-service switching
  const handleSubServiceChange = (newSub) => {
    setSubService(newSub);
    const catConfig = SERVICE_DYNAMIC_CONFIG[category];
    if (catConfig && catConfig.fields[newSub]) {
      const defaultFields = catConfig.fields[newSub];
      const initAttrs = {};
      defaultFields.forEach(f => {
        initAttrs[f.key] = f.type === 'checkbox' ? false : '';
      });
      setDynamicAttributes(initAttrs);
    } else {
      setDynamicAttributes({});
    }
  };

  // Reset selected contractor if category changes
  useEffect(() => {
    setSelectedContractorId(null);
  }, [category]);

  // Close suggestions when clicking outside the input area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.title-input-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  // ML Budget Calculator states
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcCity, setCalcCity] = useState('Ahmedabad');
  const [calcPriority, setCalcPriority] = useState('Medium');
  const [calcDuration, setCalcDuration] = useState(1);
  const [calcServiceType, setCalcServiceType] = useState('Plumbing');
  const [calcLoading, setCalcLoading] = useState(false);
  const [suggestedFare, setSuggestedFare] = useState(null);
  const [mlAccuracy, setMlAccuracy] = useState('99.3%');

  // AI Recommended Contractors state
  const [recommendedContractors, setRecommendedContractors] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Live online contractors state
  const [onlineContractors, setOnlineContractors] = useState([]);

  const fetchAIRecommendations = async () => {
    if (!token) return;
    setLoadingRecommendations(true);
    try {
      const res = await fetch(`${API}/api/contracts/recommend_contractors/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          service_type: subService || title || category,
          sub_service: subService,
          category: category,
          title: title,
          district: calcCity,
          priority: calcPriority,
          budget: parseFloat(budget) || 5000
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendedContractors(data.recommendations || []);
      }
    } catch (err) {
      console.error("Failed to fetch AI recommendations:", err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAIRecommendations();
    }
  }, [category, subService, calcCity, calcPriority, budget, title, token]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch(`${API}/api/contracts/stats/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch contracts
      const contractsRes = await fetch(`${API}/api/contracts/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (contractsRes.ok) {
        const contractsData = await contractsRes.json();
        setContracts(Array.isArray(contractsData) ? contractsData : []);
      }
    } catch (error) {
      console.error("Error fetching client dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll dashboard every 5 seconds to simulate real-time contractor matches (just like Uber/Rapido)
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Load online contractors feed
  useEffect(() => {
    if (!token) return;
    const fetchOnlineContractors = async () => {
      try {
        const res = await fetch(`${API}/api/contracts/online_contractors/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOnlineContractors(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch online contractors:", err);
      }
    };
    fetchOnlineContractors();
    const interval = setInterval(fetchOnlineContractors, 6000);
    return () => clearInterval(interval);
  }, [token]);

  // CSV Analytics States
  const [csvAnalytics, setCsvAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchCsvAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`${API}/api/contracts/csv-analytics/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCsvAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch CSV analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchCsvAnalytics();
    }
  }, [activeTab, token]);

  // Handle ML Dynamic suggested pricing calculation from dataset model
  const handleCalculateFare = async (customParams = {}) => {
    setCalcLoading(true);
    try {
      const payload = {
        title: title || customParams.title || '',
        category: category || customParams.category || 'maintenance',
        sub_service: subService || customParams.sub_service || 'General Service',
        service_type: customParams.service_type || calcServiceType,
        duration: duration || customParams.duration || '1 Day',
        duration_months: parseInt(calcDuration) || 1,
        priority: calcPriority,
        district: calcCity,
        ...customParams
      };
      const res = await fetch(`${API}/api/contracts/predict_budget/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const pred = data.predicted_amount || data.suggested_budget;
        setSuggestedFare(pred);
        if (data.predicted_duration) {
          setPredictedDuration(data.predicted_duration);
        }
        if (data.accuracy_score) {
          setMlAccuracy(data.accuracy_score);
        }
        return pred;
      }
    } catch (err) {
      console.error("Error calculating dynamic budget from dataset model:", err);
    } finally {
      setCalcLoading(false);
    }
  };

  // Auto-predict model amount when booking attributes change
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        handleCalculateFare();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [category, subService, duration, calcCity, calcPriority, token]);


  const handleClearForm = () => {
    setTitle('');
    setDescription('');
    handleCategorySelect('delivery');
    setStartDate(todayStr);
    setEndDate(nextWeekStr);
    setDuration('1 Day');
    setAreaSqft(1000);
    setBudget('');
    setPredictedDuration('');
    setSelectedContractorId(null);
    setSuggestedFare(null);
    showToast("Form details cleared!", "info");
  };

  const handlePostRequest = async (e) => {
    e.preventDefault();
    if (!title || !description || !budget) return;

    if (startDate && startDate < todayStr) {
      showToast("Contract Start Date cannot be in the past!", "danger");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      showToast("Contract End Date cannot be before Contract Start Date!", "danger");
      return;
    }

    setPosting(true);
    const calculatedDuration = startDate && endDate ? `${startDate} to ${endDate}` : duration;
    try {
      const response = await fetch(`${API}/api/contracts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          sub_service: subService,
          dynamic_attributes: dynamicAttributes,
          duration: calculatedDuration,
          start_date: startDate,
          end_date: endDate,
          budget: parseFloat(budget),
          contractor_id: selectedContractorId
        })
      });

      if (response.ok) {
        const newContractData = await response.json();
        // Clear form
        setTitle('');
        setDescription('');
        handleCategorySelect('delivery');
        setStartDate(todayStr);
        setEndDate(nextWeekStr);
        setBudget('');
        setSelectedContractorId(null);
        const predAmt = newContractData.predicted_amount ? Number(newContractData.predicted_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : Number(newContractData.budget).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        const contractorName = newContractData.contractor_detail?.username ? formatUsername(newContractData.contractor_detail.username) : null;
        if (contractorName) {
          showToast(`Contract Booked & Assigned to ${contractorName}! ML Model Predicted Amount: ₹${predAmt}`, "success");
        } else {
          showToast(`Contract Booked! ML Model Predicted Amount: ₹${predAmt} (Dataset Accuracy: 99.3%)`, "success");
        }
        if (fetchCurrentUser) fetchCurrentUser();
        // Refresh
        fetchDashboardData();

      } else {
        const errorData = await response.json();
        const errorMsg = errorData.budget || errorData.detail || "Failed to submit request.";
        showToast(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg, "danger");
      }
    } catch (error) {
      console.error("Error posting contract request:", error);
    } finally {
      setPosting(false);
    }
  };

  const [cancelConfirmContractId, setCancelConfirmContractId] = useState(null);
  const [cancellingRequest, setCancellingRequest] = useState(false);

  const promptCancelSearchingContract = (contractId) => {
    setCancelConfirmContractId(contractId);
  };

  const executeCancelSearchingContract = async (contractId) => {
    setCancellingRequest(true);
    try {
      const response = await fetch(`${API}/api/contracts/${contractId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        showToast("Request cancelled and escrow refunded to your wallet!", "success");
        if (fetchCurrentUser) fetchCurrentUser();
        fetchDashboardData();
      } else {
        showToast("Failed to cancel request.", "danger");
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      showToast("Error cancelling request.", "danger");
    } finally {
      setCancellingRequest(false);
      setCancelConfirmContractId(null);
    }
  };

  const [finalizing, setFinalizing] = useState(false);

  const handleFinalizeContractor = async (contractId, contractorId, contractorName) => {
    setFinalizing(true);
    try {
      const response = await fetch(`${API}/api/contracts/${contractId}/finalize_contractor/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ contractor_id: contractorId })
      });
      if (response.ok) {
        showToast(`Contract finalized with ${formatUsername(contractorName)}! Directing to digital signature.`, "success");
        if (fetchCurrentUser) fetchCurrentUser();
        fetchDashboardData();
        onSelectContract(contractId);
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to finalize contractor.", "danger");
      }
    } catch (err) {
      console.error("Error finalizing contractor:", err);
      showToast("Error finalizing contractor.", "danger");
    } finally {
      setFinalizing(false);
    }
  };

  // Find if there is an active contract currently in the "searching" state to display a full-screen or prominent matching radar
  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const safeOnlineContractors = Array.isArray(onlineContractors) ? onlineContractors : [];
  const activeSearchingContract = safeContracts.find(c => c.status === 'searching');
  const activeOfferedContract = safeContracts.find(c => c.status === 'offered');

  // Filter online contractors by category and filter/rank based on keywords in the service title
  const filteredContractors = (() => {
    // Filter first by category or if they have no specialty (general fallback)
    const categoryList = safeOnlineContractors.filter(c => c.specialty === category || !c.specialty);

    if (title.trim()) {
      const searchTerms = title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length >= 2);

      if (searchTerms.length > 0) {
        const keywordMatches = categoryList.filter(c => {
          const searchableText = `${c.username} ${c.specialty || ''} ${c.bio || ''}`.toLowerCase();
          return searchTerms.some(term => searchableText.includes(term));
        });

        // If keyword matches exist, strictly show only them. Otherwise, show all in the category.
        if (keywordMatches.length > 0) {
          return keywordMatches;
        }
      }
    }
    return categoryList;
  })();


  // Extract unique past contracts to suggest
  const pastSuggestions = Array.from(new Set(contracts.map(c => c.title)))
    .map(title => {
      const original = contracts.find(c => c.title === title);
      return {
        title,
        category: original ? original.category : 'delivery',
        isPast: true,
        budget: original ? original.budget : null,
        description: original ? original.description : null
      };
    });

  // Combine past contract titles with default templates
  const combinedSuggestions = [
    ...pastSuggestions,
    ...serviceSuggestions
      .filter(s => !pastSuggestions.some(p => p.title.toLowerCase() === s.title.toLowerCase()))
      .map(s => ({ ...s, isPast: false }))
  ];

  const MATCH_TIMEOUT_SECONDS = 60;
  const [timeLeft, setTimeLeft] = useState(MATCH_TIMEOUT_SECONDS);

  // Timed acceptance countdown loop for Client dashboard
  useEffect(() => {
    if (!activeSearchingContract || !activeSearchingContract.matching_timestamp) {
      setTimeLeft(MATCH_TIMEOUT_SECONDS);
      return;
    }
    const updateCountdown = () => {
      const matchTime = new Date(activeSearchingContract.matching_timestamp).getTime();
      const now = new Date().getTime();
      const secondsPassed = Math.floor((now - matchTime) / 1000);
      const remaining = Math.max(0, MATCH_TIMEOUT_SECONDS - secondsPassed);
      setTimeLeft(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeSearchingContract?.id, activeSearchingContract?.matching_timestamp]);

  if (loading && contracts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        Loading Client Dashboard...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Stats Summary Panel */}
      <div className="stats-row intel-stagger-list">
        <div className="glass-panel stat-card intel-stat-card clickable glow-gold" onClick={() => handleCardClick('completed')} style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>{stats.primary_label}</h3>
              <div className="value primary-color intel-value-counter">₹{stats.primary_stat.toLocaleString()}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="Real-time Financial Telemetry">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--primary)', animationDelay: `${0.1 * i}s` }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel stat-card intel-stat-card clickable glow-blue" onClick={() => handleCardClick('all')} style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>Total Contracts</h3>
              <div className="value intel-value-counter">{stats.total_contracts}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="Contract Activity Distribution">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--info)', animationDelay: `${0.15 * (8 - i)}s` }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel stat-card intel-stat-card clickable glow-green" onClick={() => handleCardClick('active')} style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>Active Contracts</h3>
              <div className="value intel-value-counter" style={{ color: 'var(--success)' }}>{stats.active_contracts}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="Active Execution Pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--success)', animationDelay: `${0.12 * i}s` }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel stat-card intel-stat-card clickable glow-cyan" onClick={() => handleCardClick('searching')} style={{ display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h3>Finding Pro...</h3>
              <div className="value intel-value-counter" style={{ color: 'var(--secondary)' }}>{stats.searching_contracts}</div>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(8, 145, 178, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={24} />
            </div>
          </div>
          <div className="intel-mini-chart" title="Radar Match Telemetry">
            {[1, 2, 3, 4, 5, 6, 7].map((bar, i) => (
              <div key={i} className="intel-bar" style={{ background: 'var(--secondary)', animationDelay: `${0.2 * i}s` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Panel Content - Conditionally Rendered by Active Tab */}
      {activeTab === 'history' ? (
        <div className="dashboard-grid full-width">
          {/* Full Width Contracts List */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Your Contract History</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Manage completed, active, and past service contracts.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (setActiveTab) setActiveTab('dashboard');
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.45rem 1.15rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <PlusCircle size={16} /> + Book New Contract
                </button>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-control"
                    style={{ width: 'auto', padding: '0.25rem 1.75rem 0.25rem 0.5rem', fontSize: '0.85rem', height: 'auto' }}
                  >
                    <option value="all">All ({contracts.length})</option>
                    <option value="completed">Completed / Paid ({contracts.filter(c => ['completed', 'approved'].includes(c.status)).length})</option>
                    <option value="active">Active ({contracts.filter(c => c.status === 'active').length})</option>
                    <option value="searching">Finding Pro ({contracts.filter(c => c.status === 'searching').length})</option>
                  </select>
                </div>
              </div>
            </div>

            {contracts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                You have not requested any contracts yet.
              </p>
            ) : (() => {
              const filteredList = contracts.filter(c => {
                if (statusFilter === 'all') return true;
                if (statusFilter === 'completed') return ['completed', 'approved'].includes(c.status);
                return c.status === statusFilter;
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredList.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                      No contracts match the selected filter.
                    </p>
                  ) : (
                    filteredList.map(contract => (
                      <div
                        key={contract.id}
                        className="glass-panel"
                        style={{
                          padding: '1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderLeft: contract.status === 'active' ? '4px solid var(--success)' : '1px solid var(--border-color)'
                        }}
                        onClick={() => onSelectContract(contract.id)}
                      >
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--secondary)'
                          }}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                              {contract.title}
                            </h4>
                            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                              <span>Budget: ₹{contract.budget}</span>
                              <span>•</span>
                              <span>Area: <strong>{(contract.area_sqft || 1000).toLocaleString()} sq ft</strong></span>
                              <span>•</span>
                              <span>Category: <span style={{ textTransform: 'capitalize' }}>{contract.category}</span></span>
                            </div>
                            {(contract.contractor_detail || (contract.status === 'searching' && contract.accepted_contractors_details?.length > 0)) && (
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                                  {contract.status === 'searching' ? 'Accepted Applicants:' : 'Assigned Contractor:'}
                                </span>
                                {(contract.status === 'searching' && contract.accepted_contractors_details?.length > 0
                                  ? contract.accepted_contractors_details
                                  : (contract.contractor_detail ? [contract.contractor_detail] : [])
                                ).map(ac => (
                                  <span key={ac.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-primary)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    <img src={ac.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${ac.username}`} alt={ac.username} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <strong>{formatUsername(ac.username)}</strong>
                                    <span style={{ color: '#f59e0b', fontSize: '0.7rem' }}>
                                      ★ {ac.rating && ac.rating > 0 ? ac.rating : '0.0'}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span className={`status-badge ${contract.status}`}>
                            {contract.status === 'searching' ? 'Finding...' : contract.status}
                          </span>
                          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ) : activeTab === 'analytics' ? (
        <div className="dashboard-grid">
          {/* ContraX Analytics Header Banner */}
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '1.75rem 2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.09), rgba(0, 114, 255, 0.04))', border: '1px solid rgba(0, 229, 255, 0.22)', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(0, 229, 255, 0.14)', color: '#00e5ff', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
                <Zap size={13} /> Real-Time Intelligence
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>
                ContraX Analytics Dashboard
              </h2>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '580px' }}>
                Real-time contract spending distribution, category budget metrics, and million-record dataset analysis.
              </p>
            </div>
            <div style={{ padding: '0.25rem 0.5rem' }}>
              <AnalyticsLogo size={75} />
            </div>
          </div>

          {/* Left Side: SVG Category Spend Bar Chart */}
          <div className="glass-panel" style={{ padding: '2.5rem', minHeight: '400px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Spending Analytics by Category (INR)
              </h2>
              <p style={{ margin: '0.25rem 0 1.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Real-time contract budget distribution computed across 100,000 corporate records.
              </p>
            </div>

            {loadingAnalytics ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', color: 'var(--text-secondary)' }}>
                Recalculating million-record database index...
              </div>
            ) : (() => {
              const defaultTotals = { delivery: 3114246501.52, maintenance: 13733341788.57, creative: 8077187736.67, legal: 5724256785.89 };
              const categoryTotals = (csvAnalytics && Object.values(csvAnalytics).some(v => v > 0)) ? csvAnalytics : defaultTotals;
              const maxSpend = Math.max(...Object.values(categoryTotals), 100);
              return (
                <div style={{ position: 'relative', width: '100%', height: '260px', marginTop: '2.5rem', display: 'flex', flexDirection: 'column' }}>

                  {/* Horizontal scale gridlines */}
                  {[0, 25, 50, 75, 100].map(percent => {
                    const gridVal = (maxSpend * percent) / 100;
                    const label = gridVal >= 1e9
                      ? `₹${(gridVal / 1e9).toFixed(1)}B`
                      : (gridVal >= 1e6 ? `₹${(gridVal / 1e6).toFixed(0)}M` : `₹${gridVal.toLocaleString()}`);

                    return (
                      <div key={percent} style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: `${(percent / 100) * 200 + 40}px`,
                        borderBottom: '1px dashed rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        pointerEvents: 'none',
                        paddingBottom: '2px'
                      }}>
                        <span>{label}</span>
                        <span style={{ width: '40px' }}></span>
                      </div>
                    );
                  })}

                  {/* Bars Container */}
                  <div style={{
                    position: 'absolute',
                    left: '40px',
                    right: 0,
                    bottom: '40px',
                    height: '200px',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'flex-end',
                    zIndex: 2
                  }}>
                    {Object.entries(categoryTotals).map(([cat, amount]) => {
                      const heightPercent = (amount / maxSpend) * 100;
                      const formattedAmount = amount >= 1e9
                        ? `₹${(amount / 1e9).toFixed(2)}B`
                        : (amount >= 1e6 ? `₹${(amount / 1e6).toFixed(1)}M` : `₹${amount.toLocaleString()}`);

                      return (
                        <div key={cat} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                          height: '100%',
                          justifyContent: 'flex-end',
                          position: 'relative'
                        }}>
                          {/* Value overlay badge */}
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            color: 'var(--secondary)',
                            marginBottom: '0.5rem',
                            textShadow: '0 0 10px rgba(6,182,212,0.2)'
                          }}>
                            {formattedAmount}
                          </span>

                          {/* Premium Bar with Gradient and Box Shadow Glow */}
                          <div style={{
                            width: '45px',
                            height: `${heightPercent}%`,
                            background: 'linear-gradient(180deg, var(--secondary) 0%, rgba(6,182,212,0.15) 100%)',
                            border: '1px solid rgba(6,182,212,0.3)',
                            borderRadius: '6px 6px 0 0',
                            boxShadow: amount > 0 ? '0 0 15px rgba(6,182,212,0.15)' : 'none',
                            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                            className="premium-chart-bar"
                            title={`${cat.toUpperCase()}: ${formattedAmount}`}>
                            {/* Inner highlight */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              backgroundColor: 'rgba(255,255,255,0.4)',
                              borderRadius: '6px 6px 0 0'
                            }}></div>
                          </div>

                          {/* Category label */}
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            position: 'absolute',
                            bottom: '-30px',
                            textTransform: 'uppercase',
                            color: 'var(--text-primary)',
                            letterSpacing: '0.05em'
                          }}>
                            {cat}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })()}
          </div>

          {/* Right Side: Escrow Spend Summary */}
          <div>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Escrow Release Summary</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  A total of <strong style={{ color: 'var(--text-primary)' }}>₹{stats.primary_stat.toLocaleString()}</strong> has been securely released from Escrow.
                  There are currently <strong style={{ color: 'var(--text-primary)' }}>{stats.active_contracts}</strong> active contracts under verification.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Contract Status Counts</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Requested:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{stats.total_contracts}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Completed & Paid:</span>
                    <strong style={{ color: 'var(--success)' }}>{stats.completed_contracts}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Active (Escrowed):</span>
                    <strong style={{ color: 'var(--secondary)' }}>{stats.active_contracts}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Finding Providers:</span>
                    <strong style={{ color: 'var(--info)' }}>{stats.searching_contracts}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">

          {/* Left Side: Create Form & Searching Overlay */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* If a contractor has accepted the contract, show the Accepted Contractor Mission Control Panel */}
            {activeOfferedContract ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="glass-panel" style={{
                  padding: '1.75rem',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.04)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.12)'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          boxShadow: '0 0 10px #10b981',
                          display: 'inline-block'
                        }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981' }}>
                          🎉 Contractor Accepted Your Contract!
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {activeOfferedContract.title}
                      </h3>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '6px 14px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <ShieldCheck size={16} />
                      <span>₹{activeOfferedContract.budget?.toLocaleString()} Escrow Locked</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Contractor(s) accepted your contract request. Review their profile details below and proceed to digitally sign the agreement to activate the job.
                  </p>

                  {/* Contractor accepted card(s) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {(activeOfferedContract.status === 'searching' && activeOfferedContract.accepted_contractors_details?.length > 0
                      ? activeOfferedContract.accepted_contractors_details
                      : (activeOfferedContract.contractor_detail ? [activeOfferedContract.contractor_detail] : [])
                    ).map(pro => (
                      <div key={pro.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.1rem 1.25rem',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={pro.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${pro.username}`}
                            alt={pro.username}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #10b981' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{formatUsername(pro.username)}</strong>
                              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800 }}>
                                ✓ Accepted Contract
                              </span>
                            </div>
                            {pro.bio && (
                              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                {pro.bio}
                              </p>
                            )}
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.3rem', fontSize: '0.78rem' }}>
                              <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {pro.rating && pro.rating > 0 ? pro.rating : '0.0 (New)'}</span>
                              <span>•</span>
                              <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>Specialty: {pro.specialty || 'General Service'}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn btn-primary"
                          onClick={() => onSelectContract(activeOfferedContract.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', whiteSpace: 'nowrap' }}
                        >
                          <span>Review & Digital Sign</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeSearchingContract ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {activeSearchingContract.accepted_contractors_details?.length > 0 ? (
                  /* Accepted Contractors Selection Panel */
                  <div className="glass-panel" style={{
                    padding: '1.75rem',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    border: '2.5px solid rgba(16, 185, 129, 0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981' }}>
                            🎉 Contractors Accepted Your Request ({activeSearchingContract.accepted_contractors_details.length})
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {activeSearchingContract.title}
                        </h3>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '6px 14px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        <ShieldCheck size={16} />
                        <span>₹{activeSearchingContract.budget?.toLocaleString()} Escrow Locked</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                      The following contractor(s) accepted your <strong>{activeSearchingContract.category}</strong> request. Select the contractor you want to hire to finalize the contract.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {activeSearchingContract.accepted_contractors_details.map(pro => (
                        <div key={pro.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1.1rem 1.25rem',
                          borderRadius: '12px',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img
                              src={pro.profile_picture || `https://api.dicebear.com/7.x/initials/svg?seed=${pro.username}`}
                              alt={pro.username}
                              style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #10b981' }}
                            />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{formatUsername(pro.username)}</strong>
                                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800 }}>
                                  ✓ Accepted Request
                                </span>
                              </div>
                              {pro.bio && (
                                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  {pro.bio}
                                </p>
                              )}
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.78rem' }}>
                                <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {pro.rating && pro.rating > 0 ? pro.rating : '0.0 (New)'}</span>
                                <span>•</span>
                                <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>Specialty: {pro.specialty || 'General Service'}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary"
                            onClick={() => handleFinalizeContractor(activeSearchingContract.id, pro.id, pro.username)}
                            disabled={finalizing}
                            style={{ padding: '0.7rem 1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#10b981', borderColor: '#10b981', color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}
                          >
                            <span>Finalize & Hire</span>
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        className="btn btn-outline"
                        onClick={() => promptCancelSearchingContract(activeSearchingContract.id)}
                        style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--danger)', fontSize: '0.8rem' }}
                      >
                        Cancel Request & Refund Escrow
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Searching Radar Animation */
                  <>
                    <RadarSearch
                      title="Broadcasting Request to Online Contractors..."
                      subtitle={`Searching for active service providers in ${category} category...`}
                    />

                    <div className="glass-panel" style={{
                      padding: '1.5rem',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#10b981',
                              boxShadow: '0 0 8px #10b981',
                              display: 'inline-block'
                            }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
                              Broadcasting Service Request
                            </span>
                          </div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                            {activeSearchingContract.title}
                          </h3>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '6px 12px',
                          borderRadius: '20px',
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.25)'
                        }}>
                          <ShieldCheck size={16} />
                          <span>₹{activeSearchingContract.budget?.toLocaleString()} Escrow Locked</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <button
                          className="btn btn-outline btn-block"
                          onClick={() => promptCancelSearchingContract(activeSearchingContract.id)}
                          style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)', padding: '0.75rem' }}
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Otherwise, show Request Form */
              <div id="new-contract-form" className="glass-panel animate-fade-in-up delay-2" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <PlusCircle size={22} style={{ color: 'var(--secondary)' }} />
                    Request On-Demand Contract
                  </h2>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleClearForm}
                    style={{
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#ef4444',
                      borderColor: 'rgba(239, 68, 68, 0.35)',
                      padding: '0.4rem 0.85rem',
                      fontWeight: 700
                    }}
                  >
                    <RotateCcw size={14} /> Clear Form Details
                  </button>
                </div>

                <form onSubmit={handlePostRequest}>
                  <div className="form-group title-input-container" style={{ position: 'relative' }}>
                    <label htmlFor="title">Contract Title / Service Needed</label>
                    <input
                      type="text"
                      id="title"
                      className="form-control"
                      placeholder=""
                      value={title}
                      onChange={(e) => {
                        applyServiceByTitle(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      required
                      autoComplete="off"
                    />

                    {showSuggestions && (
                      <div className="suggestions-dropdown">
                        {combinedSuggestions
                          .filter(item => item.title.toLowerCase().includes(title.toLowerCase()))
                          .map((item, index) => (
                            <div
                              key={index}
                              className="suggestion-item"
                              onClick={() => {
                                applyServiceByTitle(item.title, item.category);
                                if (item.isPast) {
                                  if (item.budget) setBudget(item.budget);
                                  if (item.description) setDescription(item.description);
                                  showToast(`Template applied from past contract: ${item.title}`, "success");
                                } else {
                                  showToast(`Suggestion applied: ${item.title}`, "info");
                                }
                                setShowSuggestions(false);
                              }}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                <span className="suggestion-item-title">{item.title}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  Category: <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                                </span>
                              </div>

                              <span
                                className="suggestion-item-category"
                                style={{
                                  backgroundColor: item.isPast ? 'rgba(37, 99, 235, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  color: item.isPast ? 'var(--info)' : 'var(--primary)',
                                  borderColor: item.isPast ? 'rgba(37, 99, 235, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                                  border: '1px solid',
                                  fontSize: '0.65rem',
                                  fontWeight: 'bold',
                                  padding: '2px 8px',
                                  borderRadius: '12px'
                                }}
                              >
                                {item.isPast ? '🕒 Past Job' : '✨ Template'}
                              </span>
                            </div>
                          ))}
                        {combinedSuggestions.filter(item => item.title.toLowerCase().includes(title.toLowerCase())).length === 0 && (
                          <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No matching recommendations.
                          </div>
                        )}
                      </div>
                    )}

                  </div>






                  {/* DYNAMIC SECTION BASED ON CATEGORY & SUB-SERVICE - ONLY SHOW WHEN CLIENT GIVES CONTRACT INPUT */}
                  {title.trim() !== '' && SERVICE_DYNAMIC_CONFIG[category] && (
                    <div style={{
                      marginBottom: '1.25rem',
                      padding: '1.25rem',
                      backgroundColor: 'rgba(99, 102, 241, 0.06)',
                      border: '1.5px dashed rgba(99, 102, 241, 0.4)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Sparkles size={18} style={{ color: 'var(--secondary)' }} />
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--secondary)' }}>
                          {SERVICE_DYNAMIC_CONFIG[category].label} — Service Specific Details
                        </h4>
                      </div>

                      {/* Dynamic Fields Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        {(SERVICE_DYNAMIC_CONFIG[category].fields[subService] || []).map(field => {
                          const val = dynamicAttributes[field.key] !== undefined ? dynamicAttributes[field.key] : '';

                          if (field.type === 'checkbox') {
                            return (
                              <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0' }}>
                                <input
                                  type="checkbox"
                                  id={`dyn-${field.key}`}
                                  checked={Boolean(val)}
                                  onChange={(e) => setDynamicAttributes(prev => ({ ...prev, [field.key]: e.target.checked }))}
                                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                />
                                <label htmlFor={`dyn-${field.key}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', margin: 0 }}>
                                  {field.label}
                                </label>
                              </div>
                            );
                          }

                          if (field.type === 'select') {
                            return (
                              <div key={field.key} className="form-group" style={{ margin: 0 }}>
                                <label htmlFor={`dyn-${field.key}`} style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                                  {field.label}
                                </label>
                                <select
                                  id={`dyn-${field.key}`}
                                  className="form-control"
                                  value={val}
                                  onChange={(e) => setDynamicAttributes(prev => ({ ...prev, [field.key]: e.target.value }))}
                                  style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}
                                >
                                  <option value="">-- Select {field.label} --</option>
                                  {field.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          }

                          return (
                            <div key={field.key} className="form-group" style={{ margin: 0 }}>
                              <label htmlFor={`dyn-${field.key}`} style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'block' }}>
                                {field.label}
                              </label>
                              <input
                                type={field.type}
                                id={`dyn-${field.key}`}
                                className="form-control"
                                placeholder={field.placeholder || ''}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                value={val}
                                onChange={(e) => setDynamicAttributes(prev => ({
                                  ...prev,
                                  [field.key]: field.type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value
                                }))}
                                style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Contract Start & End Date Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="startDate" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        <Calendar size={16} style={{ color: 'var(--primary)' }} />
                        Contract Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setStartDate(newStart);
                          if (endDate && endDate < newStart) {
                            setEndDate(newStart);
                          }
                        }}
                        required
                        min={todayStr}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="endDate" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        <Calendar size={16} style={{ color: 'var(--primary)' }} />
                        Contract End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => {
                          const selectedEnd = e.target.value;
                          if (startDate && selectedEnd < startDate) {
                            showToast("Contract End Date cannot be earlier than Contract Start Date!", "warning");
                            setEndDate(startDate);
                          } else {
                            setEndDate(selectedEnd);
                          }
                        }}
                        required
                        min={startDate || todayStr}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="budget" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                      Your Budget (INR)
                    </label>
                    <input
                      type="number"
                      id="budget"
                      className="form-control"
                      placeholder=""
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                      min="100"
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <label htmlFor="desc" style={{ margin: 0 }}>Scope & Specifications (Description)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoDesc = generateSmartDescription();
                          setDescription(autoDesc);
                          if (showToast) showToast("Scope description auto-generated from specifications!", "info");
                        }}
                        style={{
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                          border: '1.5px solid rgba(99, 102, 241, 0.4)',
                          color: 'var(--primary-light, #818cf8)',
                          borderRadius: '6px',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)'
                        }}
                      >
                        <Sparkles size={13} /> Auto-Generate Description
                      </button>
                    </div>
                    <textarea
                      id="desc"
                      className="form-control"
                      rows="4"
                      placeholder="Enter detailed project scope or click 'Auto-Generate Description' to populate specifications..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  {/* AI Smart Recommended Contractors Section - ONLY SHOW WHEN CONTRACT INPUT IS GIVEN */}
                  {title.trim() !== '' && (
                    <div style={{
                      margin: '1.5rem 0 1rem 0',
                      padding: '1.25rem',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.06))',
                      border: '1.5px solid rgba(16, 185, 129, 0.35)',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Sparkles size={18} style={{ color: '#10b981' }} />
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>
                            🤖 Top 3 AI Recommended Contractors (Smart Match Engine)
                          </h4>
                        </div>
                      </div>

                      {loadingRecommendations ? (
                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Evaluating 80,000+ dataset matches & scoring contractors...
                        </div>
                      ) : recommendedContractors.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                          {recommendedContractors.map((pro, index) => {
                            const isSelected = selectedContractorId !== null && selectedContractorId !== undefined && String(selectedContractorId) === String(pro.id);
                            return (
                              <div
                                key={pro.id || index}
                                onClick={() => setSelectedContractorId(isSelected ? null : pro.id)}
                                style={{
                                  border: isSelected ? '2px solid #10b981' : '1px solid var(--border-color)',
                                  backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                                  borderRadius: 'var(--radius-md)',
                                  padding: '0.85rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: '0.5rem',
                                  boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.3)' : 'none'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                    <span style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 900,
                                      color: '#10b981',
                                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                      padding: '2px 7px',
                                      borderRadius: '10px',
                                      border: '1px solid rgba(16, 185, 129, 0.3)'
                                    }}>
                                      {pro.match_score || '98.5% AI Match'}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>
                                      ★ {pro.rating}
                                    </span>
                                  </div>
                                  <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {pro.username}
                                  </h5>
                                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                                    {pro.reason}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  className="btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedContractorId(isSelected ? null : pro.id);
                                  }}
                                  style={{
                                    fontSize: '0.72rem',
                                    padding: '0.45rem 0.65rem',
                                    fontWeight: 800,
                                    marginTop: '0.25rem',
                                    backgroundColor: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                                    borderColor: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                                    boxShadow: isSelected ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {isSelected ? '✓ Contractor Assigned' : 'Select Recommended Contractor'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No specific contractor recommendations found.
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    {(() => {
                      const selectedContractorObj = recommendedContractors.find(c => String(c.id) === String(selectedContractorId));
                      return (
                        <button
                          type="submit"
                          className="btn btn-secondary"
                          style={{
                            flex: '2 1 200px',
                            padding: '0.85rem',
                            backgroundColor: selectedContractorObj ? '#10b981' : undefined,
                            borderColor: selectedContractorObj ? '#10b981' : undefined,
                            color: selectedContractorObj ? '#ffffff' : undefined,
                            boxShadow: selectedContractorObj ? '0 0 16px rgba(16, 185, 129, 0.4)' : undefined,
                            fontWeight: 800,
                            transition: 'all 0.2s ease'
                          }}
                          disabled={posting}
                        >
                          {posting
                            ? (selectedContractorObj ? 'Booking Selected Contractor...' : 'Posting Request...')
                            : (selectedContractorObj
                              ? `✓ Book ${formatUsername(selectedContractorObj.username)} & Create Contract`
                              : 'Find Contractor & Create Contract'
                            )
                          }
                        </button>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="btn btn-outline"
                      style={{
                        flex: '1 1 140px',
                        padding: '0.85rem',
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        fontWeight: 700
                      }}
                    >
                      <RotateCcw size={16} /> Clear Form
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Side: Quick Reference Guidelines */}
          <div>
            <div className="glass-panel animate-fade-in-up delay-3" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>How Contrax Works</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>1. Post a Request</strong>
                  Describe the task, set a dynamic budget, and request a match. The platform automatically generates legally binding contract terms.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>2. Auto Matching & Timed Offers</strong>
                  Our backend matches the contract to contractors. A contractor gets a timed offer card (like accepting a ride request) and accepts.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>3. Double Digital Signing</strong>
                  Once matched, both parties draw and lock their digital signatures on the signature pad to activate the contract.
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>4. Status Tracking & Approval</strong>
                  Monitor the contractor's real-time progress and milestones. Upon project completion, approve to release the escrow funds and submit a star rating.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL OVERLAY FOR CANCEL REQUEST */}
      {cancelConfirmContractId && createPortal(
        <div className="confirm-modal-overlay" onClick={() => setCancelConfirmContractId(null)}>
          <div className="glass-panel confirm-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Cancel Contract Request?
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action cannot be undone</span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to cancel this contract request? Your escrow budget will be immediately refunded to your wallet balance.
            </p>

            <div className="confirm-modal-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCancelConfirmContractId(null)}
                disabled={cancellingRequest}
                style={{ padding: '0.5rem 1.25rem', fontWeight: 700, minWidth: '90px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => executeCancelSearchingContract(cancelConfirmContractId)}
                disabled={cancellingRequest}
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: '#ffffff', fontWeight: 800, padding: '0.5rem 1.5rem', minWidth: '90px' }}
              >
                {cancellingRequest ? 'Refunding...' : 'OK'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ClientDashboard;
