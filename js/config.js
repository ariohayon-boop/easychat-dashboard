// Supabase Configuration
const SUPABASE_URL = 'https://tqxrahpbidlctyttpffc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeHJhaHBiaWRsY3R5dHRwZmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTk3MzQsImV4cCI6MjA4MzQzNTczNH0.tmh9_GzWJhIcRoS3L6gpCX95_eZrkIR7hy3gOl9Qd2s';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get Supabase instance
function getSupabase() {
    return supabaseClient;
}

// Get Business ID (for demo, using a fixed ID - replace with auth logic later)
function getBusinessId() {
    // Check URL for business_id parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlBusinessId = urlParams.get('business_id');
    if (urlBusinessId) {
        localStorage.setItem('business_id', urlBusinessId);
        return urlBusinessId;
    }
    
    // Check localStorage
    const storedId = localStorage.getItem('business_id');
    if (storedId) return storedId;
    
    // Default demo business ID
    return 'demo-business';
}

// Category labels
const CATEGORY_LABELS = {
    pricing: '💰 מחירים',
    services: '🛠️ שירותים',
    hours: '🕐 שעות פעילות',
    location: '📍 מיקום',
    terms: '📋 תנאים',
    faq: '❓ שאלות נפוצות',
    other: '📁 אחר'
};

// Auto-categorize business info
async function autoCategorizeBusiness(text) {
    const items = [];
    const lines = text.split('\n').filter(l => l.trim());
    
    let currentCategory = 'other';
    let currentQuestion = '';
    let currentAnswer = '';
    
    const categoryKeywords = {
        pricing: ['מחיר', 'עלות', 'תעריף', 'כמה עולה', '₪', 'שקל'],
        hours: ['שעות', 'פתוח', 'סגור', 'ימים', 'פעילות'],
        location: ['מיקום', 'כתובת', 'איפה', 'מרינה', 'רחוב'],
        services: ['שירות', 'מציעים', 'כולל', 'אפשרויות'],
        terms: ['תנאים', 'ביטול', 'החזר', 'מדיניות']
    };
    
    for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        // Check if this is a category header
        let foundCategory = null;
        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(k => lowerLine.includes(k))) {
                foundCategory = cat;
                break;
            }
        }
        
        if (foundCategory && line.endsWith(':')) {
            if (currentQuestion && currentAnswer) {
                items.push({
                    category: currentCategory,
                    question: currentQuestion,
                    answer: currentAnswer.trim(),
                    keywords: [],
                    is_active: true,
                    priority: 5
                });
            }
            currentCategory = foundCategory;
            currentQuestion = '';
            currentAnswer = '';
        } else if (line.includes('-') || line.includes(':')) {
            if (currentQuestion && currentAnswer) {
                items.push({
                    category: currentCategory,
                    question: currentQuestion,
                    answer: currentAnswer.trim(),
                    keywords: [],
                    is_active: true,
                    priority: 5
                });
            }
            const parts = line.split(/[-:]/).map(p => p.trim());
            if (parts.length >= 2) {
                currentQuestion = parts[0] + '?';
                currentAnswer = parts.slice(1).join(' ');
            }
        } else if (currentQuestion) {
            currentAnswer += ' ' + line;
        }
    }
    
    if (currentQuestion && currentAnswer) {
        items.push({
            category: currentCategory,
            question: currentQuestion,
            answer: currentAnswer.trim(),
            keywords: [],
            is_active: true,
            priority: 5
        });
    }
    
    return items;
}

// Toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-amber-500';
    
    toast.className = `${bgColor} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-left`;
    toast.innerHTML = `
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
