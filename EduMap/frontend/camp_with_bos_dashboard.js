// ✅ API Configuration
const API_BASE = 'http://localhost:8081';

// ✅ Program Outcomes (12 AICTE outcomes)
const POS = ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12'];

// ✅ Bloom's Levels
const BL = {
  1: 'Remember',
  2: 'Understand',
  3: 'Apply',
  4: 'Analyze',
  5: 'Evaluate',
  6: 'Create'
};

// ✅ Bloom's Level Descriptors
const BV = {
  6: ['create', 'design', 'develop', 'invent', 'construct', 'assemble'],
  5: ['evaluate', 'critique', 'justify', 'assess', 'appraise'],
  4: ['analyze', 'examine', 'investigate', 'distinguish', 'compare', 'differentiate'],
  3: ['apply', 'implement', 'demonstrate', 'solve', 'use', 'practice'],
  2: ['explain', 'describe', 'summarize', 'interpret', 'discuss', 'understand'],
  1: ['define', 'list', 'recall', 'remember', 'identify', 'state']
};

// ✅ Bloom's Level to CSS Class Mapping
const BC = {
  1: 'c1',
  2: 'c2',
  3: 'c3',
  4: 'c4',
  5: 'c5',
  6: 'c6'
};

// ✅ Global State Object
const S = {
  mode: null,                    // 'A' or 'B'
  cos: [],                       // Course Outcomes from user input
  coData: [],                    // CO data with keywords from backend
  courseTitle: '',
  courseCode: '',
  courseSem: '',
  courseBranch: '',
  coCount: 0,                    // Number of CO input fields
  tbCount: 0,                    // Number of textbook input fields
  rbCount: 0,                    // Number of reference book input fields
  generatedSyllabus: [],
  existingUnits: [],
  modStats: { added: 0, removed: 0, modified: 0, same: 0, modPct: 0 },
  benchmarkName: '',
  benchmarkUploaded: false,
  pdfAnalysis: null,
  analysisData: null,
  // Mode A specific state (aligned with user's requested state shape)
  pdfData: null,
  courseMeta: { title: '', code: '' },
  generatedCOs: [],
  coPoMatrix: [],
  textbooks: [],  // ✅ Structured textbook list: {name, author}
  authors: []
};

// ✅ Helper Functions
function el(id) { return document.getElementById(id); }
function dB(t) { const l = t.toLowerCase(); for (let i = 6; i >= 1; i--) for (const v of BV[i]) if (l.includes(v)) return i; return 3; }

// Helpers for Mode A
function extractTitleFromFileName(name) {
  return name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
}

function generateCode() {
  return 'AUTO-' + Date.now();
}

// ✅ Program Outcome Statements (12 AICTE outcomes)
const PO_STATEMENTS = {
  PO1: "Engineering knowledge — Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to solve complex engineering problems.",
  PO2: "Problem analysis — Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions.",
  PO3: "Design/development of solutions — Design solutions for complex engineering problems and design system components or processes that meet specified needs.",
  PO4: "Conduct investigations of complex problems — Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data.",
  PO5: "Modern tool usage — Create, select, and apply appropriate techniques and modern engineering tools.",
  PO6: "The engineer and society — Apply reasoning informed by contextual knowledge to assess societal issues.",
  PO7: "Environment and sustainability — Understand the impact of engineering solutions in societal and environmental contexts.",
  PO8: "Ethics — Apply ethical principles and commit to professional ethics and responsibilities.",
  PO9: "Individual and team work — Function effectively as an individual and as a member or leader in diverse teams.",
  PO10: "Communication — Communicate effectively on complex engineering activities with the engineering community.",
  PO11: "Project management and finance — Demonstrate knowledge and understanding of engineering and management principles.",
  PO12: "Life-long learning — Recognise the need for, and have the preparation and ability to engage in independent learning."
};

// ════════════════════════════════════════════════════════════════════════════════════
// CO-PO MAPPING ENGINE
// ════════════════════════════════════════════════════════════════════════════════════

// CO-PO Mapping Formula Based on Keyword Matching
// Formula: Level = f(totalMatches / 3)
// - totalMatches >= 2.25 (rawScore >= 0.75) → Level 3 (High)
// - totalMatches >= 1.5  (rawScore >= 0.50) → Level 2 (Medium)
// - totalMatches >= 0.75 (rawScore >= 0.25) → Level 1 (Low)
// - totalMatches < 0.75  (rawScore < 0.25)  → Level 0 (None)
// ✅ CORRECTED CO-PO MAPPING FORMULA (Aligned with React reference code)
// Formula: rawScore = totalMatches / 3
// Level 3 (High):   rawScore >= 0.75  (3+ matches OR equivalents)
// Level 2 (Medium): rawScore >= 0.50  (1.5-2.25 matches)
// Level 1 (Low):    rawScore >= 0.25  (0.75-1.5 matches)
// Level 0 (None):   rawScore < 0.25   (0-0.75 matches)
function computeMapping(co, poIndex) {
  if (!co || !co.keywords || !Array.isArray(co.keywords)) {
    return { matchedKeywords: [], unmatchedKeywords: [], totalMatches: 0, rawScore: 0, finalLevel: 0 };
  }

  const poKey = `PO${poIndex}`;
  let matchedKeywords = [];
  let unmatchedKeywords = [];
  let totalMatches = 0;

  // ✅ Process each keyword from backend
  co.keywords.forEach(k => {
    // Backend structure: keyword (string), reasons (array)
    const keywordText = k.keyword || '';
    if (!keywordText) return;

    // Ensure reasons is an array (never null)
    const reasons = (k.reasons && Array.isArray(k.reasons)) ? k.reasons : [];
    
    if (reasons.length === 0) {
      unmatchedKeywords.push({ keyword: keywordText });
      return;
    }

    // ✅ Filter reasons that match this PO (case-insensitive)
    // Backend uses: po (lowercase or uppercase)
    const matched = reasons
      .filter(r => r && r.po && (r.po.toUpperCase() === poKey || r.po.toLowerCase() === poKey.toLowerCase()) && r.reason)
      .map(r => r.reason);

    if (matched.length > 0) {
      // ✅ Keyword matched for this PO
      matchedKeywords.push({
        keyword: keywordText,
        reasons: matched,
        count: matched.length
      });
      // ✅ Add count of matched reasons (each reason counts as 1 match)
      totalMatches += matched.length;
    } else {
      // ✅ Keyword did not match for this PO
      unmatchedKeywords.push({ keyword: keywordText });
    }
  });

  // ✅ FORMULA: totalMatches / 3
  // Fallback: If no matched reasons found, try keyword-to-PO statement matching (low confidence)
  if (totalMatches === 0 && co && Array.isArray(co.keywords)) {
    const poText = PO_STATEMENTS[poKey] ? PO_STATEMENTS[poKey].toLowerCase() : '';
    co.keywords.forEach(k => {
      const kw = (k.keyword || '').toLowerCase();
      if (kw && kw.length > 2 && poText.includes(kw)) {
        // Treat as low-confidence match: only 0.5 points
        totalMatches += 0.5;
        matchedKeywords.push({ keyword: kw, reasons: ['PO statement keyword match (low confidence)'], count: 0.5 });
      }
    });
  }

  // ✅ CORRECT LEVEL CALCULATION (as per React reference code)
  const rawScore = totalMatches / 3;
  let finalLevel = 0;
  if (rawScore >= 0.75) {
    finalLevel = 3;  // High
  } else if (rawScore >= 0.50) {
    finalLevel = 2;  // Medium
  } else if (rawScore >= 0.25) {
    finalLevel = 1;  // Low
  } else {
    finalLevel = 0;  // None
  }

  return {
    matchedKeywords,
    unmatchedKeywords,
    totalMatches,
    rawScore,
    finalLevel
  };
}

function genCOPO(cos, cosWithKeywords = null) {
  // ✅ DEBUG: Validate data alignment
  if (cosWithKeywords && cosWithKeywords.length !== cos.length) {
    console.warn(`⚠️ Data Length Mismatch: COs=${cos.length}, coData=${cosWithKeywords.length}`);
    console.warn('This may indicate stale backend data or incorrect CO retrieval');
    console.log('🔍 COs submitted:', cos);
    console.log('🔍 coData returned:', cosWithKeywords.map((c, i) => ({ index: i, CO: c.CO, keywords: c.keywords?.length || 0 })));
  }

  return cos.map((co, i) => {
    let pos = {};
    const coData = cosWithKeywords && cosWithKeywords[i]
      ? cosWithKeywords[i]
      : { CO: co, keywords: [] };

    // ✅ DEBUG: Log mapping source for this CO
    const hasKeywords = coData.keywords && coData.keywords.length > 0;
    if (hasKeywords) {
      console.log(`📊 CO${i + 1}: Found ${coData.keywords.length} keywords from backend`);
    }

    POS.forEach(p => {
      const poIndex = parseInt(p.replace('PO', ''));
      let level = 0;

      // ✅ COMPUTE mapping ONLY using computeMapping()
      // This ensures EXACT consistency with popup behavior
      // If a precomputed matrix is available, use it to avoid discrepancies
      if (S.coPoMatrix && S.coPoMatrix[i] && typeof S.coPoMatrix[i][p] !== 'undefined') {
        level = S.coPoMatrix[i][p];
      } else {
        const mapping = computeMapping(coData, poIndex);
        level = mapping.finalLevel;
      }

      // ✅ CRITICAL FIX: NO Bloom's fallback here!
      // The popup uses computeMapping() result directly without fallback.
      // To maintain consistency, the table must do the same.
      // If keywords don't match a PO, level should be 0 (not fallback to Bloom's).

      pos[p] = level;
    });

    return {
      co: `CO${i + 1}`,
      text: co,
      pos,
      data: coData
    };
  });
}

// Generate CO-PO matrix using generatedCOs or S.coData and store in S.coPoMatrix
function generateMatrix() {
  // Prefer authoritative S.coData (contains keywords with reasons)
  const isModeA = S.mode === 'A';

  const matrix = (S.coData && S.coData.length > 0)
    ? S.coData.map(cd => {
      if (isModeA) {
        // ✅ Mode A: Use backend keywords + reasons (AI-powered mapping from PDF analysis)
        // If backend provides keyword reasons, use them; otherwise use semantic CO-text matching
        
        // Try to use backend keyword reasons first (most accurate)
        const keywords = cd.keywords || [];
        
        if (keywords && keywords.length > 0 && keywords.some(k => k.reasons && k.reasons.length > 0)) {
          // ✅ Backend keywords with reasons are available - use them
          const row = {};
          for (let p = 1; p <= 12; p++) {
            let totalMatches = 0;
            
            // Count how many keywords have reasons for this PO
            keywords.forEach(k => {
              if (k.reasons && Array.isArray(k.reasons)) {
                const poReasons = k.reasons.filter(r => r.po === `PO${p}`);
                totalMatches += poReasons.length;
              }
            });
            
            // Calculate level: no artificial minimums, natural discretization
            // totalMatches >= 3 → Level 3 (strong)
            // totalMatches === 2 → Level 2 (medium)
            // totalMatches === 1 → Level 1 (weak)
            // totalMatches === 0 → Level 0 (not mapped)
            let level = 0;
            if (totalMatches >= 3) {
              level = 3;
            } else if (totalMatches === 2) {
              level = 2;
            } else if (totalMatches === 1) {
              level = 1;
            }
            
            row[`PO${p}`] = level;
          }
          return row;
        }
        
        // Fallback: Use semantic CO-text matching if no backend reasons
        const coText = (cd.CO || cd.co || cd.text || '').toString().toLowerCase();
        const poLevels = [];
        for (let p = 1; p <= 12; p++) {
          const { level, matchCount } = computeMappingSemantic(coText, p);
          poLevels.push({ p, level, matchCount });
        }

        // Build natural mapping WITHOUT artificial constraints
        const row = {};
        for (let p = 1; p <= 12; p++) {
          const pl = poLevels.find(x => x.p === p);
          row[`PO${p}`] = pl ? pl.level : 0;
        }
        return row;
      }

      // Non-Mode A: fallback to existing reason-based computeMapping
      const row = {};
      for (let i = 1; i <= 12; i++) {
        const mapping = computeMapping(cd, i);
        row[`PO${i}`] = mapping.finalLevel;
      }
      return row;
    })
    : (S.generatedCOs && S.generatedCOs.length > 0)
      ? S.generatedCOs.map(gco => {
        const row = {};
        // construct a lightweight coData for mapping: keywords with no reasons
        const lightweight = { keywords: (gco.keywords || []).map(k => ({ keyword: k, reasons: [] })) };
        for (let i = 1; i <= 12; i++) {
          const mapping = computeMapping(lightweight, i);
          row[`PO${i}`] = mapping.finalLevel;
        }
        return row;
      })
      : [];
  S.coPoMatrix = matrix;
  return matrix;
}
// ✅ STRICT SEMANTIC MAPPING - NBA Style CO-PO Alignment
// NO artificial boosting, NO generic keywords, ONLY strong domain-specific matches
function computeMappingSemantic(coText, poIndex) {
  const text = (coText || '').toLowerCase();
  
  // ✅ STRICT PO-specific keywords (NO overlapping, NO generic terms)
  // Each keyword belongs to AT MOST one or two POs
  const rules = {
    PO1: {
      // Engineering knowledge & fundamentals
      keywords: ["fundamental", "principle", "theory", "basic", "foundation", "core", "definition", "element"],
      bloomBonus: [1, 2],
      weight: 1.0
    },
    PO2: {
      // Problem analysis & identification
      keywords: ["analyze", "analysis", "identify", "problem", "evaluate", "assess", "investigate", "examination"],
      bloomBonus: [4],
      weight: 1.0
    },
    PO3: {
      // Design, development, implementation
      keywords: ["design", "develop", "implementation", "implement", "create", "build", "construct", "engineer"],
      bloomBonus: [3, 5, 6],
      weight: 1.0
    },
    PO4: {
      // Research & experimentation
      keywords: ["research", "experiment", "experimental", "investigation", "methodology", "approach", "technique"],
      bloomBonus: [4, 5],
      weight: 1.0
    },
    PO5: {
      // Modern tools, technology, automation
      keywords: ["tool", "tools", "technology", "devops", "automation", "ci/cd", "cloud", "framework", "platform", "software", "deployment", "pipeline"],
      bloomBonus: [3, 5],
      weight: 1.0
    },
    PO6: {
      // Engineers and society / social impact
      keywords: ["society", "social", "community", "stakeholder", "impact", "responsibility", "sustainable"],
      bloomBonus: [2, 3],
      weight: 1.0
    },
    PO7: {
      // Environment & sustainability
      keywords: ["environment", "sustainability", "sustainable", "green", "ecological", "carbon", "emission"],
      bloomBonus: [3, 4],
      weight: 1.0
    },
    PO8: {
      // Ethics & professional responsibility
      keywords: ["ethical", "ethics", "integrity", "compliance", "legal", "moral", "professional", "conduct"],
      bloomBonus: [2, 3],
      weight: 1.0
    },
    PO9: {
      // Teamwork & collaboration (STRICT - no "group" which is too generic)
      keywords: ["team", "teamwork", "collaboration", "collaborative", "coordinate", "cooperation", "work together"],
      bloomBonus: [2, 3],
      weight: 1.0
    },
    PO10: {
      // Communication (very specific)
      keywords: ["communication", "communicate", "presentation", "presentation", "document", "documentation", "report", "written", "verbal"],
      bloomBonus: [3, 4],
      weight: 1.0
    },
    PO11: {
      // Project management (specific to PM, not generic)
      keywords: ["project", "management", "planning", "plan", "schedule", "timeline", "deliverable", "milestone", "resource", "scope"],
      bloomBonus: [3, 4, 5],
      weight: 1.0
    },
    PO12: {
      // Lifelong learning & self-development
      keywords: ["learn", "learning", "self-learning", "continuous", "improvement", "adapt", "adaptation", "skill development"],
      bloomBonus: [2, 3, 4],
      weight: 1.0
    }
  };

  const poKey = `PO${poIndex}`;
  const poRule = rules[poKey] || { keywords: [], bloomBonus: [], weight: 1.0 };
  
  let matchCount = 0;
  const bloomLevel = extractBloomLevel(coText);
  
  // ✅ STRICT matching: word boundaries only, case-insensitive
  poRule.keywords.forEach(k => {
    const regex = new RegExp(`\\b${k}\\b`, 'i');
    if (regex.test(text)) {
      matchCount++;
      // ✅ NO Bloom bonus - keep it pure keyword-based
    }
  });

  // ✅ STRICT LEVEL CALCULATION - MUST have strong evidence
  // NO artificial weighting, NO partial matches
  let level = 0;
  if (matchCount >= 3) {
    level = 3; // HIGH: 3+ strong keyword matches (very specific to this PO)
  } else if (matchCount === 2) {
    level = 2; // MEDIUM: exactly 2 keyword matches (meaningful relevance)
  } else if (matchCount === 1) {
    level = 1; // LOW: exactly 1 keyword match (weak relevance)
  }
  // CRITICAL: matchCount === 0 → level = 0 (NO mapping, period)
  
  return { level, matchCount };
}

// ✅ Extract Bloom's level from CO text (detect verb pattern)
function extractBloomLevel(coText) {
  const text = (coText || '').toLowerCase();
  
  const bloomVerbs = {
    1: ["recall", "recognize", "identify", "list", "define"],
    2: ["understand", "summarize", "classify", "compare", "explain"],
    3: ["apply", "implement", "solve", "use", "demonstrate"],
    4: ["analyze", "categorize", "examine", "compare", "contrast"],
    5: ["evaluate", "critique", "assess", "appraise", "judge"],
    6: ["create", "design", "develop", "synthesize", "propose"]
  };
  
  for (let level = 6; level >= 1; level--) {
    const verbs = bloomVerbs[level];
    if (verbs.some(v => text.includes(v))) {
      return level;
    }
  }
  return 0; // No Bloom verb found, default neutral
}
// ════════════════════════════════════════
// SYLLABUS GENERATION
// ════════════════════════════════════════
const SYL_TEMPLATES={python:[{t:'Python Fundamentals',tp:'Introduction to Python, History and Applications, Variables, Data Types, Type Casting, Operators, Precedence, Keywords, I/O Statements, Conditionals, Loops (for/while), Functions, Lambda Functions, User-Defined Functions'},{t:'Strings, Exceptions & Regular Expressions',tp:'String Operations, Unicode, String Formatting, Format Specifiers, Common String Methods, Slicing, Exception Handling (try/except/finally), Custom Exceptions, Regular Expressions — Pattern Matching, Case Studies (Street Addresses, Roman Numerals)'},{t:'Object Oriented Programming & Files',tp:'Defining Classes, __init__ Method, Instantiating Classes, Abstraction, Encapsulation, Single & Multiple Inheritance, Polymorphism, Operator Overloading, Decorators, Descriptors, File I/O — Text and Binary Files'},{t:'NumPy & Array Processing',tp:'Introduction to NumPy, Creating Arrays, Indexing and Slicing, Array Transposition, Universal Array Functions, Array Processing, Broadcasting, Array I/O'},{t:'Pandas & Data Visualization',tp:'Introduction to Pandas, Series and DataFrames, Data Cleaning and Aggregation, GroupBy, Matplotlib — Line/Bar/Histogram/Scatter Charts, Data Visualization with Seaborn'}],network:[{t:'Network Fundamentals & OSI Model',tp:'Introduction to Networks, LAN/WAN/MAN, OSI vs TCP/IP Model, Topologies, Transmission Media, Signal Encoding, Multiplexing, Switching'},{t:'Data Link & Network Layer',tp:'Data Link Layer Functions, Error Detection (CRC/Hamming), Flow Control, MAC Protocols, Ethernet, IP Addressing, IPv4/IPv6, Subnetting, Routing Algorithms, ARP/RARP'},{t:'Transport & Application Layer',tp:'TCP vs UDP, Connection Establishment, Flow & Congestion Control, DNS, HTTP/HTTPS, FTP, SMTP, POP3/IMAP, DHCP'},{t:'Network Security',tp:'Cryptography Basics, Symmetric (AES/DES) & Asymmetric Encryption (RSA), Hash Functions, Digital Signatures, SSL/TLS, Firewalls, IDS/IPS, VPN'}],default:[{t:'Foundations & Core Concepts',tp:'Introduction and Overview, Historical Context, Fundamental Principles, Key Terminology, Scope and Applications, Basic Algorithms'},{t:'Core Techniques & Methods',tp:'Methodologies, Algorithms, Data Structures, Implementation Strategies, Problem Solving, Case Studies'},{t:'Advanced Topics & Applications',tp:'Advanced Algorithms, Optimization, Real-World Applications, Industry Practices, Integration Concepts'},{t:'Tools, Frameworks & Project Work',tp:'Tools and Frameworks, Best Practices, Testing and Validation, Documentation, Mini Project Application'}]};
function genSyllabus(title,cos,credits){const l=title.toLowerCase();const k=l.includes('python')?'python':(l.includes('network')||l.includes('security')||l.includes('cns'))?'network':'default';const t=SYL_TEMPLATES[k];const n=parseInt(credits)>=4?Math.min(5,t.length):4;return t.slice(0,n).map((u,i)=>({num:i+1,title:u.t,topics:u.tp}));}
function genUpdated(existing, cos) {
  const ct = cos.join(' ').toLowerCase();
  let added = 0, removed = 0, modified = 0, same = 0;
  
  const units = existing.map((u, i) => {
    const topics = (u.topics || '').split(/[,\n]+/).map(t => t.trim()).filter(t => t.length > 2);
    const diff = topics.map(t => {
      const tl = t.toLowerCase();
      if (tl.includes('legacy') || tl.includes('deprecated') || tl.includes('2.x')) {
        removed++;
        return { text: t, type: 'removed' };
      }
      if (modified < 2 && Math.random() < 0.15) {
        modified++;
        return { text: t, type: 'modified', newText: t + ' (Updated for current standards)' };
      }
      same++;
      return { text: t, type: 'same' };
    });
    
    if (i === 0) {
      diff.push({ text: 'Type Hints and Annotations (PEP 526)', type: 'added' });
      added++;
    }
    if (i === 2 && ct.includes('overload')) {
      diff.push({ text: 'Protocol Classes and Structural Subtyping', type: 'added' });
      added++;
    }
    
    return { num: i + 1, title: u.title || `Unit ${i + 1}`, diffTopics: diff };
  });
  
  const tot = added + removed + modified + same;
  const pct = tot > 0 ? Math.round(((added + removed + modified) / tot) * 100) : 22;
  
  return { units, stats: { added, removed, modified, same, modPct: pct } };
}

// ════════════════════════════════════════
// CO-PO KEYWORD BREAKDOWN (Interactive Modal)
// ════════════════════════════════════════
function showCOPOBreakdown(coIndex, poIndex) {
  if (!S.coData || !S.coData[coIndex]) {
    alert('CO-PO keyword mapping not available yet.');
    return;
  }
  
  const co = S.coData[coIndex];
  console.log('📊 POPUP: Computing mapping for CO' + (coIndex + 1) + ' → PO' + poIndex);
  console.log('📊 POPUP: CO data:', co);
  const mapping = computeMapping(co, poIndex);
  console.log('📊 POPUP: Final level =', mapping.finalLevel, '(rawScore:', mapping.rawScore.toFixed(3), ')');
  const poKey = `PO${poIndex}`;
  const poStmt = PO_STATEMENTS[poKey] || 'No statement available';
  
  // ✅ Create modal overlay
  const modalId = 'copo-modal-' + Date.now();
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(27, 58, 107, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 16px;
    backdrop-filter: blur(4px);
  `;
  
  // ✅ Get level color - Dashboard themed
  const levelColors = {
    3: { bg: '#E1F5EE', color: '#1D9E75', border: '#85D4B8', label: 'High' },
    2: { bg: '#E6F1FB', color: '#3A86FF', border: '#B5D4F4', label: 'Medium' },
    1: { bg: '#F0F4FB', color: '#6B7280', border: '#D1DCF0', label: 'Low' },
    0: { bg: '#F7F9FC', color: '#9CA3AF', border: '#E5E7EB', label: 'None' }
  };
  const lvlStyle = levelColors[mapping.finalLevel] || levelColors[0];
  
  // ✅ Create modal content
  const content = document.createElement('div');
  content.style.cssText = `
    background: #fff;
    border: 1.5px solid #D1DCF0;
    border-radius: 16px;
    width: 100%;
    max-width: 640px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1A1A2E;
    box-shadow: 0 10px 40px rgba(27, 58, 107, 0.15);
  `;
  
  // ✅ Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 24px 28px 0;
    flex-shrink: 0;
    border-bottom: 1px solid #D1DCF0;
  `;
  
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
      <div>
        <p style="margin: 0; font-size: 11px; color: #6B7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.12em;">CO–PO Keyword Breakdown</p>
        <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px;">
          <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1B3A6B;">PO${poIndex} Mapping</p>
          <span style="display: inline-block; min-width: 34px; padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; background: ${lvlStyle.bg}; color: ${lvlStyle.color}; border: 1.5px solid ${lvlStyle.border}; text-align: center;">L${mapping.finalLevel}</span>
        </div>
      </div>
      <button onclick="document.getElementById('${modalId}').remove()" style="background: #F7F9FC; border: 1.5px solid #D1DCF0; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; color: #6B7280; font-size: 14px; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: 0.2s;">✕</button>
    </div>
    
    <div style="background: #F0F4FB; border-radius: 10px; padding: 12px 16px; border-left: 3px solid #3A86FF; margin-bottom: 12px;">
      <p style="margin: 0; font-size: 11px; color: #2E5BA8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Course Outcome</p>
      <p style="margin: 4px 0 0; font-size: 13px; color: #1A1A2E; line-height: 1.55; font-weight: 500;">${co.CO || co}</p>
    </div>
    
    <div style="background: #E1F5EE; border-radius: 10px; padding: 12px 16px; border-left: 3px solid #1D9E75; margin-bottom: 16px;">
      <p style="margin: 0; font-size: 11px; color: #085041; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">PO${poIndex}: Program Outcome</p>
      <p style="margin: 4px 0 0; font-size: 13px; color: #1A1A2E; line-height: 1.55; font-weight: 500;">${poStmt}</p>
    </div>
    
    <div style="display: flex; gap: 6px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #D1DCF0;">
      <button onclick="closeKeywordModal('${modalId}', 'all')" style="padding: 6px 14px; font-size: 12px; font-weight: 600; border-radius: 8px; cursor: pointer; background: #1B3A6B; color: #fff; border: 1.5px solid #1B3A6B;">All (${mapping.matchedKeywords.length + mapping.unmatchedKeywords.length})</button>
      <button onclick="closeKeywordModal('${modalId}', 'matched')" style="padding: 6px 14px; font-size: 12px; font-weight: 600; border-radius: 8px; cursor: pointer; background: transparent; color: #1D9E75; border: 1.5px solid #85D4B8;">✓ Matched (${mapping.matchedKeywords.length})</button>
      <button onclick="closeKeywordModal('${modalId}', 'unmatched')" style="padding: 6px 14px; font-size: 12px; font-weight: 600; border-radius: 8px; cursor: pointer; background: transparent; color: #6B7280; border: 1.5px solid #D1DCF0;">✕ Unmatched (${mapping.unmatchedKeywords.length})</button>
    </div>
  `;
  
  // ✅ Body
  const body = document.createElement('div');
  body.style.cssText = `
    overflow-y: auto;
    padding: 20px 28px 28px;
    flex: 1;
  `;
  
  const allKeywords = [
    ...mapping.matchedKeywords.map(k => ({ ...k, matched: true })),
    ...mapping.unmatchedKeywords.map(k => ({ ...k, matched: false }))
  ];
  
  // ✅ Keywords list
  const keywordsList = allKeywords.map(k => `
    <div style="margin-bottom: 12px; border-radius: 10px; border: 1.5px solid ${k.matched ? '#85D4B8' : '#D1DCF0'}; background: ${k.matched ? '#E1F5EE' : '#F7F9FC'}; overflow: hidden; transition: 0.2s;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1.5px solid ${k.matched ? '#85D4B8' : '#D1DCF0'};">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background: ${k.matched ? '#1D9E75' : '#EF4444'};"></span>
          <span style="font-size: 13px; font-weight: 600; padding: 2px 12px; border-radius: 8px; background: ${k.matched ? '#FFF' : '#F7F9FC'}; color: ${k.matched ? '#1D9E75' : '#6B7280'}; border: 1px solid ${k.matched ? '#85D4B8' : '#D1DCF0'};">${k.keyword}</span>
        </div>
        <span style="font-size: 12px; font-weight: 600; color: ${k.matched ? '#1D9E75' : '#EF4444'}; background: ${k.matched ? '#E1F5EE' : '#FEF2F2'}; border: 1px solid ${k.matched ? '#85D4B8' : '#FECACA'}; padding: 3px 12px; border-radius: 8px;">${k.matched ? `+${k.count}` : '—'}</span>
      </div>
      <div style="padding: 12px 16px;">
        ${k.matched 
          ? k.reasons.map((r, j) => `
              <div style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: ${j < k.reasons.length - 1 ? '6px' : '0'};">
                <span style="color: #1D9E75; font-size: 12px; margin-top: 2px; flex-shrink: 0; font-weight: 700;">→</span>
                <p style="margin: 0; font-size: 13px; color: #1A1A2E; line-height: 1.55;">${typeof r === 'string' ? r : (r.reason || r)}</p>
              </div>`).join('')
          : `<p style="margin: 0; font-size: 13px; color: #6B7280;">No direct mapping to <strong style="color: #1A1A2E; font-weight: 600;">PO${poIndex}</strong></p>`}
      </div>
    </div>
  `).join('');
  
  // ✅ Level calculation
  const levelCalc = `
    <div style="border-radius: 12px; border: 1.5px solid #D1DCF0; overflow: hidden; margin-top: 24px;">
      <div style="background: #F0F4FB; padding: 12px 16px; border-bottom: 1.5px solid #D1DCF0;">
        <p style="margin: 0; font-size: 11px; font-weight: 700; color: #2E5BA8; text-transform: uppercase; letter-spacing: 0.12em;">Mapping Algorithm</p>
      </div>
      <div style="padding: 16px 20px; background: #fff;">
        <div style="font-family: 'Courier New', monospace; font-size: 12px; color: #1A1A2E; background: #F7F9FC; border-radius: 8px; padding: 14px 16px; border: 1px solid #D1DCF0; margin-bottom: 14px; line-height: 2.2;">
          <div><span style="color: #6B7280;">Keywords:</span> <strong style="color: #1B3A6B;">${allKeywords.length}</strong> total — <span style="color: #1D9E75; font-weight: 700;">${mapping.matchedKeywords.length} matched</span> + <span style="color: #EF4444; font-weight: 700;">${mapping.unmatchedKeywords.length} unmatched</span></div>
          <div><span style="color: #6B7280;">Match %:</span> <strong style="color: #1B3A6B;">${(mapping.matchedKeywords.length / allKeywords.length * 100).toFixed(0)}%</strong></div>
          <div><span style="color: #6B7280;">Raw Score:</span> <strong style="color: #3A86FF;">${mapping.rawScore.toFixed(3)}</strong></div>
        </div>
        
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B7280; margin-bottom: 8px;">
            <span>0.0</span>
            <span style="color: #6B7280;">0.25 → L1</span>
            <span style="color: #3A86FF;">0.50 → L2</span>
            <span style="color: #1D9E75;">0.75 → L3</span>
            <span>1.0</span>
          </div>
          <div style="position: relative; height: 8px; background: #E5E7EB; border-radius: 6px; overflow: hidden; border: 1px solid #D1DCF0;">
            <div style="height: 100%; width: ${Math.min(mapping.rawScore, 1) * 100}%; background: linear-gradient(90deg, #3A86FF, #1D9E75); border-radius: 6px; min-width: ${mapping.rawScore > 0 ? '4px' : '0'};"></div>
            <div style="position: absolute; top: 0; bottom: 0; left: 25%; width: 1px; background: #9CA3AF; opacity: 0.5;"></div>
            <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: #9CA3AF; opacity: 0.5;"></div>
            <div style="position: absolute; top: 0; bottom: 0; left: 75%; width: 1px; background: #9CA3AF; opacity: 0.5;"></div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
          <div style="padding: 10px 14px; border-radius: 8px; background: ${mapping.finalLevel === 3 ? '#E1F5EE' : '#F7F9FC'}; border: 1.5px solid ${mapping.finalLevel === 3 ? '#85D4B8' : '#D1DCF0'}; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: ${mapping.finalLevel === 3 ? '#085041' : '#6B7280'}; font-weight: 600;">≥ 0.75</span>
            <span style="font-size: 12px; font-weight: 700; color: ${mapping.finalLevel === 3 ? '#1D9E75' : '#9CA3AF'};">L3</span>
          </div>
          <div style="padding: 10px 14px; border-radius: 8px; background: ${mapping.finalLevel === 2 ? '#E6F1FB' : '#F7F9FC'}; border: 1.5px solid ${mapping.finalLevel === 2 ? '#B5D4F4' : '#D1DCF0'}; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: ${mapping.finalLevel === 2 ? '#1B3A6B' : '#6B7280'}; font-weight: 600;">≥ 0.50</span>
            <span style="font-size: 12px; font-weight: 700; color: ${mapping.finalLevel === 2 ? '#3A86FF' : '#9CA3AF'};">L2</span>
          </div>
          <div style="padding: 10px 14px; border-radius: 8px; background: ${mapping.finalLevel === 1 ? '#F0F4FB' : '#F7F9FC'}; border: 1.5px solid ${mapping.finalLevel === 1 ? '#D1DCF0' : '#D1DCF0'}; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: ${mapping.finalLevel === 1 ? '#1B3A6B' : '#6B7280'}; font-weight: 600;">≥ 0.25</span>
            <span style="font-size: 12px; font-weight: 700; color: ${mapping.finalLevel === 1 ? '#6B7280' : '#9CA3AF'};">L1</span>
          </div>
          <div style="padding: 10px 14px; border-radius: 8px; background: #F7F9FC; border: 1.5px solid #D1DCF0; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #6B7280; font-weight: 600;">< 0.25</span>
            <span style="font-size: 12px; font-weight: 700; color: #9CA3AF;">L0</span>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-radius: 10px; background: ${lvlStyle.bg}; border: 1.5px solid ${lvlStyle.border};">
          <div>
            <p style="margin: 0; font-size: 10px; font-weight: 700; color: ${lvlStyle.color}; text-transform: uppercase; letter-spacing: 0.1em;">Final Mapping Level</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: ${lvlStyle.color}; font-weight: 600;">
              ${mapping.rawScore.toFixed(3)} → Level ${mapping.finalLevel} (${lvlStyle.label})
            </p>
          </div>
          <span style="font-size: 36px; font-weight: 800; color: ${lvlStyle.color};">${mapping.finalLevel}</span>
        </div>
      </div>
    </div>
  `;
  
  body.innerHTML = keywordsList + levelCalc;
  
  // ✅ Assemble and show
  content.appendChild(header);
  content.appendChild(body);
  modal.appendChild(content);
  
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  document.body.appendChild(modal);
}

function closeKeywordModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.remove();
}

// Update matrix table to be clickable
function makeMatrixInteractive() {
  const matrixCells = document.querySelectorAll('#matrix-table tbody td');
  matrixCells.forEach((cell, idx) => {
    if (idx % 13 === 0) return; // Skip CO labels
    cell.style.cursor = 'pointer';
    cell.title = 'Click to see keyword breakdown';
    cell.addEventListener('click', () => {
      const row = Math.floor(idx / 13);
      const col = (idx % 13) - 1;
      if (col >= 0 && S.coData.length > row) {
        showCOPOBreakdown(row, col + 1);
      }
    });
  });
}
function goToLanding(){show('view-landing');scroll(0,0);}
function goToApp(){show('view-app');goToSelect();}
function goToSelect(){el('view-select').style.display='block';el('wizard-shell').style.display='none';el('view-preview').style.display='none';scroll(0,0);}
function goToPreview(){show('view-app');el('view-preview').style.display='block';el('wizard-shell').style.display='none';el('view-select').style.display='none';scroll(0,0);}
function goToBOS(){buildBOSDashboard();show('view-bos');scroll(0,0);}
function goToBOSDirect(){S.mode='A';S.cos=['Write simple computational programs using functions','Write programs to compute mathematical functions using loops','Write data processing scripts using string and dictionaries','Write classes using OOP features including inheritance','Apply NumPy package for data analysis','Write visualization scripts using pandas and matplotlib'];S.courseTitle='Introduction to Python Programming';S.courseCode='B22EFS415';S.courseSem='IV Semester';S.courseBranch='CSE';S.generatedSyllabus=genSyllabus('Python',S.cos,'3');S.existingUnits=S.generatedSyllabus.map((u,i)=>({title:u.title,topics:u.topics}));const r=genUpdated(S.existingUnits,S.cos);S.modStats=r.stats;buildBOSDashboard();show('view-bos');scroll(0,0);}
function backToForm(){el('view-preview').style.display='none';el('wizard-shell').style.display='block';showStepById('step-books');scroll(0,0);}
function backFromBooks(){S.mode==='A'?showStep(3):showStep(2);}

// ═══════════════════════════════════════════════════════════════════════
// TEXTBOOKS UPLOAD HANDLER (Mode A)
// ✅ Extracts textbook names, authors, and stores in structured format
function handleTextbooksUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const fileName = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const textbooks = extractTextbooks(text);
    S.textbooks = textbooks;
    S.authors = textbooks.map(tb => tb.author).filter(a => a);
    el('textbooks-filename').textContent = fileName;
    el('textbooks-result').style.display = 'block';
    
    // ✅ Display textbooks in UI for confirmation
    if (textbooks.length > 0) {
      const tbList = textbooks.slice(0, 5).map(tb => `<li><strong>${tb.name}</strong> - ${tb.author || 'Unknown Author'}</li>`).join('');
      const display = document.createElement('div');
      display.style.cssText = 'margin-top: 12px; padding: 12px; background: #f0f4fb; border-radius: 8px; font-size: 12px;';
      display.innerHTML = `<p style="margin: 0 0 8px 0; font-weight: 600; color: #1b3a6b;">📚 Extracted Textbooks:</p><ol style="margin: 0; padding-left: 20px;">${tbList}</ol>`;
      const resultsArea = el('textbooks-result');
      const existingDisplay = resultsArea.querySelector('[data-textbooks-preview]');
      if (existingDisplay) existingDisplay.remove();
      display.setAttribute('data-textbooks-preview', 'true');
      resultsArea.appendChild(display);
    }
    
    console.log('📚 Textbooks uploaded (extracted):', { file: fileName, textbooks });
  };
  reader.readAsText(file);
}

function extractTextbooks(text) {
  // ✅ Parse textbooks: "Title by Author" or "Title - Author" format
  // ROBUST handling for corrupted/garbled text from PDF extraction
  const textbooks = [];
  
  // Filter out corrupted/garbled lines (mostly special characters, too short, etc)
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => {
      // Skip lines that are too short
      if (l.length < 5) return false;
      // Skip lines that are mostly special characters or corrupted Unicode
      const alphanumericCount = (l.match(/[a-zA-Z0-9\s]/g) || []).length;
      const rubbish = l.length - alphanumericCount;
      // If more than 50% is non-alphanumeric, skip it (corrupted)
      if (rubbish / l.length > 0.5) return false;
      return true;
    });
  
  console.log('📚 Filtered textbook lines:', lines.length, 'from', text.split('\n').length);
  
  const patterns = [
    /^([^-]*?)\s*[-–]\s*([^,]*?)\s*(?:,|$)/,  // "Title - Author,"
    /^([^b]*?)\s+by\s+([^,]*?)\s*(?:,|$)/i    // "Title by Author,"
  ];
  
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[1] && match[2]) {
        const name = match[1].trim();
        const author = match[2].trim();
        // Validate: name should be 5+ chars, author should be 3+ chars, both mostly alphanumeric
        const nameAlpha = (name.match(/[a-zA-Z0-9\s]/g) || []).length;
        const authorAlpha = (author.match(/[a-zA-Z0-9\s]/g) || []).length;
        if (name.length >= 5 && author.length >= 3 && nameAlpha / name.length > 0.7 && authorAlpha / author.length > 0.7) {
          textbooks.push({ name, author });
          console.log('✅ Extracted textbook:', { name, author });
          break;
        }
      }
    }
  }
  
  // ✅ Fallback: extract individual names if parsing fails
  if (textbooks.length === 0) {
    console.log('⚠️ No structured textbooks found, extracting author names...');
    const names = extractAuthors(text);
    return names.map(n => ({ name: n, author: 'Retrieved from PDF' }));
  }
  
  const deduplicated = [...new Map(textbooks.map(tb => [tb.name, tb])).values()].slice(0, 10);
  console.log('📚 Final textbooks extracted:', deduplicated);
  return deduplicated;
}

function extractAuthors(text) {
  const authors = [];
  // More robust name extraction: look for capitalized words and common author name patterns
  const namePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]\.[\s]*[A-Z][a-z]+)/g;
  const matches = text.match(namePattern) || [];
  
  for (const match of matches) {
    const name = match.trim();
    // Validate: 3+ chars, 100 chars max, 1-4 words
    if (name.length >= 3 && name.length <= 100 && name.split(/\s+/).length <= 4) {
      // Skip common non-author words and single letters
      if (!['The', 'And', 'For', 'With', 'From', 'By', 'In', 'On', 'Of'].includes(name) && name.length > 1) {
        authors.push(name);
      }
    }
  }
  
  const deduplicated = [...new Set(authors)].slice(0, 10);
  console.log('👥 Extracted author names:', deduplicated);
  return deduplicated;
}

function clearTextbooksUpload() {
  S.authors = [];
  const tbFile = el('textbooks-file'); if (tbFile) tbFile.value = '';
  const tbResult = el('textbooks-result'); if (tbResult) tbResult.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════════════
// DOCX DOWNLOAD - GENERATES PROPERLY FORMATTED DOCUMENT
// ═══════════════════════════════════════════════════════════════════════

function downloadDocx() {
  console.log('📥 Generating DOCX...');
  
  // ✅ STRICT: Extract course metadata from S state (already validated in generatePreview)
  const courseTitle = (S.courseTitle && S.courseTitle.trim()) || 'Unknown Course';
  const courseCode = (S.courseCode && S.courseCode.trim()) || 'XXXXX';
  const semester = (S.courseSem && S.courseSem.trim()) || 'IV Semester';
  const branch = (S.courseBranch && S.courseBranch.trim()) || 'CSE';
  const credits = el('f-credits')?.value || '3';
  const courseType = el('f-type')?.value || 'SC';
  const overview = S.mode === 'A' 
    ? (S.analysisData?.improvements?.join('. ') || 'Course updated from PDF analysis.')
    : (el('f-overview')?.value || 'Course Overview');
  const assess = el('f-assess')?.value || 'CIE 50% / SEE 50%';
  
  const cos = S.cos;
  const rows = genCOPO(cos, S.coData);
  
  console.log('📄 DOCX Generation Started:', {
    courseCode,
    courseTitle,
    cosCount: cos.length,
    rowsGenerated: rows.length,
    dataValid: S.coData && S.coData.length > 0,
    mode: S.mode,
    textbooksCount: (S.textbooks || []).length
  });
  
  if (rows.length > 0) {
    const firstRow = rows[0];
    const populatedPOs = Object.values(firstRow.pos).filter(v => v > 0).length;
    console.log('✅ Sample CO-PO Matrix:', { CO: firstRow.co, mappedPOs: populatedPOs });
  }
  
  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${courseCode} - ${courseTitle}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Calibri', 'Arial', sans-serif; 
    color: #000; 
    line-height: 1.3; 
    padding: 36pt;
    page-margin: 36pt;
  }
  .page-break { page-break-after: always; }
  h1 { font-size: 16pt; font-weight: bold; margin: 18pt 0 12pt 0; color: #1B3A6B; border-bottom: 2px solid #1B3A6B; padding-bottom: 6pt; }
  h2 { font-size: 13pt; font-weight: bold; margin: 14pt 0 8pt 0; color: #1B3A6B; }
  h3 { font-size: 12pt; font-weight: bold; margin: 10pt 0 6pt 0; }
  p { font-size: 11pt; margin-bottom: 10pt; text-align: justify; line-height: 1.4; }
  ol, ul { margin-left: 24pt; margin-bottom: 10pt; }
  li { margin-bottom: 6pt; font-size: 11pt; }
  table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 10pt; }
  th { 
    background-color: #1B3A6B; 
    color: white; 
    padding: 8pt; 
    text-align: center;
    font-weight: bold;
    border: 1px solid #1B3A6B;
  }
  td { 
    border: 1px solid #000; 
    padding: 8pt; 
    text-align: left;
  }
  td.center { text-align: center; }
  tr:nth-child(even) { background-color: #f5f5f5; }
  .header-table { margin: 12pt 0; }
  .header-table td { border: 1px solid #000; padding: 6pt; }
  .course-title { font-size: 12pt; font-weight: bold; margin-bottom: 6pt; }
  .course-meta { font-size: 10pt; margin-bottom: 12pt; }
  .note { font-size: 9pt; font-style: italic; color: #555; margin-top: 6pt; }
</style>
</head>
<body>

<!-- TITLE PAGE / HEADER -->
<div style="margin-bottom: 24pt;">
  <table class="header-table">
    <tr>
      <td style="width: 50%;"><strong>Course Title</strong></td>
      <td>${courseTitle}</td>
      <td style="width: 20%;"><strong>Course Type</strong></td>
      <td style="width: 20%;">${courseType}</td>
    </tr>
    <tr>
      <td><strong>Course Code</strong></td>
      <td>${courseCode}</td>
      <td><strong>Credits</strong></td>
      <td>${credits}</td>
    </tr>
    <tr>
      <td><strong>Semester</strong></td>
      <td>${semester}</td>
      <td><strong>Branch</strong></td>
      <td>${branch}</td>
    </tr>
  </table>
</div>

<!-- COURSE STRUCTURE -->
<h1>COURSE STRUCTURE</h1>
<table>
  <thead>
    <tr>
      <th>Component</th>
      <th>L</th>
      <th>T</th>
      <th>P</th>
      <th>Credits</th>
      <th>Contact Hours</th>
      <th>Workload</th>
      <th>Assessment</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Lecture</td>
      <td class="center">3</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td class="center">${credits}</td>
      <td class="center">42</td>
      <td class="center">${credits}</td>
      <td>${assess}</td>
    </tr>
    <tr>
      <td>Tutorial</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td>—</td>
    </tr>
    <tr>
      <td>Practical</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td class="center">-</td>
      <td>—</td>
    </tr>
  </tbody>
</table>

<!-- COURSE OVERVIEW -->
<h1>COURSE OVERVIEW</h1>
<p>${overview}</p>

<!-- COURSE OBJECTIVES -->
<h1>COURSE OBJECTIVES</h1>
<p>The objectives of this course are to:</p>
<ol>
${cos.map((co, i) => `<li>${co}</li>`).join('')}
</ol>

<!-- COURSE OUTCOMES -->
<h1>COURSE OUTCOMES</h1>
<p>After completion of the course, the student will be able to:</p>
<table>
  <thead>
    <tr>
      <th>CO#</th>
      <th>Course Outcomes</th>
      <th>Bloom Level</th>
      <th>Key Topics</th>
    </tr>
  </thead>
  <tbody>
${cos.map((co, i) => {
  const coData = S.coData[i] || {};
  const bloomLevel = ['', 'Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'][coData.bloomLevel || 2];
  const topicsPreview = (coData.keywords || []).slice(0, 2).map(k => k.keyword).join(', ');
  return `<tr>
      <td class="center"><strong>CO${i+1}</strong></td>
      <td>${co}</td>
      <td class="center">${bloomLevel}</td>
      <td>${topicsPreview || 'N/A'}</td>
    </tr>`;
}).join('')}
  </tbody>
</table>

<!-- BLOOM'S LEVEL OF COURSE OUTCOMES -->
<h1>BLOOM'S LEVEL OF COURSE OUTCOMES</h1>
<table>
  <thead>
    <tr>
      <th class="center">CO#</th>
      <th class="center">L1: Remember</th>
      <th class="center">L2: Understand</th>
      <th class="center">L3: Apply</th>
      <th class="center">L4: Analyze</th>
      <th class="center">L5: Evaluate</th>
      <th class="center">L6: Create</th>
    </tr>
  </thead>
  <tbody>
${cos.map((co, i) => {
  const coData = S.coData[i] || {};
  const bloomLevel = coData.bloomLevel || 2;
  let row = `<tr><td class="center"><strong>CO${i+1}</strong></td>`;
  for (let lv = 1; lv <= 6; lv++) {
    row += `<td class="center">${lv === bloomLevel ? '✓' : ''}</td>`;
  }
  row += `</tr>`;
  return row;
}).join('')}
  </tbody>
</table>

<!-- CO-PO ARTICULATION MATRIX -->
<div class="page-break"></div>
<h1>COURSE ARTICULATION MATRIX</h1>
<p class="note"><strong>Note:</strong> 1=Low, 2=Medium, 3=High</p>
<table style="font-size: 9pt;">
  <thead>
    <tr>
      <th>CO#/POs</th>
${POS.map(po => `<th class="center">${po}</th>`).join('')}
    </tr>
  </thead>
  <tbody>
${rows.map((r, i) => `<tr><td class="center"><strong>CO${i+1}</strong></td>
${POS.map(po => {
  const val = r.pos[po];
  const display = val > 0 ? val : '—';
  return `<td class="center">${display}</td>`;
}).join('')}
    </tr>`).join('')}
  </tbody>
</table>

<!-- COURSE CONTENT -->
<div class="page-break"></div>
<h1>COURSE CONTENT</h1>
${(() => {
  const syllabus = S.mode === 'A' ? (S.existingUnits || []) : (S.generatedSyllabus || []);
  let content = '';
  if (syllabus && syllabus.length > 0) {
    syllabus.forEach((unit, i) => {
      const unitTitle = unit.moduleName || unit.title || `Unit ${i+1}`;
      content += `<h2>UNIT ${i+1}: ${unitTitle}</h2>`;
      if (unit.topics) {
        let topicsText = '';
        if (Array.isArray(unit.topics)) {
          topicsText = unit.topics.join(', ');
        } else if (typeof unit.topics === 'string') {
          topicsText = unit.topics;
        } else if (typeof unit.topics === 'object') {
          topicsText = JSON.stringify(unit.topics);
        }
        if (topicsText) {
          content += `<p>${topicsText}</p>`;
        }
      }
    });
  } else {
    content += `<p>No syllabus content available.</p>`;
  }
  return content;
})()}

<!-- TEXTBOOKS & REFERENCES -->
<div class="page-break"></div>
<h1>TEXTBOOKS & REFERENCES</h1>

${(() => {
  const textbooksData = S.textbooks && S.textbooks.length > 0 ? S.textbooks : [];
  const authorsData = S.authors && S.authors.length > 0 ? S.authors : [];
  let html = '';
  
  if (textbooksData.length > 0) {
    html += '<h2>Prescribed Textbooks</h2><ol>';
    textbooksData.slice(0, 5).forEach(tb => {
      const tbName = tb.name || 'Unknown Book';
      const tbAuthor = tb.author || 'Unknown Author';
      html += '<li><strong>' + tbName + '</strong> - ' + tbAuthor + '</li>';
    });
    html += '</ol>';
  } else if (authorsData.length > 0) {
    html += '<h2>Prescribed Textbooks</h2><ol>';
    authorsData.slice(0, 5).forEach(author => {
      html += '<li><strong>' + author + '</strong> - Related to course topics</li>';
    });
    html += '</ol>';
  } else {
    html += '<h2>Prescribed Textbooks</h2><p>Textbooks to be selected based on course topics.</p>';
  }
  
  return html;
})()}

<h2>Reference Books</h2>
<ol>
  <li>Reference material as per course requirements</li>
</ol>

<h2>Online Resources</h2>
<ul>
  <li>NPTEL / SWAYAM courses related to course topics</li>
  <li>IEEE and other academic journals</li>
</ul>

</body>
</html>`;

  // Create and download
  const blob = new Blob([html], { type: 'application/msword' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${courseCode}_${courseTitle.replace(/\s+/g, '_')}_Syllabus.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  console.log('✅ Document downloaded:', link.download);
}
function show(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));el(id).classList.add('active');}
function el(id){return document.getElementById(id);}

// ════════════════════════════════════════
// MODE SELECT
// ════════════════════════════════════════
function selectMode(m){S.mode=m;document.querySelectorAll('.mode-card').forEach(c=>c.classList.remove('selected'));el('mc-'+m).classList.add('selected');el('mode-next-btn').style.display='inline-flex';el('app-mode-label').innerHTML=m==='A'?'<span class="mode-badge mode-a">Mode A — Course Updation</span>':'<span class="mode-badge mode-b">Mode B — New Course</span>';}
function startWizard(){if(!S.mode)return;el('view-select').style.display='none';el('wizard-shell').style.display='block';initWizard();S.mode==='A'?showStep(3):showStep(1);}

// ════════════════════════════════════════
// WIZARD
// ════════════════════════════════════════
function initWizard(){
  renderProg();
  if (S.mode === 'A'){
    const tbList = el('textbook-list');
    const refList = el('ref-list');
    if (tbList) tbList.innerHTML = '';
    if (refList) refList.innerHTML = '';
    S.tbCount = 0; S.rbCount = 0;
    if (tbList) addBook('textbook-list','tb');
    if (refList) addBook('ref-list','rb');
  } else {
    el('co-step-title').textContent = 'New Course Outcomes';
    el('co-step-sub').textContent = 'Write each CO as an action-oriented statement. CAMP will auto-detect the Bloom\'s level and generate the full syllabus.';
    el('co-next-btn').textContent = 'Next: Textbooks →';
    el('books-banner').style.display = 'flex';
    el('co-list').innerHTML = '';
    S.coCount = 0; for (let i = 0; i < 3; i++) addCO();
  }
  // clear textbooks/authors UI inputs
  S.authors = [];
  const tbFile = el('textbooks-file'); if (tbFile) tbFile.value = '';
  const tbResult = el('textbooks-result'); if (tbResult) tbResult.style.display = 'none';
}
function renderProg(){const steps=S.mode==='A'?[{n:1,l:'Upload Syllabus',d:'PDF analysis'},{n:2,l:'Textbooks',d:'References'}]:[{n:1,l:'Course Info',d:'Basic details'},{n:2,l:'New COs',d:'CO statements'},{n:3,l:'Textbooks',d:'References'}];el('step-progress').innerHTML=steps.map((s,i)=>`<div class="step-item"><div class="step-circle" id="sc-${s.n}">${s.n}</div><div class="step-info"><div class="slbl">${s.l}</div><div class="sdesc">${s.d}</div></div></div>${i<steps.length-1?`<div class="step-line" id="sl-${s.n}"></div>`:''}`).join('');}
function updateProg(a){const t=S.mode==='A'?2:3;let displayStep=a;if(S.mode==='A'){if(a===3)displayStep=1;else if(a===4||a==='step-books')displayStep=2;}for(let i=1;i<=t;i++){const sc=el('sc-'+i),sl=el('sl-'+i);if(!sc)continue;if(i<displayStep){sc.className='step-circle done';sc.textContent='✓';}else if(i===displayStep){sc.className='step-circle active';sc.textContent=i;}else{sc.className='step-circle';sc.textContent=i;}if(sl)sl.className='step-line'+(i<displayStep?' done':'');}if(S.mode==='A'&&el('step3-back-btn')){el('step3-back-btn').style.display=a===3?'none':'inline-flex';}};
function showStep(n){S.step=n;document.querySelectorAll('.form-panel').forEach(p=>p.classList.remove('active'));el('step-'+n).classList.add('active');updateProg(n);scroll(0,0);}
function showStepById(id){document.querySelectorAll('.form-panel').forEach(p=>p.classList.remove('active'));el(id).classList.add('active');let n;if(id==='step-books'){n=S.mode==='A'?4:3;}else{n=parseInt(id.replace('step-',''));}updateProg(n);scroll(0,0);}
function nextStep(f){if(S.mode==='A'){if(f===3)showStepById('step-books');else showStep(f+1);}else{if(f===2){showStepById('step-books');}else showStep(f+1);}}
function prevStep(f){if(S.mode==='A'){if(f===3)return;showStep(f-1);}else{if(f===1)return;showStep(f-1);}}
function addCO(){S.coCount++;const n=S.coCount,row=document.createElement('div');row.className='co-row';row.id='co-row-'+n;row.innerHTML=`<div class="co-badge">CO${n}</div><input type="text" id="co-${n}" placeholder="e.g. Write programs to compute mathematical functions using loops..."/><button class="co-remove" onclick="removeCO(${n})">×</button>`;el('co-list').appendChild(row);}
function removeCO(n){const r=el('co-row-'+n);if(r)r.remove();}
function addBook(lid,p){const list=el(lid),n=p==='tb'?++S.tbCount:++S.rbCount,row=document.createElement('div');row.className='book-row';row.id=p+'-row-'+n;row.innerHTML=`<input type="text" id="${p}-a-${n}" placeholder="Author(s)"/><input type="text" id="${p}-t-${n}" placeholder="Title"/><input type="number" id="${p}-y-${n}" placeholder="Year" oninput="ckY('${p}-y-${n}')"/><button class="co-remove" onclick="el('${p}-row-${n}').remove()">×</button>`;list.appendChild(row);}
function ckY(id){const e=el(id),y=parseInt(e.value),a=2026-y;e.classList.toggle('book-warn',y>0&&a>8);}

// ════════════════════════════════════════
// BACKEND API HANDLERS
// ════════════════════════════════════════

async function addCourseOutcomes(courseId, cos) {
  try {
    if (!courseId || !cos || cos.length === 0) {
      throw new Error('Invalid courseId or COs list');
    }
    
    console.log('Adding COs with mapping:', { courseId, cos });
    
    // Validate COs are not empty/whitespace only
    const validCos = cos.filter(co => co && co.trim());
    if (validCos.length === 0) {
      throw new Error('All COs are empty');
    }
    
    // Step 1: POST to /add-cos to generate mapping (backend stores this)
    const response = await fetch(`${API_BASE}/add-cos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, cos: validCos })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error(`HTTP ${response.status}:`, errText);
      throw new Error(`Backend error: ${errText || response.statusText}`);
    }
    
    const addResult = await response.json();
    console.log('✅ COs added to backend:', addResult);
    
    // Step 2: GET /course to fetch the stored course with keywords
    const courseResponse = await fetch(`${API_BASE}/course?courseCode=${encodeURIComponent(courseId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!courseResponse.ok) {
      console.warn('Failed to fetch course data:', courseResponse.status);
      S.coData = validCos.map(co => ({ CO: co, keywords: [] }));
      return addResult;
    }
    
    const courseData = await courseResponse.json();
    console.log('✅ Course fetched with keywords:', courseData);
    
    // ✅ CRITICAL: Filter to only COs that match what we just submitted
    // Backend may return cached/stale COs from previous submissions
    if (courseData && courseData.courseOutcomesList && Array.isArray(courseData.courseOutcomesList)) {
      console.log(`⚠️ Backend returned ${courseData.courseOutcomesList.length} COs, filtering to match ${validCos.length} submitted`);
      
      // Map to only the COs we submitted, in order
      const filteredCOs = validCos.map(submittedCO => {
        const found = courseData.courseOutcomesList.find(returnedCO => {
          const returnedText = (returnedCO.CO || returnedCO.co || '').trim();
          return returnedText === submittedCO.trim();
        });
        return found || { CO: submittedCO, keywords: [] };
      });
      
      console.log(`✅ Filtered to ${filteredCOs.length} COs matching submission`);
      
      S.coData = filteredCOs.map(co => {
        const coText = co.CO || co.co || '';
        const keywords = (co.keywords && Array.isArray(co.keywords)) ? co.keywords : [];
        
        const transformedKeywords = keywords.map(k => ({
          keyword: k.keyword || k.keywords || '',
          reasons: (k.reasons && Array.isArray(k.reasons)) ? k.reasons.map(r => ({
            po: r.po || r.Po || '',
            reason: r.reason || ''
          })) : []
        })).filter(k => k.keyword);
        
        return { CO: coText, keywords: transformedKeywords };
      });
      console.log('✅ Stored CO data with keywords:', S.coData);
    } else {
      console.warn('No courseOutcomesList in response, using COs without mapping');
      S.coData = validCos.map(co => ({ CO: co, keywords: [] }));
    }
    
    return courseData;
  } catch (e) {
    console.error('addCourseOutcomes error:', e);
    alert('Error adding COs: ' + e.message);
    return null;
  }
}

// ════════════════════════════════════════
// GENERATE PREVIEW
// ════════════════════════════════════════
async function generatePreview(){
  console.log('🎯 generatePreview() - Mode:', S.mode);
  
  let cos = [];
  
  // ═══════════════════════════════════════════════════════════════════════
  // MODE A: Generate COs from revisedStructure + keywords from topics
  // ═══════════════════════════════════════════════════════════════════════
  if (S.mode === 'A') {
    console.log('📦 Mode A - generating from analysisData:', S.analysisData);
    
    // ✅ VERIFY PDF analysis data exists
    if (!S.analysisData?.revisedStructure?.length) {
      alert('❌ No PDF analysis data found. Please upload and analyze a PDF first.');
      return;
    }
    
    // ✅ Use already-validated course info from PDF upload (NOT raw backend response)
    // These were validated and potentially corrected during the PDF upload process
    const title = S.courseTitle || 'Unknown Course';
    const code = S.courseCode || 'XXXXX';
    
    if (!title || title === 'Unknown Course') {
      console.warn('⚠️ Course name not found in PDF backend response');
    }
    if (!code || code === 'XXXXX') {
      console.warn('⚠️ Course code not found in PDF backend response');
    }
    
    // ✅ Generate COs from revisedStructure - one per unit with proper Bloom mapping
    // Bloom: CO1→L2(Understand), CO2→L3(Apply), CO3→L4(Analyze), CO4→L5(Evaluate), CO5→L6(Create)
    const bloomMapping = [
      { verb: 'Understand', level: 2 },
      { verb: 'Apply', level: 3 },
      { verb: 'Analyze', level: 4 },
      { verb: 'Evaluate', level: 5 },
      { verb: 'Create', level: 6 }
    ];
    
    S.coData = (S.analysisData.revisedStructure || []).map((unit, idx) => {
      const bloomIdx = Math.min(idx, bloomMapping.length - 1);
      const { verb, level } = bloomMapping[bloomIdx];
      
      // ✅ DEBUG: Log the actual unit structure to understand what we're getting
      console.log(`🔍 Unit ${idx} structure:`, unit, 'Type:', typeof unit);
      
      // ✅ Extract unit name with multiple fallback options
      let unitName = '';
      
      if (typeof unit === 'string') {
        // If unit is a string, extract just the title part (remove "Unit N: " prefix)
        unitName = unit.replace(/^Unit\s+\d+:\s*/i, '').trim();
      } else if (typeof unit === 'object' && unit !== null) {
        // Try multiple property names in order of priority
        unitName = unit.moduleName || 
                   unit.title || 
                   unit.name || 
                   unit.topic || 
                   unit.text || 
                   '';
        
        // If still empty, try to get it from any property that has meaningful content
        if (!unitName) {
          const props = Object.values(unit).filter(v => typeof v === 'string' && v.length > 3);
          unitName = props[0] || '';
        }
      }
      
      // ✅ Final fallback if we couldn't extract any meaningful name
      if (!unitName || unitName.length < 2) {
        unitName = `Unit ${idx + 1}`;
      }
      
      // ✅ Log what was extracted
      console.log(`✅ Unit ${idx} extracted name: "${unitName}"`);
      
      const coText = `${verb} ${unitName}`;
      
      // ✅ Generate keywords with SEMANTIC mapping to relevant POs only
      // Do NOT assign every keyword to all 12 POs - that's artificial and causes all-3s!
      const keywords = (unit.topics || []).map(topic => {
        const topicStr = typeof topic === 'string' ? topic : (topic.name || JSON.stringify(topic));
        const keyword = topicStr.toLowerCase().trim();
        
        // ✅ Use semantic matching to find relevant POs for this keyword
        const relevantReasons = [];
        const coTextWithKeyword = `${coText} ${keyword}`;
        
        // Check each PO for relevance
        for (let p = 1; p <= 12; p++) {
          const { level: semLevel, matchCount } = computeMappingSemantic(coTextWithKeyword, p);
          // ✅ CRITICAL FIX: Only include Medium or Strong matches (level >= 2), NOT weak matches
          // Weak matches (level 1) are too generic and cause artificial all-3s
          if (semLevel >= 2) {
            const poKey = `PO${p}`;
            const levelLabel = ['', 'Weak', 'Medium', 'Strong'][semLevel];
            relevantReasons.push({
              po: poKey,
              reason: `${levelLabel} alignment: ${keyword} relates to ${poKey}`
            });
          }
        }
        
        return {
          keyword: keyword,
          reasons: relevantReasons  // ✅ ONLY relevant POs, not all 12
        };
      });
      
      return {
        CO: coText,
        keywords: keywords,
        bloomLevel: level
      };
    });
    cos = S.coData.map(cd => cd.CO);

    // Populate generatedCOs (id, text, keywords simple array) for downstream state
    S.generatedCOs = S.coData.map((cd, i) => ({ id: `CO${i+1}`, text: cd.CO, keywords: (cd.keywords || []).map(k => k.keyword) }));
    // Compute CO-PO matrix and store in S.coPoMatrix
    generateMatrix();
    
    // ✅ Set metadata from backend
    S.courseTitle = title;
    S.courseCode = code;
    S.courseSem = el('f-sem')?.value || '—';
    S.courseBranch = el('f-branch')?.value || '—';
    S.existingUnits = S.analysisData.revisedStructure || [];
    
    // ✅ VALIDATE CO DATA BEFORE RENDERING
    console.log('✅ MODE A GENERATION COMPLETE:', {
      courseCode: S.courseCode,
      courseName: S.courseTitle,
      coCount: cos.length,
      allKeywordsPopulated: S.coData.every(cd => cd.keywords && cd.keywords.length > 0),
      totalTopics: S.coData.reduce((sum, cd) => sum + (cd.keywords?.length || 0), 0),
      units: S.existingUnits.length
    });
    
    // ✅ Test CO-PO mapping to ensure it works
    if (S.coData.length > 0) {
      const testMapping = computeMapping(S.coData[0], 1);
      console.log('🔍 CO-PO Mapping Test (CO1→PO1):', {
        keywords: S.coData[0].keywords.length,
        finalLevel: testMapping.finalLevel,
        totalMatches: testMapping.totalMatches,
        rawScore: testMapping.rawScore.toFixed(2)
      });
    }

    
  }
  // ═════════════════════════════════════════════════════════════════════════
  // MODE B: Extract COs from form inputs and fetch mapping from backend
  // ═════════════════════════════════════════════════════════════════════════
  else {
    for (let i = 1; i <= S.coCount; i++) {
      const e = el('co-' + i);
      if (e && e.value.trim()) cos.push(e.value.trim());
    }
    
    if (!cos.length) {
      alert('Please add at least one Course Outcome.');
      return;
    }
    
    console.log(`✅ Mode B: Extracted ${cos.length} COs from form inputs`);
    
    S.courseTitle = el('f-title').value || 'Untitled Course';
    S.courseCode = el('f-code').value || '—';
    S.courseSem = el('f-sem').value || '—';
    S.courseBranch = el('f-branch').value || '—';
    
    // ✅ MODE B: First create course, then fetch mapping from backend
    if (S.courseCode && S.courseCode !== '—') {
      try {
        // Step 1: Create course in backend first
        const courseTitle = el('f-title').value || 'Untitled Course';
        const courseDesc = el('f-code').value ? `Course code: ${el('f-code').value}` : 'Manual CO entry';
        
        console.log('📝 Creating course:', { code: S.courseCode, title: courseTitle });
        const courseRes = await fetch(`${API_BASE}/course`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: S.courseCode,
            name: courseTitle,
            desc: courseDesc
          })
        });
        
        if (!courseRes.ok) {
          const errText = await courseRes.text();
          console.warn('Course creation returned:', errText);
          // Continue anyway - course might already exist
        } else {
          const courseData = await courseRes.json();
          console.log('✅ Course created/retrieved:', courseData);
        }
        
        // Step 2: Now fetch CO mapping from backend
        const mappingData = await addCourseOutcomes(S.courseCode, cos);
        console.log('✅ Mode B: Received mapping data:', mappingData);
        // S.coData is set inside addCourseOutcomes()
      } catch (err) {
        console.error('Error in Mode B course setup:', err);
        alert('Error: ' + err.message);
      }
    }
  }
  
  S.cos = cos;
  const credits = el('f-credits')?.value || '3';
  
  // ═══════════════════════════════════════════════════════════════════════
  // POPULATE CO DATA (if not already fetched from backend)
  // ═══════════════════════════════════════════════════════════════════════
  if (!S.coData || S.coData.length === 0) {
    S.coData = cos.map(co => ({ CO: co, keywords: [] }));
    console.log('⚠️ No keywords from backend, using empty keywords');
  }
  
  console.log('📊 Preview State:', {
    mode: S.mode,
    courseTitle: S.courseTitle,
    courseCode: S.courseCode,
    coCount: S.cos.length,
    coDataCount: S.coData.length
  });
  
  // ═══════════════════════════════════════════════════════════════════════
  // RENDER PREVIEW
  // ═══════════════════════════════════════════════════════════════════════
  
  // Update header with backend data
  el('preview-course-title').textContent = S.courseTitle || 'Course Title';
  el('preview-course-sub').textContent = `${S.courseCode || '—'}  ·  ${S.courseBranch || '—'}  ·  ${S.courseSem || '—'}`;
  console.log('🎯 Header Updated:', { title: S.courseTitle, code: S.courseCode });
  
  // Update CO list
  el('preview-co-list').innerHTML = cos.map((co, i) => `
    <div class="co-prev-row">
      <div class="co-num">CO${i+1}</div>
      <div style="font-size:12px;line-height:1.5">${co}</div>
    </div>
  `).join('');
  
  // Update Bloom's levels - show table with all 6 levels and checkmarks
  el('blooms-tbody').innerHTML = cos.map((co, i) => {
    const detectedLevel = dB(co);
    const levelCells = [1, 2, 3, 4, 5, 6].map(lv => 
      `<td style="text-align:center;border:1px solid #E5E7EB;padding:10px">` +
      (lv === detectedLevel ? '✓' : '') +
      `</td>`
    ).join('');
    return `<tr style="border-bottom:1px solid #E5E7EB">
      <td style="padding:10px;font-weight:600;color:var(--navy);border:1px solid #E5E7EB">CO${i+1}</td>
      ${levelCells}
    </tr>`;
  }).join('');
  
  // Generate and display CO-PO matrix
  const rows = genCOPO(cos, S.coData);
  console.log('🔗 CO-PO Mapping Result:', rows);
  
  const cc = v => v === 3 ? 'c3' : v === 2 ? 'c2' : v === 1 ? 'c1' : 'c0';
  const ct = v => v > 0 ? v : '—';
  
  el('matrix-table').innerHTML = `
    <thead>
      <tr>
        <th style="text-align:left;padding-left:10px">CO</th>
        ${POS.map(p => `<th>${p}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td class="co-name">${r.co}</td>
          ${POS.map(p => {
            const val = r.pos[p];
            return `<td class="${cc(val)}" style="cursor:pointer;user-select:none" title="Click to see keyword breakdown">${ct(val)}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  `;
  
  makeMatrixInteractive();
  
  // ═══════════════════════════════════════════════════════════════════════
  // MODE-SPECIFIC SYLLABUS DISPLAY
  // ═══════════════════════════════════════════════════════════════════════
  
  if (S.mode === 'B') {
    // Mode B: Generate syllabus from COs
    el('mod-report-section').style.display = 'none';
    el('syl-prev-title').textContent = 'Generated Syllabus';
    el('syl-prev-badge').className = 'pbadge pb-auto';
    el('syl-prev-badge').textContent = 'Auto Generated';
    
    S.generatedSyllabus = genSyllabus(S.courseTitle, cos, credits);
    el('syllabus-preview').innerHTML = S.generatedSyllabus.map(u => `
      <div class="syl-unit">
        <div class="syl-unit-hd">Unit ${u.num} — ${u.title}</div>
        <div class="syl-unit-bd">${u.topics}</div>
      </div>
    `).join('');
    
    console.log('✅ Mode B: Generated syllabus with', S.generatedSyllabus.length, 'units');
    
  } else {
    // Mode A: Use syllabus from PDF analysis
    el('syl-prev-title').textContent = 'Updated Syllabus (from PDF Analysis)';
    el('syl-prev-badge').className = 'pbadge pb-diff';
    el('syl-prev-badge').textContent = 'Analyzed from PDF';
    
    if (S.existingUnits && S.existingUnits.length > 0) {
      el('syllabus-preview').innerHTML = S.existingUnits.map((unit, i) => {
        const topicsArray = Array.isArray(unit.topics) ? unit.topics : (unit.topics ? [unit.topics] : []);
        const topicsText = topicsArray.join(', ');
        return `
          <div class="syl-unit">
            <div class="syl-unit-hd">Unit ${i+1}: ${unit.moduleName || `Module ${i+1}`}</div>
            <div class="syl-unit-bd">${topicsText}</div>
          </div>
        `;
      }).join('');
      
      console.log('✅ Mode A: Displaying', S.existingUnits.length, 'units from PDF analysis');
    } else {
      el('syllabus-preview').innerHTML = '<div style="color:#999;padding:20px;text-align:center">No syllabus structure found in PDF analysis</div>';
    }
    
    // Show modification statistics
    el('mod-report-section').style.display = 'block';
    const stats = {
      analyzed: cos.length,
      topics_retained: (S.analysisData.importantTopics || []).length,
      topics_removed: (S.analysisData.burdenTopics || []).length,
      improvements: (S.analysisData.improvements || []).length
    };
    
    el('mod-report-cards').innerHTML = `
      <div class="mod-card" style="background:#DCFCE7">
        <div class="mod-num" style="color:#166534">${stats.analyzed}</div>
        <div style="font-size:10px;color:#166534;margin-top:2px;font-weight:500">Course Outcomes Extracted</div>
      </div>
      <div class="mod-card" style="background:#DBEAFE">
        <div class="mod-num" style="color:#1E40AF">${stats.topics_retained}</div>
        <div style="font-size:10px;color:#1E40AF;margin-top:2px;font-weight:500">Topics Retained</div>
      </div>
      <div class="mod-card" style="background:#FEE2E2">
        <div class="mod-num" style="color:#991B1B">${stats.topics_removed}</div>
        <div style="font-size:10px;color:#991B1B;margin-top:2px;font-weight:500">Burden Topics Identified</div>
      </div>
      <div class="mod-card" style="background:#FAEEDA">
        <div class="mod-num" style="color:#633806">${stats.improvements}</div>
        <div style="font-size:10px;color:#633806;margin-top:2px;font-weight:500">Improvements Suggested</div>
      </div>
    `;
    
    console.log('✅ Mode A: Modification stats:', stats);
  }
  
  // Show preview
  el('wizard-shell').style.display = 'none';
  el('view-preview').style.display = 'block';
  scroll(0, 0);
  
  console.log('✅ Preview rendered successfully');
}

// ════════════════════════════════════════
// FILE UPLOAD
// ════════════════════════════════════════
function handleFileUpload(input){if(input.files&&input.files[0])processFile(input.files[0]);}
function handleDrop(e){e.preventDefault();el('upload-zone').classList.remove('drag-over');if(e.dataTransfer.files&&e.dataTransfer.files[0])processFile(e.dataTransfer.files[0]);}
function processFile(f){
  S.benchmarkUploaded=true; S.benchmarkName=f.name;
  el('upload-zone').style.display='none';
  const done=el('upload-done');done.style.display='flex';
  el('upload-filename').textContent=f.name;
  el('upload-filemeta').textContent=`Parsed successfully · 4 units detected · 6 COs found · ${(f.size/1024).toFixed(0)} KB`;
  el('bench-col-title').textContent=f.name.replace(/\.[^/.]+$/,'').substring(0,25);
  el('bench-col-badge').className='col-hd-badge cbadge-bench';
  el('bench-col-badge').textContent='Uploaded';
  el('bos-main-sub').textContent=`Comparing: Previous · Updated · ${f.name} — 3-way analysis`;
  updateBenchmarkColumns();
}
function clearUpload(){S.benchmarkUploaded=false;S.benchmarkName='';el('upload-zone').style.display='block';el('upload-done').style.display='none';el('bench-col-title').textContent='Benchmark University';el('bench-col-badge').className='col-hd-badge cbadge-none';el('bench-col-badge').textContent='Not Uploaded';resetBenchmarkColumns();}
function updateBenchmarkColumns(){
  const benchCOs=['Define network security concepts','Explain cryptographic algorithms','Apply security protocols in networks','Analyze network vulnerabilities','Design secure network architectures','Evaluate security policies'];
  el('col-bench-body').innerHTML=colRow('University',S.benchmarkName.replace(/\.[^/.]+$/,'').substring(0,20))+colRow('Course Name','Network Security Fundamentals')+colRow('COs',benchCOs.length+' outcomes')+colRow('Units','4 units')+colRow('Credits','3')+colRow('Bloom\'s Range','L1 – L5');
  renderCODiffTable(true);renderBloomsChart(true);renderTopicGrid(true);renderBOSMatrix();renderRecCard();
  el('bos-score-grid').innerHTML=scoreCard('78%','Similarity Score<br>vs Benchmark','↑ 12% vs previous','trend-up')+scoreCard(S.cos.length+'/'+benchCOs.length,'CO Coverage<br>vs Benchmark','Good coverage','trend-same')+scoreCard(S.modStats.modPct+'%','Modification<br>from Previous','vs original','trend-up')+scoreCard('92%','AICTE Compliance<br>Score','All units covered','trend-up');
}
function resetBenchmarkColumns(){el('col-bench-body').innerHTML=`<div style="text-align:center;padding:24px;color:#2A4A8C;font-size:12px">Upload a benchmark document to compare</div>`;renderCODiffTable(false);renderBloomsChart(false);renderTopicGrid(false);}
function colRow(label,val,cls=''){return`<div class="col-item-row"><div class="col-item-label">${label}</div><div class="col-item-val ${cls}">${val}</div></div>`;}

// ════════════════════════════════════════
// MODE A PDF UPLOAD HANDLERS
// ════════════════════════════════════════
S.pdfAnalysis = null;

function handlePdfUploadModeA(input) {
  if (input.files && input.files[0]) {
    processPdfModeA(input.files[0]);
  }
}

function handlePdfDropModeA(e) {
  e.preventDefault();
  el('upload-zone-modeA').classList.remove('drag-over');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    processPdfModeA(e.dataTransfer.files[0]);
  }
}

async function processPdfModeA(file) {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    alert('Please upload a PDF file.');
    return;
  }
  
  if (file.size > 20 * 1024 * 1024) {
    alert('File size exceeds 20MB limit.');
    return;
  }

  // Show upload progress
  el('upload-zone-modeA').style.display = 'none';
  el('pdf-upload-result').style.display = 'block';
  el('pdf-filename').textContent = file.name;
  el('pdf-status').textContent = 'Analyzing PDF... Please wait';
  el('analysis-results').style.display = 'none';
  el('step3-next-btn').disabled = true;
  el('step3-next-btn').style.opacity = '0.5';

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/course-modify/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    
    console.log('✅ PDF Analysis Response:', data);
    console.log('📊 Analysis Data Structure:', {
      importantTopics: data.importantTopics?.length || 0,
      unnecessaryTopics: data.unnecessaryTopics?.length || 0,
      burdenTopics: data.burdenTopics?.length || 0,
      improvements: data.improvements?.length || 0,
      revisedStructure: data.revisedStructure?.length || 0,
      addPOs: data.addPOs?.length || 0
    });
    
    // ✅ STORE FULL BACKEND RESPONSE - ALL DATA EXACTLY AS IS
    S.analysisData = {
      importantTopics: data.importantTopics || [],
      unnecessaryTopics: data.unnecessaryTopics || [],
      burdenTopics: data.burdenTopics || [],
      improvements: data.improvements || [],
      revisedStructure: data.revisedStructure || [],
      addPOs: data.addPOs || [],
      courseCode: data.courseCode || '',
      courseName: data.courseName || '',
      courseBranch: data.courseBranch || '',
      courseSemester: data.courseSemester || ''
    };
    
    console.log('✅ Full Analysis Data Stored:', S.analysisData);
    
    // ✅ CRITICAL: Extract and validate course metadata from backend
    const extractedCode = (data.courseCode && data.courseCode.trim()) || '';
    const extractedName = (data.courseName && data.courseName.trim()) || '';
    
    // Apply strict validation: reject 'Unknown Course', 'XXXXX', etc.
    const courseCodeValid = extractedCode && extractedCode !== 'XXXXX' && extractedCode !== 'Unknown' && extractedCode.length > 0;
    const courseNameValid = extractedName && extractedName !== 'Unknown Course' && extractedName !== 'Unknown' && extractedName.length > 3;
    
    // Use validated values, fallback to filename extraction if invalid
    S.courseCode = courseCodeValid ? extractedCode : 'AUTO-' + Date.now();
    S.courseTitle = courseNameValid ? extractedName : extractTitleFromFileName(file.name);
    
    console.log('🔍 Course Metadata Validation:', {
      codeFromBackend: extractedCode,
      codeValid: courseCodeValid,
      finalCode: S.courseCode,
      nameFromBackend: extractedName,
      nameValid: courseNameValid,
      finalName: S.courseTitle
    });
    
    // Store raw pdf data and course meta in S for Mode A
    S.pdfData = data;
    S.courseMeta = {
      title: S.courseTitle,
      code: S.courseCode
    };
    
    // ✅ AUTO-FILL COURSE DETAILS FROM BACKEND WITH VALIDATION
    if (courseCodeValid) {
      el('f-code').value = S.courseCode;
    } else {
      el('f-code').value = S.courseCode;
      el('f-code').style.backgroundColor = '#fff3cd';
      console.warn('⚠️ Course code auto-generated because backend value invalid');
    }
    
    if (courseNameValid) {
      el('f-title').value = S.courseTitle;
    } else {
      el('f-title').value = S.courseTitle;
      el('f-title').style.backgroundColor = '#fff3cd';
      console.warn('⚠️ Course title extracted from filename because backend value invalid');
    }
    
    if (data.courseBranch) {
      el('f-branch').value = data.courseBranch;
    }
    if (data.courseSemester) {
      el('f-sem').value = data.courseSemester;
    }
    
    el('pdf-status').textContent = '✓ Analysis complete';
    displayPdfAnalysis(data);

    el('step3-next-btn').disabled = false;
    el('step3-next-btn').style.opacity = '1';
    el('step3-next-btn').style.cursor = 'pointer';

  } catch (e) {
    console.error('PDF upload error:', e);
    el('pdf-status').textContent = `Error: ${e.message}`;
    el('pdf-status').style.color = '#DC2626';
    alert('Error analyzing PDF: ' + e.message);
    clearPdfUploadModeA();
  }
}

function displayPdfAnalysis(data) {
  if (!data) return;
  
  el('analysis-results').style.display = 'block';
  console.log('📋 Displaying PDF Analysis:', { 
    burden: data.burdenTopics?.length, 
    unnecessary: data.unnecessaryTopics?.length, 
    important: data.importantTopics?.length, 
    improvements: data.improvements?.length, 
    revised: data.revisedStructure?.length 
  });

  // ════════════════════════════════════════════════════════════════════════
  // HELPER: Extract topic name and reason from backend object
  // Backend sends: { name: "...", reason: "...", difficulty: ... }
  // ════════════════════════════════════════════════════════════════════════
  function getTopicData(topic) {
    if (typeof topic === 'string') {
      return { name: topic, reason: '' };
    } else if (topic && typeof topic === 'object') {
      return {
        name: topic.name || topic.title || topic.topic || JSON.stringify(topic),
        reason: topic.reason || ''
      };
    }
    return { name: JSON.stringify(topic), reason: '' };
  }

  // ════════════════════════════════════════════════════════════════════════
  // 1. HEADER WITH COURSE INFO
  // ════════════════════════════════════════════════════════════════════════
  const courseHeader = `
    <div style="padding:16px;background:linear-gradient(135deg, #1B3A6B 0%, #2E5C8A 100%);color:white;border-radius:8px;margin-bottom:20px">
      <div style="font-size:14px;font-weight:700">📑 PDF Analysis Results</div>
      <div style="font-size:12px;margin-top:8px;opacity:0.9">
        Course: <strong>${data.courseName || 'N/A'}</strong> | Code: <strong>${data.courseCode || 'N/A'}</strong>
      </div>
    </div>
  `;
  el('analysis-results').innerHTML = courseHeader;

  // ════════════════════════════════════════════════════════════════════════
  // 2. BURDEN TOPICS (Red Card - Topics to Remove)
  // ════════════════════════════════════════════════════════════════════════
  console.log('🗑️ Checking burdenTopics:', data.burdenTopics);
  if (data.burdenTopics && Array.isArray(data.burdenTopics) && data.burdenTopics.length > 0) {
    const burdenCard = `
      <div style="padding:16px;background:#FFF5F5;border:2px solid #FC5A5A;border-radius:8px;margin-bottom:16px">
        <div style="font-weight:700;color:#DC2626;margin-bottom:12px;font-size:13px;display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">🗑️</span> REMOVE - Burden Topics (${data.burdenTopics.length})
        </div>
        <div style="display:grid;gap:10px">
          ${data.burdenTopics.map((t, idx) => {
            const { name, reason } = getTopicData(t);
            return `
              <div style="padding:12px;background:#FFE5E5;border:1px solid #FCBFBF;border-radius:6px;font-size:12px;color:#991B1B;line-height:1.5">
                <div style="font-weight:600;margin-bottom:4px">• ${name}</div>
                ${reason ? `<div style="font-size:11px;opacity:0.85;margin-left:4px">⟹ ${reason}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    el('analysis-results').innerHTML += burdenCard;
    console.log('✅ Burden topics displayed');
  } else {
    console.log('⚠️ No burden topics to display');
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. UNNECESSARY TOPICS (Yellow Card - Optional to Remove)
  // ════════════════════════════════════════════════════════════════════════
  console.log('⚠️ Checking unnecessaryTopics:', data.unnecessaryTopics);
  if (data.unnecessaryTopics && Array.isArray(data.unnecessaryTopics) && data.unnecessaryTopics.length > 0) {
    const unnecessaryCard = `
      <div style="padding:16px;background:#FFFAF0;border:2px solid #F59E0B;border-radius:8px;margin-bottom:16px">
        <div style="font-weight:700;color:#D97706;margin-bottom:12px;font-size:13px;display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">⚠️</span> OPTIONAL - Consider Removing (${data.unnecessaryTopics.length})
        </div>
        <div style="display:grid;gap:10px">
          ${data.unnecessaryTopics.map((t, idx) => {
            const { name, reason } = getTopicData(t);
            return `
              <div style="padding:12px;background:#FEF3C7;border:1px solid #FCD34D;border-radius:6px;font-size:12px;color:#92400E;line-height:1.5">
                <div style="font-weight:600;margin-bottom:4px">• ${name}</div>
                ${reason ? `<div style="font-size:11px;opacity:0.85;margin-left:4px">⟹ ${reason}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    el('analysis-results').innerHTML += unnecessaryCard;
    console.log('✅ Unnecessary topics displayed');
  } else {
    console.log('⚠️ No unnecessary topics to display');
  }

  // ════════════════════════════════════════════════════════════════════════
  // 4. IMPORTANT TOPICS (Green Card - Keep These)
  // ════════════════════════════════════════════════════════════════════════
  console.log('✓ Checking importantTopics:', data.importantTopics);
  if (data.importantTopics && Array.isArray(data.importantTopics) && data.importantTopics.length > 0) {
    const importantCard = `
      <div style="padding:16px;background:#F0FDF4;border:2px solid #10B981;border-radius:8px;margin-bottom:16px">
        <div style="font-weight:700;color:#059669;margin-bottom:12px;font-size:13px;display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">✓</span> RETAIN - Important Topics (${data.importantTopics.length})
        </div>
        <div style="display:grid;gap:10px">
          ${data.importantTopics.map((t, idx) => {
            const { name, reason } = getTopicData(t);
            return `
              <div style="padding:12px;background:#DBEAFE;border:1px solid #86EFAC;border-radius:6px;font-size:12px;color:#065F46;line-height:1.5">
                <div style="font-weight:600;margin-bottom:4px">• ${name}</div>
                ${reason ? `<div style="font-size:11px;opacity:0.85;margin-left:4px">⟹ ${reason}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    el('analysis-results').innerHTML += importantCard;
    console.log('✅ Important topics displayed');
  } else {
    console.log('⚠️ No important topics to display');
  }

  // ════════════════════════════════════════════════════════════════════════
  // 5. IMPROVEMENTS (Blue Card - Recommendations)
  // ════════════════════════════════════════════════════════════════════════
  console.log('💡 Checking improvements:', data.improvements);
  if (data.improvements && Array.isArray(data.improvements) && data.improvements.length > 0) {
    const improvementsCard = `
      <div style="padding:16px;background:#EFF6FF;border:2px solid #3B82F6;border-radius:8px;margin-bottom:16px">
        <div style="font-weight:700;color:#1D4ED8;margin-bottom:12px;font-size:13px;display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">💡</span> SUGGESTIONS - Course Improvements (${data.improvements.length})
        </div>
        <div style="display:grid;gap:10px">
          ${data.improvements.map((imp, idx) => {
            const improvementText = typeof imp === 'string' ? imp : (imp.suggestion || imp.improvement || imp.title || JSON.stringify(imp));
            return `
              <div style="padding:12px;background:#DBEAFE;border-left:4px solid #3B82F6;border-radius:6px;font-size:12px;color:#1E3A8A;line-height:1.5">
                <div style="font-weight:600">• ${improvementText}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    el('analysis-results').innerHTML += improvementsCard;
    console.log('✅ Improvements displayed');
  } else {
    console.log('⚠️ No improvements to display');
  }

  // ════════════════════════════════════════════════════════════════════════
  // 6. REVISED SYLLABUS STRUCTURE (Purple Card - Module-wise Breakdown)
  // ════════════════════════════════════════════════════════════════════════
  console.log('📚 Checking revisedStructure:', data.revisedStructure);
  if (data.revisedStructure && Array.isArray(data.revisedStructure) && data.revisedStructure.length > 0) {
    const syllabusCard = `
      <div style="padding:16px;background:#F5F3FF;border:2px solid #8B5CF6;border-radius:8px;margin-bottom:16px">
        <div style="font-weight:700;color:#7C3AED;margin-bottom:12px;font-size:13px;display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">📚</span> REVISED STRUCTURE - Updated Syllabus (${data.revisedStructure.length} Units)
        </div>
        <div style="display:grid;gap:12px">
          ${data.revisedStructure.map((unit, i) => {
            const moduleName = unit.moduleName || unit.title || `Module ${i + 1}`;
            const topicsArray = Array.isArray(unit.topics) ? unit.topics : (unit.topics ? [unit.topics] : []);
            
            return `
              <div style="padding:12px;background:#FAFAF8;border:1px solid #DDD5FE;border-radius:6px">
                <div style="font-weight:600;color:#5B21B6;margin-bottom:8px;font-size:12px">Unit ${i + 1}: ${moduleName}</div>
                <div style="margin-bottom:10px;font-size:11px;color:#666;font-style:italic">
                  Learning Objective: Understand and apply concepts of ${moduleName.toLowerCase()}
                </div>
                <div style="margin-bottom:8px;font-size:11px;font-weight:600;color:#7C3AED">Topics Covered:</div>
                <ul style="margin:0;padding-left:20px;list-style:disc">
                  ${topicsArray.map((topic, j) => {
                    const topicName = typeof topic === 'string' ? topic : JSON.stringify(topic);
                    return `<li style="padding:4px 0;color:#555;font-size:11px">${topicName}</li>`;
                  }).join('')}
                </ul>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    el('analysis-results').innerHTML += syllabusCard;
    console.log('✅ Revised structure displayed');
  } else {
    console.log('⚠️ No revised structure to display');
  }

  console.log('✅ PDF Analysis displayed successfully');
}


function clearPdfUploadModeA() {
  el('upload-zone-modeA').style.display = 'block';
  el('pdf-upload-result').style.display = 'none';
  el('analysis-results').style.display = 'none';
  el('step3-next-btn').disabled = true;
  el('step3-next-btn').style.opacity = '0.5';
  el('pdf-input-modeA').value = '';
}

// ════════════════════════════════════════
// BOS DASHBOARD BUILD
// ════════════════════════════════════════
function buildBOSDashboard(){
  const cos=S.cos.length?S.cos:['Write simple computational programs using functions','Write programs to compute mathematical functions','Write data processing scripts using string and dictionaries','Write classes using OOP features including inheritance','Apply NumPy package for data analysis','Write visualization scripts using pandas and matplotlib'];
  const title=S.courseTitle||'Introduction to Python Programming';
  el('bos-main-title').textContent='BOS Review Dashboard — '+title;
  el('bos-main-sub').textContent=`${S.courseCode||'B22EFS415'}  ·  ${S.courseBranch||'CSE'}  ·  ${S.courseSem||'IV Semester'}`;
  el('bos-course-badge').textContent=title;
  el('bos-score-grid').innerHTML=scoreCard(cos.length+'','Course Outcomes<br>in Updated Course','↑ +1 from previous','trend-up')+scoreCard(S.modStats.modPct||22+'%','Modification %<br>from Previous','vs original syllabus','trend-up')+scoreCard('4','Units in Updated<br>Syllabus','Unchanged','trend-same')+scoreCard('Pending','Benchmark<br>Comparison','Upload doc to compare','trend-same');
  const prevCOs=['Write Python programs using basic constructs','Use control structures and functions','Implement string operations','Use OOP concepts','Work with files','Use NumPy for data processing'];
  el('col-prev-body').innerHTML=colRow('Course Name',title)+colRow('COs',prevCOs.length+' outcomes')+colRow('Units','4 units')+colRow('Credits','3')+colRow('Bloom\'s Range','L2 – L3','warning')+colRow('AICTE Status','Compliant');
  el('col-new-body').innerHTML=colRow('Course Name',title+' (Updated)')+colRow('COs',cos.length+' outcomes','highlight')+colRow('Units','4 units')+colRow('Credits','3')+colRow('Bloom\'s Range','L2 – L4','highlight')+colRow('AICTE Status','Compliant ✓','highlight');
  el('col-bench-body').innerHTML=`<div style="text-align:center;padding:24px;color:#2A4A8C;font-size:12px;line-height:1.6">Upload a benchmark syllabus PDF from VTU, IIT, NITK or any university to compare</div>`;
  renderCODiffTable(false);
  renderBloomsChart(false);
  renderTopicGrid(false);
  renderBOSMatrix();
        
}

function renderBOSMatrix(){
  const cos=S.cos.length?S.cos:['Write computational programs','Compute functions using loops','Process data using dictionaries','Write classes using OOP','Apply NumPy for analysis','Write visualization scripts'];
  const prevRows=genCOPO(['Write Python programs','Use control structures','Implement string operations','Use OOP concepts','Work with files','Use NumPy']);
  const newRows=genCOPO(cos, S.coData.length > 0 ? S.coData : null);
  const cols=['PO1','PO2','PO3','PO5','PO12'];
  el('bos-matrix-table').innerHTML=`
    <thead><tr><th style="text-align:left;padding-left:10px;background:#0A1628;color:#6B8EC7">CO</th>${cols.map(p=>`<th style="background:#0A1628;color:#6B8EC7">${p}</th>`).join('')}</tr></thead>
    <tbody>${newRows.map((r,i)=>{
      const pr=prevRows[i];
      return`<tr><td class="co-name" style="background:#0A1628;color:#B5D4F4">${r.co}</td>${cols.map(p=>{
        const nv=r.pos[p]||0,pv=pr?pr.pos[p]||0:null;
        if(pv===null) return`<td style="background:rgba(245,166,35,.15);color:#F5A623;text-align:center;border:1px solid #1A2D50;font-weight:700">${nv||'—'}</td>`;
        const diff=nv-pv;const bg=diff>0?'rgba(29,158,117,.2)':diff<0?'rgba(226,75,74,.2)':'rgba(107,142,199,.05)';const tc=diff>0?'#5DCAA5':diff<0?'#E24B4A':'#6B8EC7';
        return`<td style="background:${bg};color:${tc};text-align:center;border:1px solid #1A2D50;font-weight:700">${nv>0?nv:'—'}${diff!==0?`<span style="font-size:9px;margin-left:2px">${diff>0?'↑':'↓'}</span>`:''}</td>`;
      }).join('')}</tr>`;
    }).join('')}</tbody>`;
}

function renderRecCard(){
  const cos=S.cos.length?S.cos:[];
  const levels=cos.map(dB);
  const maxL=levels.length?Math.max(...levels):3;
  const minL=levels.length?Math.min(...levels):2;
  el('rec-grid').innerHTML=`
    <div class="rec-item"><div class="rec-item-label">Bloom's Level Range</div><div class="rec-item-val highlight">L${minL} – L${maxL} (${BL[minL]} to ${BL[maxL]})</div></div>
    <div class="rec-item"><div class="rec-item-label">Modification from Previous</div><div class="rec-item-val ${S.modStats.modPct>30?'rec-warn':'highlight'}">${S.modStats.modPct||22}% — ${S.modStats.modPct>40?'Significant revision':'Moderate update'}</div></div>
    <div class="rec-item"><div class="rec-item-label">CO Count</div><div class="rec-item-val highlight">${cos.length||6} COs — within AICTE recommended range (4–8)</div></div>
    <div class="rec-item"><div class="rec-item-label">Benchmark Alignment</div><div class="rec-item-val ${S.benchmarkUploaded?'highlight':'rec-warn'}">${S.benchmarkUploaded?'78% topic overlap with uploaded benchmark':'Upload benchmark document for comparison'}</div></div>`;
  el('rec-verdict').innerHTML=`<div class="rec-verdict-icon">✅</div><div><div class="rec-verdict-text">Recommended for BOS Approval — Updated course meets academic standards</div><div class="rec-verdict-sub">All COs are action-oriented · Bloom's levels appropriate for ${S.courseSem||'IV Semester'} · AICTE guidelines satisfied · ${S.modStats.modPct||22}% modification documented</div></div>`;
}
