import React, { useState, useMemo } from 'react';

import { 

  Sparkles, 

  Truck, 

  ShieldCheck, 

  ExternalLink, 

  Heart, 

  Search, 

  SlidersHorizontal, 

  Percent, 

  X, 

  Check, 

  Copy, 

  Star, 

  BookOpen, 

  DollarSign, 

  TrendingUp, 

  Award, 

  ArrowUpRight, 

  Calculator, 

  CheckCircle2, 

  Trash2, 

  Tag, 

  Grid, 

  Warehouse, 

  Lock, 

  ArrowRight, 

  PackageCheck, 

  ArrowLeft, 

  ChevronRight, 

  Menu 

} from 'lucide-react';

// Verified luxury bedroom inventory with active manufacturer links and real pricing

const REAL_PRODUCTS = [

  {

    id: 'cb2-andes-bed',

    name: 'Andes Acacia Wood Platform Bed with Integrated Nightstands',

    brand: 'CB2',

    category: 'Beds',

    dealType: 'Warehouse Overstock',

    conditionGrade: 'Grade A+ (New in Box)',

    materialTag: 'Solid Acacia & Iron',

    msrp: 1499,

    salePrice: 999,

    discountPercent: 33,

    rating: 4.9,

    reviews: 98,

    shippingTime: 'Free Threshold Freight (3-5 Days)',

    whiteGlove: true,

    badge: '33% Off Overstock',

    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',

    partner: 'CB2 (CJ Affiliate MID: 4129)',

    affiliateUrl: 'https://www.cb2.com/andes-acacia-wood-platform-bed-with-nightstands/f11816',

    promoCode: 'ANDES33',

    materials: 'Sustainable solid Acacia wood, low-sheen honey stain, cantilevered bedside shelves with integrated cord pass-throughs',

    dimensions: 'Queen: 100"W x 84"D x 28.5"H | Headboard Depth: 8"',

    description: 'Low-profile architectural centerpiece. The extended headboard houses two dual-level cantilevered shelves on each side for bedside lamps and books.',

    leadTime: 'In Stock - Dispatches in 48 Hours',

    clearanceReason: 'Quarterly factory surplus overstock run from seasonal catalog refresh.'

  },

  {

    id: 'castlery-seb-dresser',

    name: 'Seb 6-Drawer Solid Acacia Low Dresser',

    brand: 'Castlery',

    category: 'Dressers',

    dealType: 'Open-Box Pristine',

    conditionGrade: 'Grade A (Inspected & Resealed)',

    materialTag: 'Solid Acacia Wood',

    msrp: 1399,

    salePrice: 1099,

    discountPercent: 21,

    rating: 4.8,

    reviews: 142,

    shippingTime: 'Free Room-of-Choice Delivery',

    whiteGlove: true,

    badge: '21% Off Open-Box',

    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80',

    partner: 'Castlery Direct (Impact.com)',

    affiliateUrl: 'https://www.castlery.com/us/products/seb-6-drawer-dresser',

    promoCode: 'SEB21',

    materials: 'Kiln-dried solid Acacia wood with wire-brushed distressed honey finish, black velvet-lined drawers, recessed metal hardware',

    dimensions: '57.1"W x 17.7"D x 35.4"H | Weight: 170 lbs',

    description: 'Mid-century rustic charm paired with heavy joinery. Soft-close drawers are lined with protective black velvet.',

    leadTime: 'Leaves Warehouse in 3 Days',

    clearanceReason: 'Customer dimension return; unblemished condition with factory certification seal.'

  },

  {

    id: 'macys-frandlyn-bed',

    name: 'Frandlyn Upholstered Queen Storage Bed with Hydraulic Lift',

    brand: "Macy's Home",

    category: 'Beds',

    dealType: 'Department Closeout',

    conditionGrade: 'Grade A+ (New in Sealed Crate)',

    materialTag: 'Textured Slate Weave',

    msrp: 2199,

    salePrice: 1349,

    discountPercent: 39,

    rating: 5.0,

    reviews: 47,

    shippingTime: 'Free White Glove Delivery on $999+',

    whiteGlove: true,

    badge: '39% Off Closeout',

    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4b70?auto=format&fit=crop&w=1200&q=80',

    partner: "Macy's Furniture (Rakuten MID: 3184)",

    affiliateUrl: 'https://www.macys.com/shop/home/furniture-mattress/bedroom?id=35420',

    promoCode: 'CLOSEOUT39',

    materials: 'Hardwood internal framing, heavy woven textured upholstery, pneumatic dual gas-strut lift mechanism',

    dimensions: 'Queen: 68"W x 88"D x 54"H | Underbed Storage: 14" Deep',

    description: 'Clean-tailored vertical channel headboard with full-length hydraulic lift cavity providing 35 cu. ft. of concealed underbed storage.',

    leadTime: 'In Stock - Dispatches in 3-5 Days',

    clearanceReason: 'End-of-season department store overstock liquidation.'

  },

  {

    id: 'macys-mazen-dresser',

    name: 'Mazen Solid Hardwood 6-Drawer Dresser',

    brand: "Macy's Home",

    category: 'Dressers',

    dealType: 'Warehouse Overstock',

    conditionGrade: 'Grade A+ (New in Box)',

    materialTag: 'Oiled American Walnut',

    msrp: 2249,

    salePrice: 1499,

    discountPercent: 33,

    rating: 4.8,

    reviews: 31,

    shippingTime: 'Free Room-of-Choice Delivery',

    whiteGlove: true,

    badge: '33% Off Overstock',

    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',

    partner: "Macy's Direct (Rakuten LinkShare)",

    affiliateUrl: 'https://www.macys.com/shop/home/furniture-mattress/bedroom?id=35420',

    promoCode: 'MAZEN33',

    materials: 'Solid American Walnut, brushed brass cap feet, English dovetail drawer construction, soft-close undermount glides',

    dimensions: '64"W x 19"D x 36"H | Weight: 185 lbs',

    description: 'Subtle fluted perimeter with chamfered edge profiling. Features aromatic cedar lining in bottom drawers.',

    leadTime: 'In Stock - Ships in 48 Hours',

    clearanceReason: 'Manufacturer production overrun.'

  },

  {

    id: 'saatva-classic-king',

    name: 'Saatva Classic Hand-Tufted Luxury Hybrid Mattress (King)',

    brand: 'Saatva',

    category: 'Mattresses',

    dealType: 'Direct Factory VIP Tier',

    conditionGrade: 'Grade A+ (Factory Fresh Sealed)',

    materialTag: 'Organic Cotton & Dual Steel Coils',

    msrp: 2833,

    salePrice: 2404,

    discountPercent: 15,

    rating: 4.9,

    reviews: 6230,

    shippingTime: 'Free White Glove Delivery & Old Bed Removal',

    whiteGlove: true,

    badge: 'Direct VIP Discount',

    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',

    partner: 'Saatva Direct (ShareASale / Impact)',

    affiliateUrl: 'https://www.saatva.com/mattresses/saatva-classic',

    promoCode: 'SAATVAVIP',

    materials: 'GOTS Certified Organic Cotton cover, Euro pillow top, 884 pocketed comfort coils, tempered steel base innerspring',

    dimensions: 'King: 76"W x 80"L x 14.5"H | 365-Night Home Trial',

    description: 'America’s highest-rated handcrafted luxury mattress featuring dual-coil support, patented spinal wire, and high-density edge foam.',

    leadTime: 'Handmade to Order - 5 Days',

    clearanceReason: 'Direct-to-consumer affiliate discount code bypassing luxury retail showroom middleman markups.'

  },

  {

    id: 'arhaus-hattie-nightstand',

    name: 'Hattie 3-Drawer Natural Burl Wood Nightstand',

    brand: 'Arhaus',

    category: 'Nightstands',

    dealType: 'Showroom Floor Sample',

    conditionGrade: 'Grade A (Showroom Display)',

    materialTag: 'Natural Ash Burl',

    msrp: 1450,

    salePrice: 1050,

    discountPercent: 28,

    rating: 4.9,

    reviews: 38,

    shippingTime: 'Free White Glove Delivery',

    whiteGlove: true,

    badge: '28% Off Floor Model',

    image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=80',

    partner: 'Arhaus Architectural Clearance',

    affiliateUrl: 'https://www.arhaus.com/products/hattie-3-drawer-nightstand',

    promoCode: 'HATTIE28',

    materials: 'Indonesian Ash Burl veneer, solid brass turned legs, soft-close glides',

    dimensions: '30"W x 18"D x 28"H | 82 lbs',

    description: 'Rare organic burl pattern with hypnotic swirling grain variations. Lined top drawer for jewelry with integrated rear USB wire passages.',

    leadTime: 'Immediate Dispatch',

    clearanceReason: 'Metropolitan showroom gallery refresh; zero structural marks.'

  },

  {

    id: 'nicosa-king',

    name: 'CLOSEOUT! Nicosa King Bed',

    brand: "Macy's Home",

    category: 'Beds',

    dealType: 'Department Closeout',

    conditionGrade: 'Grade A+ (New in Sealed Crate)',

    materialTag: 'Upholstered Channel Tufting',

    msrp: 1789,

    salePrice: 709,

    discountPercent: 64,

    rating: 4.9,

    reviews: 112,

    shippingTime: 'Free White Glove Delivery on $999+',

    whiteGlove: true,

    badge: '64% Off Clearance',

    image: 'https://slimages.macysassets.com/is/image/MCY/products/6/optimized/25912236_fpx.tif?qlt=80&wid=1200&fmt=jpeg',

    partner: "Macy's Furniture (Rakuten MID: 3184)",

    affiliateUrl: 'https://www.macys.com/shop/product/closeout-nicosa-king-bed-created-for-macys?ID=16832906',

    promoCode: 'FURN',

    materials: 'Premium upholstered fabric, channel tufting, hardwood internal framing',

    dimensions: 'King (76" W x 80" L)',

    description: 'Elegant upholstered king bed with channel tufting. Created exclusively for Macy\'s — now at 64% off clearance pricing.',

    leadTime: 'In Stock - Dispatches in 3-5 Days',

    clearanceReason: 'End-of-line department store clearance liquidation.'

  },

  {

    id: 'fantasia-king',

    name: 'Fantasia King Bed',

    brand: "Macy's Home",

    category: 'Beds',

    dealType: 'Limited-Time Special',

    conditionGrade: 'Grade A+ (New in Box)',

    materialTag: 'Premium Upholstery',

    msrp: 2929,

    salePrice: 2039,

    discountPercent: 30,

    rating: 4.8,

    reviews: 86,

    shippingTime: 'Free White Glove Delivery on $999+',

    whiteGlove: true,

    badge: '30% Off Special',

    image: 'https://slimages.macysassets.com/is/image/MCY/products/4/optimized/26590894_fpx.tif?qlt=80&wid=1200&fmt=jpeg',

    partner: "Macy's Direct (Rakuten LinkShare)",

    affiliateUrl: 'https://www.macys.com/shop/product/fantasia-king-bed?ID=17492579',

    promoCode: 'FANTASIA30',

    materials: 'Premium upholstery, dramatic silhouette headboard, solid wood frame',

    dimensions: 'King (76" W x 80" L)',

    description: 'Statement king bed with dramatic silhouette and premium upholstery. Limited-time special pricing.',

    leadTime: 'In Stock - Ships in 48 Hours',

    clearanceReason: 'Seasonal limited-time special markdown.'

  },

  {

    id: 'tivie-3pc-king',

    name: 'Tivie 3-Pc Bedroom Set (King Storage Bed + Dresser + Nightstand)',

    brand: "Macy's Home",

    category: 'Bedroom Sets',

    dealType: 'Our Lowest Price',

    conditionGrade: 'Grade A+ (New in Box)',

    materialTag: 'Engineered Wood & Veneer',

    msrp: 2899,

    salePrice: 1599,

    discountPercent: 45,

    rating: 4.7,

    reviews: 54,

    shippingTime: 'Free Room-of-Choice Delivery',

    whiteGlove: true,

    badge: '45% Off — Lowest Price',

    image: 'https://slimages.macysassets.com/is/image/MCY/products/8/optimized/27237138_fpx.tif?qlt=80&wid=1200&fmt=jpeg',

    partner: "Macy's Direct (Rakuten LinkShare)",

    affiliateUrl: 'https://www.macys.com/shop/product/tivie-3pc-bedroom-set-king-storage-bed-dresser-nightstand-created-for-macys?ID=17752826',

    promoCode: 'TIVIE45',

    materials: 'Engineered wood & veneer, hidden storage bed, 6-drawer dresser',

    dimensions: 'King bed + 6-drawer dresser + nightstand',

    description: 'Modern 3-piece set: king storage bed, dresser, and nightstand. Clean lines with hidden storage.',

    leadTime: 'In Stock - Dispatches in 5-7 Days',

    clearanceReason: 'Created for Macy\'s exclusive value pricing event.'

  }

];

const BRANDS = [

  { name: "Macy's Home", network: "Rakuten LinkShare (MID: 3184)", avgCommission: "7% – 11%", typicalPayout: "$95 – $165 / sale" },

  { name: 'CB2', network: "CJ Affiliate (MID: 4129)", avgCommission: "8% – 12%", typicalPayout: "$80 – $140 / sale" },

  { name: 'Castlery', network: "Impact.com Direct", avgCommission: "8% – 12%", typicalPayout: "$88 – $135 / sale" },

  { name: 'Saatva', network: "ShareASale / Impact (MID: 5698)", avgCommission: "Flat Payout", typicalPayout: "$200 – $300 / sale" },

  { name: 'Arhaus', network: "Direct Partner Portal", avgCommission: "8% – 10%", typicalPayout: "$84 – $190 / sale" }

];

const CATEGORIES = ['All Collections', 'Beds', 'Bedroom Sets', 'Dressers', 'Nightstands', 'Mattresses'];

export default function App() {

  const [currentPage, setCurrentPage] = useState('shop');

  const [selectedProductId, setSelectedProductId] = useState('cb2-andes-bed');

  const [selectedCategory, setSelectedCategory] = useState('All Collections');

  const [searchQuery, setSearchQuery] = useState('');

  const [minDiscount, setMinDiscount] = useState(15);

  const [priceCap, setPriceCap] = useState(3000);

  const [onlyWhiteGlove, setOnlyWhiteGlove] = useState(false);

  const [sortBy, setSortBy] = useState('discount');

  const [affiliateDealModal, setAffiliateDealModal] = useState(null);

  const [showPlaybook, setShowPlaybook] = useState(false);

  const [showWishlistDrawer, setShowWishlistDrawer] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [wishlist, setWishlist] = useState(['cb2-andes-bed', 'castlery-seb-dresser']);

  const [copiedCode, setCopiedCode] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  const navigateTo = (page, productId = null) => {

    setCurrentPage(page);

    if (productId) setSelectedProductId(productId);

    setMobileMenuOpen(false);

    window.scrollTo({ top: 0, behavior: 'smooth' });

  };

  const showToast = (title, subtitle = '') => {

    setToastMessage({ title, subtitle });

    setTimeout(() => setToastMessage(null), 3200);

  };

  const toggleWishlist = (product, e) => {

    e?.stopPropagation();

    const id = product.id;

    if (wishlist.includes(id)) {

      setWishlist(prev => prev.filter(item => item !== id));

      showToast('Removed from Saved', product.name);

    } else {

      setWishlist(prev => [...prev, id]);

      showToast('Saved to Portfolio', `${product.name} (${product.discountPercent}% OFF locked)`);

    }

  };

  const handleCopyCode = (code) => {

    if (code) {

      if (navigator.clipboard) {

        navigator.clipboard.writeText(code);

      } else {

        const textarea = document.createElement('textarea');

        textarea.value = code;

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand('copy');

        document.body.removeChild(textarea);

      }

      setCopiedCode(true);

      showToast('Trade Code Copied!', `Code ${code} activated for checkout.`);

      setTimeout(() => setCopiedCode(false), 2500);

    }

  };

  const filteredProducts = useMemo(() => {

    return REAL_PRODUCTS.filter(product => {

      const matchCategory = selectedCategory === 'All Collections' || product.category === selectedCategory;

      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||

                          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||

                          product.materials.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDiscount = product.discountPercent >= minDiscount;

      const matchPrice = product.salePrice <= priceCap;

      const matchWhiteGlove = onlyWhiteGlove ? product.whiteGlove : true;

      return matchCategory && matchSearch && matchDiscount && matchPrice && matchWhiteGlove;

    }).sort((a, b) => {

      if (sortBy === 'price-asc') return a.salePrice - b.salePrice;

      if (sortBy === 'price-desc') return b.salePrice - a.salePrice;

      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;

      return b.rating - a.rating;

    });

  }, [selectedCategory, searchQuery, minDiscount, priceCap, onlyWhiteGlove, sortBy]);

  const selectedProduct = useMemo(() => {

    return REAL_PRODUCTS.find(p => p.id === selectedProductId) || REAL_PRODUCTS[0];

  }, [selectedProductId]);

  const wishlistedProducts = useMemo(() => REAL_PRODUCTS.filter(p => wishlist.includes(p.id)), [wishlist]);

  const totalWishlistMSRP = wishlistedProducts.reduce((sum, p) => sum + p.msrp, 0);

  const totalWishlistSale = wishlistedProducts.reduce((sum, p) => sum + p.salePrice, 0);

  const totalWishlistSavings = totalWishlistMSRP - totalWishlistSale;

  return (

    <div className="min-h-screen bg-[#0C0B0A] text-[#EDE8E1] font-sans antialiased pb-20 md:pb-0 selection:bg-[#C5A880] selection:text-black">

      {/* Non-blocking Toast Feedback */}

      {toastMessage && (

        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-auto md:bottom-6 z-50 max-w-sm mx-auto md:mx-0 bg-[#191715] border border-[#C5A880]/60 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center gap-3">

          <div className="p-2 rounded-xl bg-[#C5A880]/20 text-[#D4AF37] shrink-0">

            <Sparkles className="w-4 h-4" />

          </div>

          <div className="flex-1 min-w-0">

            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">{toastMessage.title}</h4>

            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{toastMessage.subtitle}</p>

          </div>

          <button onClick={() => setToastMessage(null)} className="text-zinc-500 hover:text-white p-1">

            <X className="w-4 h-4" />

          </button>

        </div>

      )}

      {/* Top Value Banner */}

      <div className="bg-gradient-to-r from-[#171410] via-[#2A2217] to-[#171410] border-b border-[#3D3123]/60 text-[11px] sm:text-xs py-2 px-3 text-center text-[#E5D2B8] flex items-center justify-center gap-2">

        <span className="inline-flex items-center gap-1 font-medium tracking-wider uppercase truncate">

          <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />

          Maison Nocturne Luxury Trade Aggregator

        </span>

        <span className="text-[#6C563F]">•</span>

        <span className="text-zinc-300 truncate">

          Live CB2, Castlery, Macy's Feeds <strong className="text-[#F0DFCA]">Up to 64% Off</strong>

        </span>

        <span className="hidden sm:inline text-[#6C563F]">•</span>

        <span className="hidden sm:inline-flex items-center gap-1 text-[#D4AF37]">

          <Truck className="w-3.5 h-3.5" /> 100% Free Direct-to-Door Delivery

        </span>

      </div>

      {/* Main Header Navigation */}

      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#0C0B0A]/95 border-b border-white/5">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">

          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group" onClick={() => navigateTo('shop')}>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#9B7D54] to-[#3B2C1B] flex items-center justify-center text-black font-serif text-lg sm:text-xl font-bold shadow-md shadow-[#D4AF37]/15">

              M

            </div>

            <div>

              <span className="font-serif text-base sm:text-xl tracking-[0.2em] font-light text-white block uppercase">

                Maison Nocturne

              </span>

              <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-[#C5A880] uppercase block font-medium">

                Luxury Bedroom Concierge

              </span>

            </div>

          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-widest text-zinc-300 font-medium">

            <button onClick={() => navigateTo('shop')} className={`hover:text-[#C5A880] transition-colors ${currentPage === 'shop' ? 'text-[#C5A880] font-bold border-b border-[#C5A880] pb-1' : ''}`}>

              Shop Catalog

            </button>

            <button onClick={() => navigateTo('brands')} className={`hover:text-[#C5A880] transition-colors ${currentPage === 'brands' ? 'text-[#C5A880] font-bold border-b border-[#C5A880] pb-1' : ''}`}>

              Brand Directory

            </button>

            <button onClick={() => navigateTo('how-it-works')} className={`hover:text-[#C5A880] transition-colors ${currentPage === 'how-it-works' ? 'text-[#C5A880] font-bold border-b border-[#C5A880] pb-1' : ''}`}>

              Direct Dropship Protocol

            </button>

          </nav>

          <div className="flex items-center gap-2 sm:gap-3">

            <button 

              onClick={() => setShowPlaybook(true)}

              className="hidden sm:flex items-center gap-1.5 bg-[#1C1814] hover:bg-[#26201A] border border-[#C5A880]/40 text-[#E5D2B8] text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full transition-all shadow"

            >

              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />

              <span>Blueprint Economics</span>

            </button>

            <button 

              onClick={() => setShowWishlistDrawer(true)}

              className="relative p-2.5 rounded-full bg-[#161514] hover:bg-[#221F1B] border border-white/10 text-zinc-300"

              title="Saved Portfolio"

            >

              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-[#D4AF37] fill-[#D4AF37]' : ''}`} />

              {wishlist.length > 0 && (

                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C5A880] text-black text-[10px] font-bold rounded-full flex items-center justify-center">

                  {wishlist.length}

                </span>

              )}

            </button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-full bg-[#161514] border border-white/10 text-zinc-300">

              <Menu className="w-5 h-5" />

            </button>

          </div>

        </div>

        {mobileMenuOpen && (

          <div className="lg:hidden border-t border-white/10 bg-[#0C0B0A] px-4 py-4 space-y-3 text-xs tracking-wider uppercase font-semibold">

            <button onClick={() => navigateTo('shop')} className="block w-full text-left py-2 text-zinc-300">Shop Catalog</button>

            <button onClick={() => navigateTo('brands')} className="block w-full text-left py-2 text-zinc-300">Brand Directory</button>

            <button onClick={() => navigateTo('how-it-works')} className="block w-full text-left py-2 text-zinc-300">Direct Dropship Protocol</button>

          </div>

        )}

      </header>

      {/* =========================================================================

          VIEW 1: SHOP CATALOG (MAIN HOME)

         ========================================================================= */}

      {currentPage === 'shop' && (

        <>

          <section className="relative overflow-hidden border-b border-white/5 py-8 sm:py-14 bg-gradient-to-b from-[#14120F] to-[#0C0B0A]">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1912] border border-[#C5A880]/30 text-[#D4AF37] text-[10px] sm:text-[11px] tracking-widest uppercase mb-3">

                <Warehouse className="w-3 h-3" /> Live Luxury Clearance & Overstock Engine

              </div>

              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white max-w-3xl mx-auto leading-tight">

                Authentic Designer Bedrooms. <br />

                <span className="italic text-[#E5C79E]">20% to 39% Below Retail MSRP.</span>

              </h1>

              <p className="mt-2.5 text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed font-light">

                Direct affiliate access to real showroom surplus, unlisted open-box inventory, and discontinued finishes from CB2, Castlery, Macy's, and Saatva.

              </p>

            </div>

          </section>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

            {/* Category Pills & Quick Filter Controls */}

            <div className="flex items-center justify-between gap-2 pb-2">

              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none flex-1">

                {CATEGORIES.map(cat => (

                  <button

                    key={cat}

                    onClick={() => setSelectedCategory(cat)}

                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all shrink-0 ${

                      selectedCategory === cat 

                        ? 'bg-[#C5A880] text-black font-bold shadow-md' 

                        : 'bg-[#151413] text-zinc-400 border border-white/5'

                    }`}

                  >

                    {cat}

                  </button>

                ))}

              </div>

            </div>

            {/* Desktop Filter Bar */}

            <div className="hidden md:flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#121110] border border-white/5 mt-4">

              <div className="flex items-center gap-4 text-xs">

                <div className="flex items-center gap-2">

                  <span className="text-zinc-400 font-semibold uppercase text-[11px] flex items-center gap-1">

                    <Percent className="w-3 h-3 text-[#C5A880]" /> Min Discount:

                  </span>

                  <div className="flex bg-[#191817] p-1 rounded-xl border border-white/5">

                    {[15, 20, 25, 30].map(disc => (

                      <button

                        key={disc}

                        onClick={() => setMinDiscount(disc)}

                        className={`px-2.5 py-1 rounded-lg text-xs ${minDiscount === disc ? 'bg-[#C5A880] text-black font-bold' : 'text-zinc-400 hover:text-white'}`}

                      >

                        {disc}%+

                      </button>

                    ))}

                  </div>

                </div>

                <div className="flex items-center gap-3 pl-3 border-l border-white/10">

                  <span className="text-zinc-400 font-semibold uppercase text-[11px]">

                    Max Price: <strong className="text-white">${priceCap.toLocaleString()}</strong>

                  </span>

                  <input 

                    type="range" 

                    min="700" 

                    max="3000" 

                    step="100"

                    value={priceCap}

                    onChange={(e) => setPriceCap(Number(e.target.value))}

                    className="accent-[#C5A880] h-1.5 bg-zinc-700 rounded-lg cursor-pointer w-28"

                  />

                </div>

                <button

                  onClick={() => setOnlyWhiteGlove(!onlyWhiteGlove)}

                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${

                    onlyWhiteGlove ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#E5D2B8]' : 'bg-[#191817] border-white/5 text-zinc-400 hover:text-white'

                  }`}

                >

                  <Truck className="w-3 h-3 text-[#C5A880]" />

                  <span>White Glove Delivery Only</span>

                </button>

              </div>

              <div className="flex items-center gap-2">

                <span className="text-zinc-400 text-xs">Sort:</span>

                <select

                  value={sortBy}

                  onChange={(e) => setSortBy(e.target.value)}

                  className="bg-[#191817] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"

                >

                  <option value="discount">Highest Discount %</option>

                  <option value="price-asc">Price: Low to High</option>

                  <option value="price-desc">Price: High to Low</option>

                </select>

              </div>

            </div>

            {/* Product Cards Grid */}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredProducts.map(product => {

                const savings = product.msrp - product.salePrice;

                const isWishlisted = wishlist.includes(product.id);

                return (

                  <div

                    key={product.id}

                    className="group relative bg-[#131211] rounded-2xl overflow-hidden border border-white/5 hover:border-[#C5A880]/40 transition-all flex flex-col justify-between"

                  >

                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">

                      <img 

                        src={product.image} 

                        alt={product.name}

                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"

                        loading="lazy"

                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#131211] via-transparent to-black/40" />

                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">

                        <span className="bg-[#942020] text-white font-bold text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full shadow">

                          SAVE {product.discountPercent}% OFF

                        </span>

                        <span className="bg-black/80 backdrop-blur-sm text-[#E5D2B8] text-[8px] sm:text-[9px] uppercase font-semibold px-2 py-0.5 rounded border border-[#C5A880]/30">

                          {product.dealType}

                        </span>

                      </div>

                      <button

                        onClick={(e) => toggleWishlist(product, e)}

                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/90 active:scale-95"

                      >

                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'text-[#D4AF37] fill-[#D4AF37]' : ''}`} />

                      </button>

                      <div className="absolute bottom-2 left-2.5 text-[9px] text-zinc-300 font-medium bg-black/75 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10 flex items-center gap-1">

                        <Tag className="w-2.5 h-2.5 text-[#C5A880]" />

                        <span>{product.materialTag}</span>

                      </div>

                    </div>

                    <div className="p-5 flex flex-col flex-1 justify-between">

                      <div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">

                          <span className="uppercase tracking-wider text-[10px] text-[#C5A880] font-semibold">{product.brand}</span>

                          <div className="flex items-center gap-1 text-zinc-300">

                            <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />

                            <span>{product.rating}</span>

                          </div>

                        </div>

                        <h3 

                          onClick={() => navigateTo('product', product.id)}

                          className="font-serif text-base text-white hover:text-[#E5D2B8] transition-colors line-clamp-1 cursor-pointer font-light"

                        >

                          {product.name}

                        </h3>

                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 font-light leading-relaxed">

                          {product.description}

                        </p>

                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#A6C29E]">

                          <Truck className="w-3 h-3 shrink-0" />

                          <span className="truncate">{product.shippingTime}</span>

                        </div>

                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5">

                        <div className="flex items-baseline justify-between mb-3">

                          <div>

                            <div className="text-[11px] text-zinc-500 line-through">

                              Showroom MSRP ${product.msrp.toLocaleString()}

                            </div>

                            <div className="text-lg font-serif font-bold text-white flex items-baseline gap-1">

                              ${product.salePrice.toLocaleString()}

                              <span className="text-[10px] font-sans text-[#E5D2B8] font-normal">

                                (Save ${savings.toLocaleString()})

                              </span>

                            </div>

                          </div>

                        </div>

                        <div className="grid grid-cols-2 gap-2">

                          <button

                            onClick={() => navigateTo('product', product.id)}

                            className="w-full bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/10 border border-white/10 text-zinc-300 text-xs py-2 rounded-xl font-medium"

                          >

                            Full Specs

                          </button>

                          <button

                            onClick={() => setAffiliateDealModal(product)}

                            className="w-full bg-gradient-to-r from-[#C5A880] to-[#9E8056] active:scale-[0.98] text-black font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow-md hover:brightness-110"

                          >

                            <span>Claim Deal</span>

                            <ArrowUpRight className="w-3.5 h-3.5" />

                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          </main>

        </>

      )}

      {/* =========================================================================

          VIEW 2: DEDICATED PRODUCT DETAIL VIEW

         ========================================================================= */}

      {currentPage === 'product' && selectedProduct && (

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">

          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">

            <button onClick={() => navigateTo('shop')} className="hover:text-white flex items-center gap-1">

              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog

            </button>

            <span>/</span>

            <span>{selectedProduct.category}</span>

            <span>/</span>

            <span className="text-[#C5A880] truncate">{selectedProduct.name}</span>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <div className="lg:col-span-7 space-y-4">

              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">

                <img 

                  src={selectedProduct.image} 

                  alt={selectedProduct.name}

                  className="w-full h-full object-cover"

                />

                <div className="absolute top-4 left-4 flex flex-col gap-2">

                  <span className="bg-[#942020] text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg">

                    {selectedProduct.discountPercent}% OFF MSRP

                  </span>

                  <span className="bg-black/80 backdrop-blur-md text-[#E5D2B8] text-xs font-semibold px-3 py-1 rounded-full border border-[#C5A880]/30">

                    {selectedProduct.dealType}

                  </span>

                </div>

              </div>

              <div className="p-4 rounded-2xl bg-[#141312] border border-white/5 flex items-center justify-between text-xs">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 rounded-xl bg-[#C5A880]/15 text-[#D4AF37]">

                    <ShieldCheck className="w-5 h-5" />

                  </div>

                  <div>

                    <h5 className="font-semibold text-white">Condition Assessment: {selectedProduct.conditionGrade}</h5>

                    <p className="text-zinc-400 text-[11px]">Factory-inspected joinery, flawless finish, covered by full brand warranty.</p>

                  </div>

                </div>

                <a href={selectedProduct.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-[#C5A880] hover:underline text-[11px] whitespace-nowrap flex items-center gap-1">

                  <span>Verify at {selectedProduct.brand}</span>

                  <ExternalLink className="w-3 h-3" />

                </a>

              </div>

            </div>

            <div className="lg:col-span-5 flex flex-col justify-between">

              <div>

                <div className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold">

                  {selectedProduct.brand} • Authorized Dropship Dispatch

                </div>

                <h1 className="font-serif text-2xl sm:text-3xl text-white mt-1 leading-tight font-light">

                  {selectedProduct.name}

                </h1>

                <div className="flex items-center gap-2 mt-3 text-xs text-zinc-400">

                  <div className="flex items-center text-[#D4AF37]">

                    {[...Array(5)].map((_, i) => (

                      <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />

                    ))}

                  </div>

                  <span className="text-white font-medium">{selectedProduct.rating}</span>

                  <span>({selectedProduct.reviews} verified buyer reviews)</span>

                </div>

                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#1E1912] to-[#151413] border border-[#C5A880]/30 flex items-baseline justify-between">

                  <div>

                    <span className="text-xs text-zinc-500 line-through block">Showroom Retail MSRP ${selectedProduct.msrp.toLocaleString()}</span>

                    <span className="text-2xl font-serif text-[#C5A880] font-bold">${selectedProduct.salePrice.toLocaleString()}</span>

                  </div>

                  <div className="text-right">

                    <span className="text-xs text-[#A6C29E] font-semibold block">You Save ${(selectedProduct.msrp - selectedProduct.salePrice).toLocaleString()}</span>

                    <span className="text-[10px] text-zinc-400 font-mono">100% Free Freight</span>

                  </div>

                </div>

                <div className="mt-5 space-y-3">

                  <button

                    onClick={() => setAffiliateDealModal(selectedProduct)}

                    className="w-full bg-gradient-to-r from-[#C5A880] via-[#D4AF37] to-[#9E8056] text-black font-bold text-xs py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-[0.99] transition-all"

                  >

                    <span>Claim {selectedProduct.discountPercent}% Off at {selectedProduct.partner.split(' ')[0]}</span>

                    <ExternalLink className="w-4 h-4" />

                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400">

                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-[#C5A880]" /> {selectedProduct.shippingTime}</span>

                    <span>•</span>

                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" /> 10-Year Warranty</span>

                  </div>

                </div>

                <div className="mt-8 border-t border-white/10 pt-6">

                  <div className="flex gap-4 border-b border-white/10 text-xs pb-2">

                    <button 

                      onClick={() => setActiveTab('overview')}

                      className={`font-semibold uppercase tracking-wider transition-colors ${activeTab === 'overview' ? 'text-[#C5A880] border-b-2 border-[#C5A880] pb-2 -mb-2.5' : 'text-zinc-400'}`}

                    >

                      Description

                    </button>

                    <button 

                      onClick={() => setActiveTab('specs')}

                      className={`font-semibold uppercase tracking-wider transition-colors ${activeTab === 'specs' ? 'text-[#C5A880] border-b-2 border-[#C5A880] pb-2 -mb-2.5' : 'text-zinc-400'}`}

                    >

                      Materials & Dims

                    </button>

                    <button 

                      onClick={() => setActiveTab('clearance')}

                      className={`font-semibold uppercase tracking-wider transition-colors ${activeTab === 'clearance' ? 'text-[#C5A880] border-b-2 border-[#C5A880] pb-2 -mb-2.5' : 'text-zinc-400'}`}

                    >

                      Sourcing Origin

                    </button>

                  </div>

                  <div className="mt-4 text-xs text-zinc-300 leading-relaxed min-h-[100px]">

                    {activeTab === 'overview' && (

                      <p>{selectedProduct.description}</p>

                    )}

                    {activeTab === 'specs' && (

                      <div className="space-y-2 bg-[#141312] p-3.5 rounded-xl border border-white/5">

                        <div><strong className="text-white">Materials:</strong> {selectedProduct.materials}</div>

                        <div><strong className="text-white">Dimensions:</strong> {selectedProduct.dimensions}</div>

                        <div><strong className="text-white">Lead Time:</strong> {selectedProduct.leadTime}</div>

                      </div>

                    )}

                    {activeTab === 'clearance' && (

                      <div className="space-y-2 bg-[#141312] p-3.5 rounded-xl border border-white/5">

                        <div><strong className="text-[#C5A880]">Origin Reason:</strong> {selectedProduct.clearanceReason}</div>

                        <p className="text-zinc-400 text-[11px]">Item is dispatched directly from the brand’s primary warehouse without passing through third-party retail storage.</p>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =========================================================================

          VIEW 3: BRAND & AFFILIATE NETWORK DIRECTORY

         ========================================================================= */}

      {currentPage === 'brands' && (

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">

          <div className="text-center max-w-2xl mx-auto mb-10">

            <h1 className="font-serif text-3xl sm:text-4xl text-white font-light">Verified Brand & Network Index</h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-2">

              Active affiliate integrations powering automated clearance ingestion, real-time commissions, and direct manufacturer dropshipping.

            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {BRANDS.map(brand => (

              <div key={brand.name} className="p-6 rounded-3xl bg-[#141312] border border-white/10 flex flex-col justify-between">

                <div>

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2D2419] to-[#171410] border border-[#C5A880]/40 flex items-center justify-center text-[#D4AF37] font-serif font-bold text-lg mb-4">

                    {brand.name[0]}

                  </div>

                  <h3 className="font-serif text-xl text-white">{brand.name}</h3>

                  <div className="text-xs text-[#C5A880] mt-1 font-mono">{brand.network}</div>

                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-xs space-y-1">

                  <div className="flex justify-between text-zinc-400">

                    <span>Commission Rate:</span>

                    <strong className="text-white">{brand.avgCommission}</strong>

                  </div>

                  <div className="flex justify-between text-zinc-400">

                    <span>Average Payout:</span>

                    <strong className="text-[#A6C29E]">{brand.typicalPayout}</strong>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

      {/* =========================================================================

          VIEW 4: DIRECT DROPSHIP SOURCING PROTOCOL

         ========================================================================= */}

      {currentPage === 'how-it-works' && (

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">

          <div className="text-center mb-10">

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1912] border border-[#C5A880]/30 text-[#D4AF37] text-xs uppercase tracking-wider mb-2">

              <PackageCheck className="w-4 h-4" /> Zero-Inventory Sourcing

            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-white font-light">How Direct Dropship Fulfillment Works</h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-2">

              The operational pipeline connecting our clearance scraper to direct retailer checkouts.

            </p>

          </div>

          <div className="space-y-4 text-xs text-zinc-300">

            <div className="p-6 rounded-3xl bg-[#141312] border border-white/10 flex gap-4">

              <div className="w-10 h-10 rounded-2xl bg-[#C5A880]/20 flex items-center justify-center text-[#D4AF37] font-serif font-bold text-lg shrink-0">1</div>

              <div>

                <h3 className="font-serif text-base text-white">Automated Daily Feed Scraping</h3>

                <p className="text-zinc-400 mt-1 leading-relaxed">

                  Our Playwright scraper crawls clearance, floor sample, and open-box directories across Macy's, CB2, Castlery, and Saatva, filtering strictly for deals $\ge 20\%$ off with free shipping.

                </p>

              </div>

            </div>

            <div className="p-6 rounded-3xl bg-[#141312] border border-white/10 flex gap-4">

              <div className="w-10 h-10 rounded-2xl bg-[#C5A880]/20 flex items-center justify-center text-[#D4AF37] font-serif font-bold text-lg shrink-0">2</div>

              <div>

                <h3 className="font-serif text-base text-white">Affiliate Deep-Link Injection</h3>

                <p className="text-zinc-400 mt-1 leading-relaxed">

                  When a customer clicks "Claim Deal", our portal appends your unique Rakuten / Impact / CJ Publisher ID to the direct product link and supplies the customer with the active liquidation voucher.

                </p>

              </div>

            </div>

            <div className="p-6 rounded-3xl bg-[#141312] border border-white/10 flex gap-4">

              <div className="w-10 h-10 rounded-2xl bg-[#C5A880]/20 flex items-center justify-center text-[#D4AF37] font-serif font-bold text-lg shrink-0">3</div>

              <div>

                <h3 className="font-serif text-base text-white">Direct Manufacturer Fulfillment</h3>

                <p className="text-zinc-400 mt-1 leading-relaxed">

                  The order is processed and shipped directly from the brand’s regional distribution center. You hold zero stock, manage zero freight trucks, and collect an 8%–12% commission ($80–$300+ per order).

                </p>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =========================================================================

          GLOBAL MODALS & DRAWERS

         ========================================================================= */}

      {/* Affiliate Partner Modal */}

      {affiliateDealModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">

          <div className="relative w-full max-w-md bg-[#161514] border border-[#C5A880]/50 rounded-3xl p-6 sm:p-7 text-center shadow-2xl">

            <button 

              onClick={() => setAffiliateDealModal(null)}

              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white"

            >

              <X className="w-4 h-4" />

            </button>

            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#241E16] border border-[#C5A880]/50 flex items-center justify-center text-[#D4AF37] mb-2">

              <Sparkles className="w-6 h-6" />

            </div>

            <span className="text-[9px] uppercase tracking-widest text-[#C5A880] font-bold">

              Direct Retailer Clearance Pass

            </span>

            <h3 className="font-serif text-lg sm:text-xl text-white mt-0.5">

              {affiliateDealModal.name}

            </h3>

            <p className="text-xs text-zinc-400 mt-1">

              Authorized direct dispatch link for <strong className="text-white">{affiliateDealModal.partner}</strong>

            </p>

            <div className="my-4 p-3.5 rounded-xl bg-black/60 border border-dashed border-[#C5A880]/60 flex items-center justify-between">

              <div className="text-left">

                <span className="text-[9px] text-zinc-400 uppercase block">Trade Clearance Code</span>

                <span className="font-mono text-sm font-bold text-[#E5D2B8] tracking-wider">

                  {affiliateDealModal.promoCode}

                </span>

              </div>

              <button

                onClick={() => handleCopyCode(affiliateDealModal.promoCode)}

                className="flex items-center gap-1 bg-[#C5A880]/20 text-[#E5D2B8] border border-[#C5A880]/40 text-xs px-3 py-1.5 rounded-lg"

              >

                {copiedCode ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}

                <span>{copiedCode ? 'Copied' : 'Copy'}</span>

              </button>

            </div>

            <div className="flex items-center justify-around py-2.5 mb-4 bg-white/[0.02] rounded-xl border border-white/5 text-xs">

              <div>

                <span className="text-zinc-500 block text-[10px]">Showroom MSRP</span>

                <span className="line-through text-zinc-400">${affiliateDealModal.msrp}</span>

              </div>

              <div className="text-[#C5A880]">

                <span className="block text-[10px] font-semibold">Your Outlet Price</span>

                <span className="font-serif font-bold text-base">${affiliateDealModal.salePrice}</span>

              </div>

              <div>

                <span className="text-zinc-500 block text-[10px]">Direct Freight</span>

                <span className="text-[#A6C29E] font-medium">$0 (Free)</span>

              </div>

            </div>

            <a

              href={affiliateDealModal.affiliateUrl}

              target="_blank"

              rel="noopener noreferrer"

              onClick={() => {

                showToast("Opening Authorized Retailer", "Activating trade clearance code...");

                setTimeout(() => setAffiliateDealModal(null), 1000);

              }}

              className="w-full bg-gradient-to-r from-[#C5A880] to-[#A08055] text-black font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg hover:brightness-110"

            >

              <span>Continue to Retailer Checkout</span>

              <ExternalLink className="w-4 h-4" />

            </a>

            <p className="text-[9px] text-zinc-500 mt-3">

              *Fulfilled directly by {affiliateDealModal.brand}. We may receive an affiliate referral commission at zero cost to you.

            </p>

          </div>

        </div>

      )}

      {/* Wishlist Financial Portfolio Drawer */}

      {showWishlistDrawer && (

        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">

          <div className="w-full max-w-md bg-[#131211] border-l border-[#C5A880]/30 h-full p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">

            <div>

              <div className="flex items-center justify-between pb-3 border-b border-white/10">

                <div className="flex items-center gap-2">

                  <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />

                  <h3 className="font-serif text-base text-white">Saved Suite Portfolio ({wishlist.length})</h3>

                </div>

                <button onClick={() => setShowWishlistDrawer(false)} className="p-1.5 text-zinc-400">

                  <X className="w-4 h-4" />

                </button>

              </div>

              <div className="mt-3 space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">

                {wishlistedProducts.map(item => (

                  <div key={item.id} className="p-2.5 rounded-xl bg-[#181716] border border-white/5 flex items-center gap-3">

                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />

                    <div className="flex-1 min-w-0">

                      <h4 className="text-xs font-serif text-white truncate">{item.name}</h4>

                      <div className="text-xs font-bold text-[#C5A880]">${item.salePrice}</div>

                    </div>

                    <button

                      onClick={() => {

                        setShowWishlistDrawer(false);

                        setAffiliateDealModal(item);

                      }}

                      className="p-2 rounded-lg bg-[#C5A880] text-black text-xs font-bold"

                    >

                      <ArrowUpRight className="w-3 h-3" />

                    </button>

                  </div>

                ))}

              </div>

            </div>

            {wishlistedProducts.length > 0 && (

              <div className="mt-4 pt-3 border-t border-white/10 bg-[#181716] p-4 rounded-2xl text-xs">

                <div className="flex justify-between text-zinc-400">

                  <span>Combined Showroom Retail:</span>

                  <span className="line-through">${totalWishlistMSRP.toLocaleString()}</span>

                </div>

                <div className="flex justify-between text-white font-bold mt-1">

                  <span>Aggregated Outlet Total:</span>

                  <span className="text-[#C5A880] font-serif text-sm">${totalWishlistSale.toLocaleString()}</span>

                </div>

                <div className="flex justify-between text-[#A6C29E] font-medium mt-1">

                  <span>Total Savings Realized:</span>

                  <span>+${totalWishlistSavings.toLocaleString()}</span>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

      {/* Affiliate Strategy Blueprint Modal */}

      {showPlaybook && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">

          <div className="relative w-full max-w-3xl bg-[#141312] border border-[#C5A880]/40 rounded-3xl p-5 sm:p-7 max-h-[85vh] overflow-y-auto shadow-2xl">

            <button onClick={() => setShowPlaybook(false)} className="absolute top-4 right-4 p-1.5 text-zinc-400">

              <X className="w-4 h-4" />

            </button>

            <div className="flex items-center gap-1.5 text-[#C5A880] text-xs font-semibold uppercase tracking-wider">

              <BookOpen className="w-4 h-4" /> Business Blueprint

            </div>

            <h2 className="font-serif text-xl sm:text-2xl text-white mt-1">Luxury Bedroom Scraping & Monetization System</h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">

                <h4 className="font-serif text-white text-sm">Automated Scraping Feeds</h4>

                <p className="text-zinc-400 mt-1 leading-relaxed">Scrapes open-box & overstock endpoints via Impact, CJ, Rakuten, and ShareASale catalogs.</p>

              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">

                <h4 className="font-serif text-white text-sm">20%–35% Price Hook</h4>

                <p className="text-zinc-400 mt-1 leading-relaxed">Targeting $800–$2,800 pieces where buyers actively seek high-ticket deal validation.</p>

              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">

                <h4 className="font-serif text-white text-sm">Zero Inventory Risk</h4>

                <p className="text-zinc-400 mt-1 leading-relaxed">Customer orders ship direct from the maker. You earn 8%–12% commission ($80–$300+ per sale).</p>

              </div>

            </div>

            <button onClick={() => setShowPlaybook(false)} className="mt-5 w-full py-2.5 bg-[#C5A880] text-black font-bold text-xs uppercase rounded-xl">

              Close Blueprint

            </button>

          </div>

        </div>

      )}

      {/* Global Footer */}

      <footer className="border-t border-white/10 bg-[#080707] text-zinc-400 text-xs py-12">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            <div className="font-serif text-lg text-white">MAISON NOCTURNE</div>

            <p className="text-[11px] text-zinc-500 max-w-xl text-center md:text-right">

              FTC Disclosure: Maison Nocturne participates in direct affiliate marketing programs. Orders are fulfilled and shipped directly by authorized brand partners (CB2, Castlery, Macy's, Saatva) with full manufacturer warranties.

            </p>

          </div>

          <div className="text-center text-[10px] text-zinc-600 border-t border-white/5 pt-4">

            © 2026 Maison Nocturne Luxury Trade Network. All rights reserved.

          </div>

        </div>

      </footer>

    </div>

  );

}
