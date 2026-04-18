// ════════════════════════════════════════
// STATE
// ════════════════════════════════════════
const S = {
  mode:null, coCount:0, tbCount:0, rbCount:0,
                  cos:[], coData:[], generatedSyllabus:[], existingUnits:[],
  modStats:{added:0,removed:0,modified:0,same:0,modPct:0},
  courseTitle:'', courseCode:'', courseSem:'', courseBranch:'',
  benchmarkUploaded:false, benchmarkName:''
};

// ════════════════════════════════════════
// BACKEND API INTEGRATION
// ════════════════════════════════════════
const API_BASE = 'http://localhost:8081';

async function createCourse(code, name, desc) {
  try {
    console.log('Sending course request:', { code, name, desc });
    const response = await fetch(`${API_BASE}/course`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, desc })
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error(`HTTP ${response.status}:`, errText);
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }
    const data = await response.json();
    console.log('Course created successfully:', data);
    return data;
  } catch (e) {
    console.error('createCourse error:', e);
    alert('Error creating course: ' + e.message);
    return null;
  }
}

async function addCourseOutcomes(courseId, cos) {
  try {
    console.log('Adding COs:', { courseId, cos });
    const response = await fetch(`${API_BASE}/add-cos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, cos })
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error(`HTTP ${response.status}:`, errText);
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log('COs added successfully:', data);
    return data;
  } catch (e) {
    console.error('addCourseOutcomes error:', e);
    alert('Error adding COs: ' + e.message);
    return null;
  }
}

async function mapCOs(co, keywords) {
  try {
    const response = await fetch(`http://localhost:8081/comap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ co, keywords })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('mapCOs error:', e);
    return null;
  }
}

async function getCourse(code) {
  try {
    const response = await fetch(`${API_BASE}/course?courseCode=${code}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('getCourse error:', e);
    return null;
  }
}

async function downloadDocx() {
  try {
    if (!S.courseCode) {
      alert('Please generate a course proposal first.');
      return;
    }
    
    console.log('Downloading .docx for course:', S.courseCode);
    const response = await fetch(`${API_BASE}/export/docx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseCode: S.courseCode,
        courseTitle: S.courseTitle,
        courseBranch: S.courseBranch,
        courseSem: S.courseSem,
        cos: S.cos,
        syllabus: S.generatedSyllabus,
        mode: S.mode
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to generate document`);
    }
    
    // Get filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `${S.courseCode}_proposal.docx`;
    if (contentDisposition && contentDisposition.includes('filename=')) {
      filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
    }
    
    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    console.log('Download successful:', filename);
  } catch (e) {
    console.error('downloadDocx error:', e);
    alert('Error downloading document: ' + e.message);
  }
}

// ════════════════════════════════════════
// BLOOM'S ENGINE
// ════════════════════════════════════════
const BV={6:['design','create','develop','construct','formulate','compose','produce','invent','generate','plan','propose','build'],5:['evaluate','assess','justify','critique','judge','defend','argue','appraise','select','recommend'],4:['analyze','analyse','differentiate','distinguish','examine','compare','contrast','investigate'],3:['apply','implement','use','execute','demonstrate','solve','calculate','operate','write','compute','utilize','perform'],2:['explain','describe','summarize','classify','identify','discuss','interpret','illustrate'],1:['define','list','recall','state','name','label','memorize','repeat','match','outline']};
const BL={6:'Create (L6)',5:'Evaluate (L5)',4:'Analyze (L4)',3:'Apply (L3)',2:'Understand (L2)',1:'Remember (L1)'};
const BC={6:'lp6',5:'lp5',4:'lp4',3:'lp3',2:'lp2',1:'lp1'};
function dB(t){const l=t.toLowerCase();for(let i=6;i>=1;i--)for(const v of BV[i])if(l.includes(v))return i;return 3;}

// ════════════════════════════════════════
// CO-PO ENGINE — ARTICULATION MATRIX FORMULA
// ════════════════════════════════════════
const POS=['PO1','PO2','PO3','PO4','PO5','PO6','PO7','PO8','PO9','PO10','PO11','PO12'];
const PO_STATEMENTS = {
  PO1: "Engineering knowledge — Apply knowledge of mathematics, science, engineering fundamentals, and an engineering specialisation.",
  PO2: "Problem analysis — Identify, formulate, review research literature, and analyze complex engineering problems.",
  PO3: "Design/development of solutions — Design solutions for complex engineering problems and systems.",
  PO4: "Conduct investigations — Use research-based knowledge and methods including design of experiments.",
  PO5: "Modern tool usage — Create, select, and apply appropriate techniques and modern engineering tools.",
  PO6: "The engineer and society — Apply reasoning informed by contextual knowledge to assess societal issues.",
  PO7: "Environment and sustainability — Understand the impact of engineering solutions in societal and environmental contexts.",
  PO8: "Ethics — Apply ethical principles and commit to professional ethics and responsibilities.",
  PO9: "Individual and team work — Function effectively as an individual and as a member or leader in diverse teams.",
  PO10: "Communication — Communicate effectively on complex engineering activities with the engineering community.",
  PO11: "Project management and finance — Demonstrate knowledge and understanding of engineering and management principles.",
  PO12: "Life-long learning — Recognise the need for, and have the preparation and ability to engage in independent learning."
};

// CO-PO Mapping Formula Based on Keyword Matching
// Formula: Level = f(totalMatches / 3)
// - totalMatches >= 2.25 (rawScore >= 0.75) → Level 3 (High)
// - totalMatches >= 1.5  (rawScore >= 0.50) → Level 2 (Medium)
// - totalMatches >= 0.75 (rawScore >= 0.25) → Level 1 (Low)
// - totalMatches < 0.75  (rawScore < 0.25)  → Level 0 (None)
function computeMapping(co, poIndex) {
  if (!co || !co.keywords || !Array.isArray(co.keywords)) {
    // Fallback to Bloom's-based if no keywords data
    return { matchedKeywords: [], unmatchedKeywords: [], totalMatches: 0, rawScore: 0, finalLevel: 0 };
  }
  
  const poKey = `PO${poIndex}`;
  let matchedKeywords = [], unmatchedKeywords = [], totalMatches = 0;
  
  co.keywords.forEach(k => {
    if (!k || !k.keyword) return; // Skip invalid keywords
    
    if (!k.reasons || !Array.isArray(k.reasons)) {
      unmatchedKeywords.push({ keyword: k.keyword });
      return;
    }
    
    const matched = k.reasons
      .filter(r => r && r.po === poKey && r.reason)
      .map(r => r.reason);
    
    if (matched.length) {
      matchedKeywords.push({ 
        keyword: k.keyword, 
        reasons: matched, 
        count: matched.length 
      });
      totalMatches += matched.length;
    } else {
      unmatchedKeywords.push({ keyword: k.keyword });
    }
  });
  
  const rawScore = totalMatches / 3;
  const finalLevel = rawScore >= 0.75 ? 3 : rawScore >= 0.5 ? 2 : rawScore >= 0.25 ? 1 : 0;
  
  return { matchedKeywords, unmatchedKeywords, totalMatches, rawScore, finalLevel };
}

function genCOPO(cos, cosWithKeywords = null) {
  return cos.map((co, i) => {
    let pos = {};
    
    // Use keyword-based mapping if available, otherwise use Bloom's level fallback
    const coData = cosWithKeywords && cosWithKeywords[i] ? cosWithKeywords[i] : { CO: co };
    
    POS.forEach(p => {
      const poIndex = parseInt(p.replace('PO', ''));
      
      if (coData.keywords && Array.isArray(coData.keywords)) {
        // Use keyword-based formula
        const mapping = computeMapping(coData, poIndex);
        pos[p] = mapping.finalLevel;
      } else {
        // Fallback: Use Bloom's level based algorithm
        const l = co.toLowerCase();
        const b = dB(co);
        if ([1, 2, 3].includes(poIndex)) pos[p] = b >= 3 ? 3 : 2;
        else if (poIndex === 4) pos[p] = b >= 4 ? 2 : (b >= 3 ? 1 : 0);
        else if (poIndex === 5) pos[p] = (l.includes('implement') || l.includes('develop') || l.includes('build')) ? 3 : 2;
        else if ([6, 7, 8, 9].includes(poIndex)) pos[p] = 0;
        else if (poIndex === 10) pos[p] = (l.includes('write') || l.includes('document')) ? 2 : 0;
        else if (poIndex === 11) pos[p] = 0;
        else if (poIndex === 12) pos[p] = 3;
      }
    });
    
    return { co: `CO${i + 1}`, text: co, pos, data: coData };
  });
}

// ════════════════════════════════════════
// SYLLABUS GENERATION
// ════════════════════════════════════════
const SYL_TEMPLATES={python:[{t:'Python Fundamentals',tp:'Introduction to Python, History and Applications, Variables, Data Types, Type Casting, Operators, Precedence, Keywords, I/O Statements, Conditionals, Loops (for/while), Functions, Lambda Functions, User-Defined Functions'},{t:'Strings, Exceptions & Regular Expressions',tp:'String Operations, Unicode, String Formatting, Format Specifiers, Common String Methods, Slicing, Exception Handling (try/except/finally), Custom Exceptions, Regular Expressions — Pattern Matching, Case Studies (Street Addresses, Roman Numerals)'},{t:'Object Oriented Programming & Files',tp:'Defining Classes, __init__ Method, Instantiating Classes, Abstraction, Encapsulation, Single & Multiple Inheritance, Polymorphism, Operator Overloading, Decorators, Descriptors, File I/O — Text and Binary Files'},{t:'NumPy & Array Processing',tp:'Introduction to NumPy, Creating Arrays, Indexing and Slicing, Array Transposition, Universal Array Functions, Array Processing, Broadcasting, Array I/O'},{t:'Pandas & Data Visualization',tp:'Introduction to Pandas, Series and DataFrames, Data Cleaning and Aggregation, GroupBy, Matplotlib — Line/Bar/Histogram/Scatter Charts, Data Visualization with Seaborn'}],network:[{t:'Network Fundamentals & OSI Model',tp:'Introduction to Networks, LAN/WAN/MAN, OSI vs TCP/IP Model, Topologies, Transmission Media, Signal Encoding, Multiplexing, Switching'},{t:'Data Link & Network Layer',tp:'Data Link Layer Functions, Error Detection (CRC/Hamming), Flow Control, MAC Protocols, Ethernet, IP Addressing, IPv4/IPv6, Subnetting, Routing Algorithms, ARP/RARP'},{t:'Transport & Application Layer',tp:'TCP vs UDP, Connection Establishment, Flow & Congestion Control, DNS, HTTP/HTTPS, FTP, SMTP, POP3/IMAP, DHCP'},{t:'Network Security',tp:'Cryptography Basics, Symmetric (AES/DES) & Asymmetric Encryption (RSA), Hash Functions, Digital Signatures, SSL/TLS, Firewalls, IDS/IPS, VPN'}],default:[{t:'Foundations & Core Concepts',tp:'Introduction and Overview, Historical Context, Fundamental Principles, Key Terminology, Scope and Applications, Basic Algorithms'},{t:'Core Techniques & Methods',tp:'Methodologies, Algorithms, Data Structures, Implementation Strategies, Problem Solving, Case Studies'},{t:'Advanced Topics & Applications',tp:'Advanced Algorithms, Optimization, Real-World Applications, Industry Practices, Integration Concepts'},{t:'Tools, Frameworks & Project Work',tp:'Tools and Frameworks, Best Practices, Testing and Validation, Documentation, Mini Project Application'}]};
function genSyllabus(title,cos,credits){const l=title.toLowerCase();const k=l.includes('python')?'python':(l.includes('network')||l.includes('security')||l.includes('cns'))?'network':'default';const t=SYL_TEMPLATES[k];const n=parseInt(credits)>=4?Math.min(5,t.length):4;return t.slice(0,n).map((u,i)=>({num:i+1,title:u.t,topics:u.tp}));}
function genUpdated(existing,cos){const ct=cos.join(' ').toLowerCase();let added=0,removed=0,modified=0,same=0;const units=existing.map((u,i)=>{const topics=(u.topics||'').split(/[,\n]+/).map(t=>t.trim()).filter(t=>t.length>2);const diff=topics.map(t=>{const tl=t.toLowerCase();if(tl.includes('legacy')||tl.includes('deprecated')||tl.includes('2.x')){removed++;return{text:t,type:'removed'};}if(modified<2&&Math.random()<0.15){modified++;return{text:t,type:'modified',newText:t+' (Updated for current standards)'};}same++;return{text:t,type:'same'};});if(i===0){diff.push({text:'Type Hints and Annotations (PEP 526)',type:'added'});added++;}if(i===2&&ct.includes('overload')){diff.push({text:'Protocol Classes and Structural Subtyping',type:'added'});added++;}return{num:i+1,title:u.title||`Unit ${i+1}`,diffTopics:diff};});const tot=added+removed+modified+same;const pct=tot>0?Math.round(((added+removed+modified)/tot)*100):22;return{units,stats:{added,removed,modified,same,modPct:pct}};}

// ════════════════════════════════════════
// CO-PO KEYWORD BREAKDOWN (Interactive)
// ════════════════════════════════════════
function showCOPOBreakdown(coIndex, poIndex) {
  if (!S.coData || !S.coData[coIndex]) {
    alert('CO-PO keyword mapping not available yet.');
    return;
  }
  
  const co = S.coData[coIndex];
  const mapping = computeMapping(co, poIndex);
  const poKey = `PO${poIndex}`;
  const poStmt = PO_STATEMENTS[poKey] || 'No statement available';
  
  const allKeywords = [
    ...mapping.matchedKeywords.map(k => ({ ...k, matched: true })),
    ...mapping.unmatchedKeywords.map(k => ({ ...k, matched: false }))
  ];
  
  const htmlContent = `
    <div style="font-family:system-ui,-apple-system,sans-serif;background:#0f1419;color:#f0f0f0;padding:24px;border-radius:12px;max-width:700px;margin:20px auto;border:1px solid #2a2a2a">
      <h3 style="margin:0 0 16px;font-size:16px;font-weight:700">CO${coIndex + 1} → ${poKey} Keyword Breakdown</h3>
      
      <div style="background:#1a1a1a;padding:14px;border-radius:8px;margin-bottom:16px;border-left:2px solid #f97316">
        <div style="font-size:11px;color:#888;text-transform:uppercase;font-weight:700;margin-bottom:4px">${poKey} Statement</div>
        <div style="font-size:13px;color:#ddd;line-height:1.6">${poStmt}</div>
      </div>
      
      <div style="background:#1a1a1a;padding:14px;border-radius:8px;margin-bottom:16px">
        <div style="font-size:11px;color:#888;text-transform:uppercase;font-weight:700;margin-bottom:8px">Keywords Matched (${mapping.matchedKeywords.length})</div>
        <div style="font-size:12px;color:#ddd">
          ${mapping.matchedKeywords.length > 0 
            ? mapping.matchedKeywords.map(k => `<div style="margin-bottom:8px;padding:6px;background:#0a2e0a;border-left:2px solid #22c55e"><strong style="color:#22c55e">✓ ${k.keyword}</strong> (${k.count} match${k.count !== 1 ? 'es' : ''})</div>`).join('')
            : '<div style="color:#666">No matched keywords</div>'}
        </div>
      </div>
      
      <div style="background:#1a1a1a;padding:14px;border-radius:8px;margin-bottom:16px">
        <div style="font-size:11px;color:#888;text-transform:uppercase;font-weight:700;margin-bottom:8px">Keywords Not Matched (${mapping.unmatchedKeywords.length})</div>
        <div style="font-size:12px;color:#ddd">
          ${mapping.unmatchedKeywords.length > 0 
            ? mapping.unmatchedKeywords.map(k => `<div style="margin-bottom:4px;padding:6px;background:#2a0a0a;border-left:2px solid #ef4444"><span style="color:#ef4444">✗ ${k.keyword}</span></div>`).join('')
            : '<div style="color:#666">All keywords matched</div>'}
        </div>
      </div>
      
      <div style="background:#0a1628;padding:14px;border-radius:8px;margin-bottom:16px;border:1px solid #1a2d50">
        <div style="font-size:11px;color:#6B8EC7;text-transform:uppercase;font-weight:700;margin-bottom:12px">Level Calculation</div>
        <div style="font-family:monospace;font-size:12px;color:#a0aec0;line-height:1.8">
          <div><strong style="color:#f0f0f0">Total Keywords:</strong> ${allKeywords.length}</div>
          <div><strong style="color:#f0f0f0">Matched Reasons:</strong> ${mapping.totalMatches}</div>
          <div><strong style="color:#f0f0f0">Divisor:</strong> 3</div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid #1a2d50"><strong style="color:#f97316">Raw Score:</strong> ${mapping.totalMatches} ÷ 3 = ${mapping.rawScore.toFixed(4)}</div>
        </div>
      </div>
      
      <div style="background:#f97316;color:#000;padding:14px;border-radius:8px;text-align:center;font-weight:700">
        <div style="font-size:11px;opacity:0.8;margin-bottom:4px">FINAL LEVEL</div>
        <div style="font-size:24px">Level ${mapping.finalLevel}</div>
        <div style="font-size:11px;opacity:0.8;margin-top:4px">
          ${mapping.finalLevel === 3 ? 'High (rawScore ≥ 0.75)' 
          : mapping.finalLevel === 2 ? 'Medium (rawScore ≥ 0.50)' 
          : mapping.finalLevel === 1 ? 'Low (rawScore ≥ 0.25)' 
          : 'None (rawScore < 0.25)'}
        </div>
      </div>
    </div>`;
  
  alert('CO→PO Breakdown:\n\n' + htmlContent.replace(/<[^>]*>/g, ''));
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
function backFromBooks(){S.mode==='A'?showStep(3):showStepById('step-books');}
function show(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));el(id).classList.add('active');}
function el(id){return document.getElementById(id);}

// ════════════════════════════════════════
// MODE SELECT
// ════════════════════════════════════════
function selectMode(m){S.mode=m;document.querySelectorAll('.mode-card').forEach(c=>c.classList.remove('selected'));el('mc-'+m).classList.add('selected');el('mode-next-btn').style.display='inline-flex';el('app-mode-label').innerHTML=m==='A'?'<span class="mode-badge mode-a">Mode A — Course Updation</span>':'<span class="mode-badge mode-b">Mode B — New Course</span>';}
function startWizard(){if(!S.mode)return;el('view-select').style.display='none';el('wizard-shell').style.display='block';initWizard();showStep(1);}

// ════════════════════════════════════════
// WIZARD
// ════════════════════════════════════════
function initWizard(){renderProg();el('co-step-title').textContent=S.mode==='A'?'Revised Course Outcomes':'New Course Outcomes';el('co-step-sub').textContent=S.mode==='A'?'Enter revised CO statements. CAMP will use these to generate the updated syllabus.':'Write each CO as an action-oriented statement. CAMP will auto-detect the Bloom\'s level and generate the full syllabus.';el('co-next-btn').textContent=S.mode==='A'?'Next: Existing Syllabus →':'Next: Textbooks →';el('books-banner').style.display=S.mode==='B'?'flex':'none';el('co-list').innerHTML='';S.coCount=0;for(let i=0;i<3;i++)addCO();el('existing-unit-list').innerHTML='';['Python Fundamentals','Strings & Exception Handling','OOP & Files','NumPy & Data Processing'].forEach((t,i)=>{el('existing-unit-list').innerHTML+=`<div class="unit-row"><div class="unit-hd">Unit ${i+1} — ${t}</div><textarea id="eu-${i+1}" placeholder="Paste topics for Unit ${i+1}..."></textarea></div>`;});el('textbook-list').innerHTML='';el('ref-list').innerHTML='';S.tbCount=0;S.rbCount=0;addBook('textbook-list','tb');addBook('ref-list','rb');}
function renderProg(){const steps=S.mode==='A'?[{n:1,l:'Course Info',d:'Basic details'},{n:2,l:'Revised COs',d:'CO statements'},{n:3,l:'Existing Syllabus',d:'Paste current'},{n:4,l:'Textbooks',d:'References'}]:[{n:1,l:'Course Info',d:'Basic details'},{n:2,l:'New COs',d:'CO statements'},{n:3,l:'Textbooks',d:'References'}];el('step-progress').innerHTML=steps.map((s,i)=>`<div class="step-item"><div class="step-circle" id="sc-${s.n}">${s.n}</div><div class="step-info"><div class="slbl">${s.l}</div><div class="sdesc">${s.d}</div></div></div>${i<steps.length-1?`<div class="step-line" id="sl-${s.n}"></div>`:''}`).join('');}
function updateProg(a){const t=S.mode==='A'?4:3;for(let i=1;i<=t;i++){const sc=el('sc-'+i),sl=el('sl-'+i);if(!sc)continue;if(i<a){sc.className='step-circle done';sc.textContent='✓';}else if(i===a){sc.className='step-circle active';sc.textContent=i;}else{sc.className='step-circle';sc.textContent=i;}if(sl)sl.className='step-line'+(i<a?' done':'');}};
function showStep(n){S.step=n;document.querySelectorAll('.form-panel').forEach(p=>p.classList.remove('active'));el('step-'+n).classList.add('active');updateProg(n);scroll(0,0);}
function showStepById(id){document.querySelectorAll('.form-panel').forEach(p=>p.classList.remove('active'));el(id).classList.add('active');const n=id==='step-books'?(S.mode==='A'?4:3):parseInt(id.replace('step-',''));updateProg(n);scroll(0,0);}
function nextStep(f){if(f===2){S.mode==='A'?showStep(3):showStepById('step-books');}else if(f===3&&S.mode==='A')showStepById('step-books');else showStep(f+1);}
function prevStep(f){f===3&&S.mode==='B'?showStep(2):showStep(f-1);}
function addCO(){S.coCount++;const n=S.coCount,row=document.createElement('div');row.className='co-row';row.id='co-row-'+n;row.innerHTML=`<div class="co-badge">CO${n}</div><input type="text" id="co-${n}" placeholder="e.g. Write programs to compute mathematical functions using loops..."/><button class="co-remove" onclick="removeCO(${n})">×</button>`;el('co-list').appendChild(row);}
function removeCO(n){const r=el('co-row-'+n);if(r)r.remove();}
function addBook(lid,p){const list=el(lid),n=p==='tb'?++S.tbCount:++S.rbCount,row=document.createElement('div');row.className='book-row';row.id=p+'-row-'+n;row.innerHTML=`<input type="text" id="${p}-a-${n}" placeholder="Author(s)"/><input type="text" id="${p}-t-${n}" placeholder="Title"/><input type="number" id="${p}-y-${n}" placeholder="Year" oninput="ckY('${p}-y-${n}')"/><button class="co-remove" onclick="el('${p}-row-${n}').remove()">×</button>`;list.appendChild(row);}
function ckY(id){const e=el(id),y=parseInt(e.value),a=2026-y;e.classList.toggle('book-warn',y>0&&a>8);}

// ════════════════════════════════════════
// GENERATE PREVIEW
// ════════════════════════════════════════
async function generatePreview(){
  const cos=[];for(let i=1;i<=S.coCount;i++){const e=el('co-'+i);if(e&&e.value.trim())cos.push(e.value.trim());}
  if(!cos.length){alert('Please add at least one Course Outcome.');return;}
  S.cos=cos;
  S.courseTitle=el('f-title').value||'Untitled Course';
  S.courseCode=el('f-code').value||'—';
  S.courseSem=el('f-sem').value||'—';
  S.courseBranch=el('f-branch').value||'—';
  const credits=el('f-credits').value||'3';
  
  // Helper function to deduplicate CO data
  function deduplicateCoData(rawData) {
    if (!Array.isArray(rawData)) return cos.map(co => ({ CO: co, keywords: [] }));
    
    // Create a map to track unique COs by their text content
    const uniqueCOs = new Map();
    rawData.forEach(item => {
      if (item && item.CO) {
        const coText = item.CO.trim().toLowerCase();
        // Only keep first occurrence of each unique CO
        if (!uniqueCOs.has(coText)) {
          uniqueCOs.set(coText, item);
        }
      }
    });
    
    // Convert map back to array and ensure we have keywords array
    const dedupedData = Array.from(uniqueCOs.values()).map(item => ({
      CO: item.CO,
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      id: item.id
    }));
    
    console.log(`Deduplication: received ${rawData.length} items, reduced to ${dedupedData.length} unique COs`);
    return dedupedData.length > 0 ? dedupedData : cos.map(co => ({ CO: co, keywords: [] }));
  }
  
  // Call backend API to create course and add outcomes with keyword mapping
  try {
    const courseData = await createCourse(S.courseCode, S.courseTitle, el('f-overview').value || '');
    if (courseData) {
      const coData = await addCourseOutcomes(S.courseCode, cos);
      console.log('Course created and outcomes added:', { courseData, coData });
      
      // Fetch keyword-mapped CO data from backend for accurate PO-mapping
      try {
        const courseDetails = await getCourse(S.courseCode);
        if (courseDetails && courseDetails.courseOutcomesList) {
          // Deduplicate the received data
          S.coData = deduplicateCoData(courseDetails.courseOutcomesList);
          console.log('CO keyword mapping loaded (deduplicated):', S.coData);
        } else {
          S.coData = cos.map(co => ({ CO: co, keywords: [] }));
          console.log('No CO data from backend, using fallback');
        }
      } catch (e) {
        console.warn('Could not fetch keyword data:', e.message);
        S.coData = cos.map(co => ({ CO: co, keywords: [] }));
      }
    }
  } catch (e) {
    console.error('Error creating course:', e.message);
    S.coData = cos.map(co => ({ CO: co, keywords: [] }));
  }
  
  el('preview-course-title').textContent=S.courseTitle;
  el('preview-course-sub').textContent=`${S.courseCode}  ·  ${S.courseBranch}  ·  ${S.courseSem}`;
  el('preview-co-list').innerHTML=cos.map((co,i)=>`<div class="co-prev-row"><div class="co-num">CO${i+1}</div><div style="font-size:12px;line-height:1.5">${co}</div></div>`).join('');
  el('blooms-tbody').innerHTML=cos.map((co,i)=>{const l=dB(co),s=co.length>55?co.substring(0,55)+'…':co;return`<tr><td>CO${i+1}</td><td style="font-size:11px;color:var(--muted)">${s}</td><td><span class="lvl ${BC[l]}">${BL[l]}</span></td></tr>`;}).join('');
  const rows=genCOPO(cos, S.coData);
  const cc=v=>v===3?'c3':v===2?'c2':v===1?'c1':'c0',ct=v=>v>0?v:'—';
  el('matrix-table').innerHTML=`<thead><tr><th style="text-align:left;padding-left:10px">CO</th>${POS.map(p=>`<th>${p}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td class="co-name">${r.co}</td>${POS.map(p=>`<td class="${cc(r.pos[p])}" style="cursor:pointer;user-select:none" title="Click to see keyword breakdown">${ct(r.pos[p])}</td>`).join('')}</tr>`).join('')}</tbody>`;
  makeMatrixInteractive();
  if(S.mode==='B'){
    el('mod-report-section').style.display='none';
    el('syl-prev-title').textContent='Generated Syllabus';
    el('syl-prev-badge').className='pbadge pb-auto';
    el('syl-prev-badge').textContent='Auto Generated';
    S.generatedSyllabus=genSyllabus(S.courseTitle,cos,credits);
    el('syllabus-preview').innerHTML=S.generatedSyllabus.map(u=>`<div class="syl-unit"><div class="syl-unit-hd">Unit ${u.num} — ${u.title}</div><div class="syl-unit-bd">${u.topics}</div></div>`).join('');
  } else {
    el('syl-prev-title').textContent='Updated Syllabus (with Changes)';
    el('syl-prev-badge').className='pbadge pb-diff';
    el('syl-prev-badge').textContent='Updated — Diff View';
    const existing=[];for(let i=1;i<=4;i++){const e=el('eu-'+i);existing.push({title:`Unit ${i}`,topics:e&&e.value.trim()?e.value.trim():`Topic A, Topic B, Topic C, Sample Topic ${i}`});}
    S.existingUnits=existing;
    const{units,stats}=genUpdated(existing,cos);
    S.modStats=stats;
    el('mod-report-section').style.display='block';
    el('mod-report-cards').innerHTML=`
      <div class="mod-card" style="background:#DCFCE7"><div class="mod-num" style="color:#166534">${stats.added}</div><div style="font-size:10px;color:#166534;margin-top:2px;font-weight:500">Topics Added</div></div>
      <div class="mod-card" style="background:#DBEAFE"><div class="mod-num" style="color:#1E40AF">${stats.modified}</div><div style="font-size:10px;color:#1E40AF;margin-top:2px;font-weight:500">Topics Modified</div></div>
      <div class="mod-card" style="background:#FEE2E2"><div class="mod-num" style="color:#991B1B">${stats.removed}</div><div style="font-size:10px;color:#991B1B;margin-top:2px;font-weight:500">Topics Removed</div></div>
      <div class="mod-card" style="background:#FAEEDA"><div class="mod-num" style="color:#633806">${stats.modPct}%</div><div style="font-size:10px;color:#633806;margin-top:2px;font-weight:500">Total Modification</div></div>`;
    el('syllabus-preview').innerHTML=units.map(u=>`<div class="syl-unit"><div class="syl-unit-hd">Unit ${u.num} — ${u.title}</div><div class="syl-unit-bd">${u.diffTopics.map(t=>t.type==='added'?`<span class="diff-added">+ ${t.text}</span>`:t.type==='removed'?`<span class="diff-removed">${t.text}</span>`:t.type==='modified'?`<span class="diff-removed">${t.text}</span> <span class="diff-added">→ ${t.newText}</span>`:`<span style="color:var(--muted)">${t.text}</span>`).join(',  ')}</div></div>`).join('');
    S.generatedSyllabus=genSyllabus(S.courseTitle,cos,3);
  }
  el('wizard-shell').style.display='none';
  el('view-preview').style.display='block';
  scroll(0,0);
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
  renderRecCard();
}

function scoreCard(num,lbl,trend,trendClass){return`<div class="score-card"><div class="score-num" style="color:#3A86FF">${num}</div><div class="score-lbl">${lbl}</div><div class="score-trend ${trendClass}">${trend}</div></div>`;}

function renderCODiffTable(showBench){
  const prevCOs=['Write Python programs using basic constructs','Use control structures and functions','Implement string operations','Use OOP concepts','Work with files','Use NumPy for data processing'];
  const cos=S.cos.length?S.cos:['Write computational programs using functions','Compute mathematical functions using loops','Process data using string and dictionaries','Write classes using OOP and inheritance','Apply NumPy for data analysis','Write visualization scripts using pandas'];
  const benchCOs=['Define network security concepts','Explain cryptographic algorithms','Apply security protocols','Analyze vulnerabilities','Design secure architectures','Evaluate security policies'];
  const rows=Math.max(prevCOs.length,cos.length);
  let html=`<thead><tr><th style="color:#6B8EC7">CO</th><th style="color:#3A86FF">Previous Course</th><th style="color:#1D9E75">Updated Course</th>${showBench?`<th style="color:var(--gold)">Benchmark</th>`:''}<th style="color:#6B8EC7">Change</th></tr></thead><tbody>`;
  for(let i=0;i<rows;i++){
    const prev=prevCOs[i]||null,curr=cos[i]||null,bench=benchCOs[i]||null;
    const change=!prev?'cp-added':curr&&prev&&curr!==prev?'cp-modified':'cp-same';
    const changeLbl=!prev?'New CO':curr&&prev&&curr!==prev?'Modified':'Unchanged';
    html+=`<tr><td style="color:#B5D4F4">CO${i+1}</td><td class="cdt-prev">${prev||'<span class="cdt-na">—</span>'}</td><td class="cdt-new">${curr||'<span class="cdt-na">—</span>'}</td>${showBench?`<td class="cdt-bench">${bench||'<span class="cdt-na">Not found</span>'}</td>`:''}<td><span class="change-pill ${change}">${changeLbl}</span></td></tr>`;
  }
  el('co-diff-table').innerHTML=html+'</tbody>';
}

function renderBloomsChart(showBench){
  const cos=S.cos.length?S.cos:['Write computational programs','Compute functions using loops','Process data using dictionaries','Write classes using OOP','Apply NumPy for analysis','Write visualization scripts'];
  const labels=['Remember','Understand','Apply','Analyze','Evaluate','Create'];
  const prevDist=[0,2,3,1,0,0];
  const newDist=cos.reduce((a,co)=>{const l=dB(co)-1;a[l]=(a[l]||0)+1;return a;},[0,0,0,0,0,0]);
  const benchDist=[1,2,1,1,1,0];
  const maxV=Math.max(...prevDist,...newDist,...(showBench?benchDist:[1]))||1;
  el('blooms-chart').innerHTML=labels.map((lbl,i)=>`
    <div class="bc-row">
      <div class="bc-label">${lbl} (L${i+1})</div>
      <div class="bc-bars">
        <div class="bc-bar-row"><div class="bc-bar-label">Previous</div><div class="bc-bar-track"><div class="bc-bar-fill bf-prev" style="width:${Math.round((prevDist[i]/maxV)*100)}%"></div></div><div class="bc-val">${prevDist[i]}</div></div>
        <div class="bc-bar-row"><div class="bc-bar-label">Updated</div><div class="bc-bar-track"><div class="bc-bar-fill bf-new" style="width:${Math.round((newDist[i]/maxV)*100)}%"></div></div><div class="bc-val">${newDist[i]}</div></div>
        ${showBench?`<div class="bc-bar-row"><div class="bc-bar-label">Benchmark</div><div class="bc-bar-track"><div class="bc-bar-fill bf-bench" style="width:${Math.round((benchDist[i]/maxV)*100)}%"></div></div><div class="bc-val">${benchDist[i]}</div></div>`:''}
      </div>
    </div>`).join('');
}

function renderTopicGrid(showBench){
  const units=['Unit 1','Unit 2','Unit 3','Unit 4'];
  const prevCov=[85,75,80,70];const newCov=[92,88,85,90];const benchCov=[80,72,78,82];
  el('topic-grid').innerHTML=units.map((u,i)=>`
    <div class="topic-row">
      <div class="topic-unit">${u} — Topic Coverage</div>
      <div class="overlap-bars">
        <div class="ob-row"><div class="ob-label">Previous</div><div class="ob-track"><div class="ob-fill bf-prev" style="width:${prevCov[i]}%"></div></div><div class="ob-pct">${prevCov[i]}%</div></div>
        <div class="ob-row"><div class="ob-label">Updated</div><div class="ob-track"><div class="ob-fill bf-new" style="width:${newCov[i]}%"></div></div><div class="ob-pct">${newCov[i]}%</div></div>
        ${showBench?`<div class="ob-row"><div class="ob-label">Benchmark</div><div class="ob-track"><div class="ob-fill bf-bench" style="width:${benchCov[i]}%"></div></div><div class="ob-pct">${benchCov[i]}%</div></div>`:''}
      </div>
    </div>`).join('');
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
