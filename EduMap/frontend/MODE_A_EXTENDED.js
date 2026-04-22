// ════════════════════════════════════════════════════════════════════════════════════
// MODE A EXTENDED - COURSE MODIFICATION & PROPOSAL GENERATION
// ════════════════════════════════════════════════════════════════════════════════════

/**
 * GENERATE PROPOSAL FROM MODE A PDF ANALYSIS
 * Takes revisedStructure from PDF analysis and generates:
 * - Course Outcomes (COs)
 * - CO-PO Mapping
 * - Bloom's Levels
 * Reuses Mode B logic for consistency
 */
async function generateProposalFromModeA() {
  console.log('🚀 Generating Proposal from Mode A Analysis...');
  
  // ✅ Validate PDF analysis data
  if (!S.pdfAnalysis || !S.pdfAnalysis.revisedStructure) {
    alert('❌ No PDF analysis data found. Please upload PDF first.');
    return;
  }

  if (S.pdfAnalysis.revisedStructure.length === 0) {
    alert('❌ Revised structure is empty.');
    return;
  }

  // ✅ Validate course info
  const courseTitle = el('f-title')?.value?.trim();
  const courseCode = el('f-code')?.value?.trim();
  
  if (!courseTitle || !courseCode) {
    alert('⚠️ Please fill in Course Title and Course Code');
    return;
  }

  try {
    // ════════════════════════════════════════════════════════════════════
    // STEP 1: Extract topics from revisedStructure
    // ════════════════════════════════════════════════════════════════════
    const allTopics = [];
    S.pdfAnalysis.revisedStructure.forEach(unit => {
      const topics = Array.isArray(unit.topics) ? unit.topics : 
                    (typeof unit.topics === 'string' ? unit.topics.split(',').map(t => t.trim()) : []);
      allTopics.push(...topics);
    });

    console.log(`📚 Extracted ${allTopics.length} topics from revised structure`);

    if (allTopics.length === 0) {
      alert('⚠️ No topics found in revised structure');
      return;
    }

    // ════════════════════════════════════════════════════════════════════
    // STEP 2: Generate COs from topics (using backend AI)
    // ════════════════════════════════════════════════════════════════════
    // Group topics into logical COs (1 CO per 2-3 topics typically)
    const generatedCOs = generateCOsFromTopics(allTopics, S.pdfAnalysis.addPOs);
    
    console.log(`✅ Generated ${generatedCOs.length} COs`);
    console.log('Generated COs:', generatedCOs);

    // Store in S for later use
    S.cos = generatedCOs;
    S.courseTitle = courseTitle;
    S.courseCode = courseCode;
    S.courseSem = el('f-sem')?.value || 'Semester';
    S.courseBranch = el('f-branch')?.value || 'Branch';
    S.generatedSyllabus = S.pdfAnalysis.revisedStructure.map((u, i) => ({
      num: i + 1,
      title: u.moduleName || u.title || `Module ${i + 1}`,
      topics: u.topics || []
    }));
    
    // ════════════════════════════════════════════════════════════════════
    // STEP 3: Generate CO-PO mapping using backend
    // ════════════════════════════════════════════════════════════════════
    await addCourseOutcomes(courseCode, generatedCOs);

    // ════════════════════════════════════════════════════════════════════
    // STEP 4: Display preview with generated data
    // ════════════════════════════════════════════════════════════════════
    generatePreview();
    
    // ✅ Show preview section
    showStep(4);
    alert(`✅ Proposal generated! ${generatedCOs.length} COs created and mapped to POs`);

  } catch (error) {
    console.error('Error generating proposal:', error);
    alert(`Error: ${error.message}`);
  }
}

/**
 * GENERATE COs FROM TOPICS
 * Groups topics into logical Course Outcomes
 * Merges with addPOs from PDF analysis if available
 */
function generateCOsFromTopics(topics, addPOs = []) {
  const generated = [];

  // If backend already suggested COs, use them
  if (addPOs && addPOs.length > 0) {
    return addPOs.map((item, idx) => {
      if (typeof item === 'string') return item;
      if (item.co) return item.co;
      if (item.CO) return item.CO;
      return `Understand and apply ${topics[idx] || 'course concepts'}`;
    });
  }

  // Otherwise, group topics into COs
  const topicsPerCO = Math.ceil(topics.length / 4); // ~4 COs
  
  for (let i = 0; i < topics.length; i += topicsPerCO) {
    const group = topics.slice(i, i + topicsPerCO);
    const co = createCOStatement(group);
    generated.push(co);
  }

  return generated.slice(0, 6); // Max 6 COs
}

/**
 * CREATE CO STATEMENT FROM TOPIC GROUP
 * Uses Bloom's verbs to create action-oriented CO
 */
function createCOStatement(topics) {
  if (!topics || topics.length === 0) return 'Understand course concepts';

  const actions = [
    'Understand and explain', 'Analyze and evaluate', 'Apply and implement',
    'Design and develop', 'Evaluate and critique', 'Create and innovate'
  ];
  
  const topicSummary = topics.slice(0, 2).join(', ');
  const action = actions[Math.floor(Math.random() * actions.length)];
  
  return `${action} ${topicSummary}`;
}

/**
 * DISPLAY MODE A ANALYSIS RESULTS - COMPLETE UI
 * Shows all sections:
 * 1. Important Topics (Green) ✓
 * 2. Unnecessary Topics (Yellow) ⚠️
 * 3. Burden Topics (Red) 🗑️
 * 4. Suggested Improvements (Blue) 💡
 * 5. Revised Structure (Modules) 📦
 */
function displayModeAAnalysisComplete(data) {
  if (!data) return;

  console.log('📊 Displaying complete Mode A analysis:', data);

  // Hide all sections initially
  ['section-important', 'section-unnecessary', 'section-outdated', 
   'section-improvements', 'section-syllabus'].forEach(s => {
    const el_s = el(s);
    if (el_s) el_s.style.display = 'none';
  });

  // ════════════════════════════════════════════════════════════════════
  // 1. IMPORTANT TOPICS (Green - Retain)
  // ════════════════════════════════════════════════════════════════════
  if (data.importantTopics && data.importantTopics.length > 0) {
    const section = el('section-important');
    if (section) {
      section.style.display = 'block';
      const html = data.importantTopics.map((topic, idx) => {
        const name = typeof topic === 'string' ? topic : (topic.name || topic.topic || 'Topic');
        const difficulty = typeof topic === 'string' ? 'Medium' : 
                          (topic.difficulty || topic.level || 'Medium');
        const reason = typeof topic === 'string' ? 'Core concept' : (topic.reason || '');

        return `
          <div class="topic-card topic-important">
            <div class="topic-header">
              <span class="topic-badge badge-important">✓ RETAIN</span>
              <span class="topic-name">${name}</span>
              <span class="topic-difficulty difficulty-${difficulty.toLowerCase()}">${difficulty}</span>
            </div>
            ${reason ? `<div class="topic-reason">${reason}</div>` : ''}
          </div>
        `;
      }).join('');
      
      el('important-topics-list').innerHTML = html;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 2. UNNECESSARY TOPICS (Yellow - Optional Remove)
  // ════════════════════════════════════════════════════════════════════
  if (data.unnecessaryTopics && data.unnecessaryTopics.length > 0) {
    const section = el('section-unnecessary');
    if (section) {
      section.style.display = 'block';
      const html = data.unnecessaryTopics.map(topic => {
        const name = typeof topic === 'string' ? topic : (topic.name || topic.topic || 'Topic');
        const difficulty = typeof topic === 'string' ? 'Low' : (topic.difficulty || 'Low');
        const reason = typeof topic === 'string' ? 'Optional coverage' : (topic.reason || '');

        return `
          <div class="topic-card topic-unnecessary">
            <div class="topic-header">
              <span class="topic-badge badge-unnecessary">⚠️ OPTIONAL</span>
              <span class="topic-name">${name}</span>
              <span class="topic-difficulty difficulty-${difficulty.toLowerCase()}">${difficulty}</span>
            </div>
            ${reason ? `<div class="topic-reason">${reason}</div>` : ''}
          </div>
        `;
      }).join('');
      
      el('unnecessary-topics-list').innerHTML = html;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 3. BURDEN TOPICS (Red - Remove/Update)
  // ════════════════════════════════════════════════════════════════════
  if (data.burdenTopics && data.burdenTopics.length > 0) {
    const section = el('section-outdated');
    if (section) {
      section.style.display = 'block';
      const html = data.burdenTopics.map(topic => {
        const name = typeof topic === 'string' ? topic : (topic.name || topic.topic || 'Topic');
        const difficulty = typeof topic === 'string' ? 'High' : (topic.difficulty || 'High');
        const reason = typeof topic === 'string' ? 'Outdated or burdensome' : (topic.reason || '');

        return `
          <div class="topic-card topic-burden">
            <div class="topic-header">
              <span class="topic-badge badge-burden">🗑️ REMOVE/UPDATE</span>
              <span class="topic-name">${name}</span>
              <span class="topic-difficulty difficulty-${difficulty.toLowerCase()}">${difficulty}</span>
            </div>
            ${reason ? `<div class="topic-reason">${reason}</div>` : ''}
          </div>
        `;
      }).join('');
      
      el('outdated-topics-list').innerHTML = html;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 4. SUGGESTED IMPROVEMENTS (Blue - Recommendations)
  // ════════════════════════════════════════════════════════════════════
  if (data.improvements && data.improvements.length > 0) {
    const section = el('section-improvements');
    if (section) {
      section.style.display = 'block';
      const html = data.improvements.map((imp, idx) => {
        const text = typeof imp === 'string' ? imp : (imp.suggestion || imp.improvement || '');
        return `
          <div class="improvement-card">
            <div class="improvement-number">${idx + 1}</div>
            <div class="improvement-text">${text}</div>
          </div>
        `;
      }).join('');
      
      el('improvements-list').innerHTML = html;
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // 5. REVISED STRUCTURE (Modules/Units)
  // ════════════════════════════════════════════════════════════════════
  if (data.revisedStructure && data.revisedStructure.length > 0) {
    const section = el('section-syllabus');
    if (section) {
      section.style.display = 'block';
      const html = data.revisedStructure.map((unit, idx) => {
        const moduleName = unit.moduleName || unit.title || unit.name || `Module ${idx + 1}`;
        const topicsArray = Array.isArray(unit.topics) ? unit.topics : 
                           (typeof unit.topics === 'string' ? unit.topics.split(',').map(t => t.trim()) : []);

        const topicsHtml = topicsArray.map(topic => 
          `<li class="module-topic">${topic}</li>`
        ).join('');

        return `
          <div class="module-card">
            <div class="module-header">
              <span class="module-number">Unit ${idx + 1}</span>
              <span class="module-name">${moduleName}</span>
              <span class="topic-count">${topicsArray.length} topics</span>
            </div>
            <ul class="module-topics">
              ${topicsHtml}
            </ul>
          </div>
        `;
      }).join('');
      
      el('syllabus-structure').innerHTML = html;
    }
  }

  // ✅ Show generate proposal button
  const genBtn = el('generate-proposal-btn');
  if (genBtn) genBtn.style.display = 'inline-flex';
}

/**
 * APPLY REVISED STRUCTURE AS SYLLABUS
 * Updates S.generatedSyllabus with Mode A revisedStructure
 */
function applyRevisedStructure() {
  if (!S.pdfAnalysis || !S.pdfAnalysis.revisedStructure) {
    alert('No revised structure available');
    return;
  }

  S.generatedSyllabus = S.pdfAnalysis.revisedStructure.map((unit, i) => ({
    num: i + 1,
    title: unit.moduleName || unit.title || `Unit ${i + 1}`,
    topics: Array.isArray(unit.topics) ? unit.topics : 
           (typeof unit.topics === 'string' ? unit.topics.split(',') : [])
  }));

  console.log('✅ Applied revised structure to syllabus');
}

/**
 * DOWNLOAD DOCX - PROFESSIONAL FORMATTING
 * Uses docx library for production-ready output
 * Structure matches AICTE/BOS requirements
 */
async function downloadDocxProfessional() {
  console.log('📥 Generating Professional DOCX...');

  try {
    // ✅ Check if docx library is loaded
    if (typeof docx === 'undefined') {
      alert('⚠️ DOCX library not loaded. Using fallback HTML-to-DOCX...');
      downloadDocx(); // Fallback to existing function
      return;
    }

    const courseTitle = S.courseTitle || 'Course Title';
    const courseCode = S.courseCode || 'XXXXX';
    const semester = S.courseSem || 'Semester';
    const branch = S.courseBranch || 'Branch';
    const credits = el('f-credits')?.value || '3';
    const courseType = el('f-type')?.value || 'HC';
    const overview = el('f-overview')?.value || 'Course Overview';
    const assess = el('f-assess')?.value || 'CIE 50% / SEE 50%';

    const sections = [];

    // ════════════════════════════════════════════════════════════════
    // SECTION 1: TITLE PAGE
    // ════════════════════════════════════════════════════════════════
    sections.push(
      new docx.Paragraph({
        text: courseTitle,
        heading: docx.HeadingLevel.HEADING_1,
        bold: true,
        fontSize: 32,
        color: '1B3A6B',
        spacing: { after: 200 }
      }),
      new docx.Paragraph({
        text: courseCode,
        fontSize: 20,
        color: '3A86FF',
        spacing: { after: 100 }
      })
    );

    // Course Info Table
    sections.push(
      new docx.Table({
        width: { size: 100, type: docx.WidthType.PERCENTAGE },
        rows: [
          new docx.TableRow({
            cells: [
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Course Title', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: courseTitle })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Course Type', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: courseType })] })
            ]
          }),
          new docx.TableRow({
            cells: [
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Course Code', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: courseCode })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Credits', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: credits })] })
            ]
          }),
          new docx.TableRow({
            cells: [
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Semester', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: semester })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Branch', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: branch })] })
            ]
          })
        ]
      }),
      new docx.Paragraph({ text: '', spacing: { after: 400 } })
    );

    // ════════════════════════════════════════════════════════════════
    // SECTION 2: COURSE OVERVIEW
    // ════════════════════════════════════════════════════════════════
    sections.push(
      new docx.Paragraph({
        text: 'COURSE OVERVIEW',
        heading: docx.HeadingLevel.HEADING_1,
        bold: true,
        fontSize: 24,
        color: '1B3A6B',
        spacing: { after: 200 }
      }),
      new docx.Paragraph({
        text: overview,
        fontSize: 11,
        alignment: docx.AlignmentType.JUSTIFIED,
        spacing: { after: 200 }
      })
    );

    // ════════════════════════════════════════════════════════════════
    // SECTION 3: COURSE STRUCTURE
    // ════════════════════════════════════════════════════════════════
    sections.push(
      new docx.Paragraph({
        text: 'COURSE STRUCTURE',
        heading: docx.HeadingLevel.HEADING_1,
        bold: true,
        fontSize: 24,
        color: '1B3A6B',
        spacing: { after: 200 }
      }),
      new docx.Table({
        width: { size: 100, type: docx.WidthType.PERCENTAGE },
        rows: [
          new docx.TableRow({
            cells: [
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Component', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'L', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'T', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'P', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Credits', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Hours', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Assessment', bold: true })] })
            ]
          }),
          new docx.TableRow({
            cells: [
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Lecture' })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: '3' })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: '-' })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: '-' })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: credits })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: '42' })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: assess })] })
            ]
          })
        ]
      }),
      new docx.Paragraph({ text: '', spacing: { after: 400 } })
    );

    // ════════════════════════════════════════════════════════════════
    // SECTION 4: COURSE OBJECTIVES
    // ════════════════════════════════════════════════════════════════
    const objectives = [
      'Provide comprehensive understanding of course concepts',
      'Develop practical skills and hands-on experience',
      'Prepare students for industry applications',
      'Develop critical thinking and problem-solving abilities'
    ];

    sections.push(
      new docx.Paragraph({
        text: 'COURSE OBJECTIVES',
        heading: docx.HeadingLevel.HEADING_1,
        bold: true,
        fontSize: 24,
        color: '1B3A6B',
        spacing: { after: 200 }
      })
    );

    objectives.forEach((obj, idx) => {
      sections.push(
        new docx.Paragraph({
          text: `${idx + 1}. ${obj}`,
          fontSize: 11,
          spacing: { after: 100 },
          numbering: { level: 0, instance: 0 }
        })
      );
    });

    sections.push(new docx.Paragraph({ text: '', spacing: { after: 200 } }));

    // ════════════════════════════════════════════════════════════════
    // SECTION 5: COURSE OUTCOMES (COs)
    // ════════════════════════════════════════════════════════════════
    sections.push(
      new docx.Paragraph({
        text: 'COURSE OUTCOMES',
        heading: docx.HeadingLevel.HEADING_1,
        bold: true,
        fontSize: 24,
        color: '1B3A6B',
        spacing: { after: 200 }
      })
    );

    const coRows = S.cos.map((co, idx) => {
      const mapping = genCOPO([co], S.coData && S.coData[idx] ? [S.coData[idx]] : null)[0];
      const poList = POS
        .filter(po => {
          const poIdx = parseInt(po.replace('PO', ''));
          return mapping.pos[po] > 0;
        })
        .join(', ');

      return new docx.TableRow({
        cells: [
          new docx.TableCell({ children: [new docx.Paragraph({ text: `CO${idx + 1}`, bold: true })] }),
          new docx.TableCell({ children: [new docx.Paragraph({ text: co })] }),
          new docx.TableCell({ children: [new docx.Paragraph({ text: poList || 'All' })] })
        ]
      });
    });

    sections.push(
      new docx.Table({
        width: { size: 100, type: docx.WidthType.PERCENTAGE },
        rows: [
          new docx.TableRow({
            cells: [
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'CO', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Course Outcome', bold: true })] }),
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'Related POs', bold: true })] })
            ]
          }),
          ...coRows
        ]
      }),
      new docx.Paragraph({ text: '', spacing: { after: 400 } })
    );

    // ════════════════════════════════════════════════════════════════
    // SECTION 6: BLOOM'S TAXONOMY
    // ════════════════════════════════════════════════════════════════
    sections.push(
      new docx.Paragraph({
        text: 'BLOOM\'S TAXONOMY LEVELS',
        heading: docx.HeadingLevel.HEADING_1,
        bold: true,
        fontSize: 24,
        color: '1B3A6B',
        spacing: { after: 200 }
      })
    );

    const bloomsRows = S.cos.map((co, idx) => {
      const level = dB(co);
      const levelName = BL[level] || 'Apply';
      const cols = [new docx.TableCell({ children: [new docx.Paragraph({ text: `CO${idx + 1}` })] })];

      for (let l = 1; l <= 6; l++) {
        cols.push(
          new docx.TableCell({
            children: [new docx.Paragraph({ text: level === l ? '✓' : '', alignment: docx.AlignmentType.CENTER })],
            shading: level === l ? { fill: '1D9E75', type: docx.ShadingType.CLEAR } : undefined
          })
        );
      }

      return new docx.TableRow({ cells: cols });
    });

    sections.push(
      new docx.Table({
        width: { size: 100, type: docx.WidthType.PERCENTAGE },
        rows: [
          new docx.TableRow({
            cells: [
              new docx.TableCell({ children: [new docx.Paragraph({ text: 'CO', bold: true })] }),
              ...['L1\n(Remember)', 'L2\n(Understand)', 'L3\n(Apply)', 'L4\n(Analyze)', 'L5\n(Evaluate)', 'L6\n(Create)'].map(l =>
                new docx.TableCell({ children: [new docx.Paragraph({ text: l, bold: true, alignment: docx.AlignmentType.CENTER })] })
              )
            ]
          }),
          ...bloomsRows
        ]
      }),
      new docx.Paragraph({ text: '', spacing: { after: 400 } })
    );

    // ════════════════════════════════════════════════════════════════
    // SECTION 7: CO-PO ARTICULATION MATRIX
    // ════════════════════════════════════════════════════════════════
    sections.push(
      new docx.Paragraph({
        text: 'CO–PO ARTICULATION MATRIX',
        heading: docx.HeadingLevel.HEADING_1,
        bold: true,
        fontSize: 24,
        color: '1B3A6B',
        spacing: { after: 100 }
      }),
      new docx.Paragraph({
        text: 'Scale: 1 = Low, 2 = Medium, 3 = High',
        fontSize: 9,
        italics: true,
        spacing: { after: 200 }
      })
    );

    const matrixRows = S.cos.map((co, idx) => {
      const mapping = genCOPO([co], S.coData && S.coData[idx] ? [S.coData[idx]] : null)[0];
      const cells = [new docx.TableCell({ children: [new docx.Paragraph({ text: `CO${idx + 1}`, bold: true })] })];

      POS.forEach(po => {
        const poIdx = parseInt(po.replace('PO', ''));
        const level = mapping.pos[po] || 0;
        cells.push(
          new docx.TableCell({
            children: [new docx.Paragraph({
              text: level.toString(),
              alignment: docx.AlignmentType.CENTER
            })],
            shading: level > 0 ? { fill: level === 3 ? '1D9E75' : level === 2 ? '3A86FF' : 'D1DCF0', type: docx.ShadingType.CLEAR } : undefined
          })
        );
      });

      return new docx.TableRow({ cells });
    });

    const matrixHeader = [new docx.TableCell({ children: [new docx.Paragraph({ text: 'CO', bold: true })] })];
    POS.forEach(po => {
      matrixHeader.push(
        new docx.TableCell({
          children: [new docx.Paragraph({ text: po, bold: true, alignment: docx.AlignmentType.CENTER })],
          shading: { fill: '1B3A6B', type: docx.ShadingType.CLEAR, color: 'FFFFFF' }
        })
      );
    });

    sections.push(
      new docx.Table({
        width: { size: 100, type: docx.WidthType.PERCENTAGE },
        rows: [
          new docx.TableRow({ cells: matrixHeader }),
          ...matrixRows
        ]
      }),
      new docx.Paragraph({ text: '', spacing: { after: 400 } })
    );

    // ════════════════════════════════════════════════════════════════
    // SECTION 8: COURSE CONTENT (UNITS)
    // ════════════════════════════════════════════════════════════════
    sections.push(
      new docx.Paragraph({
        text: 'COURSE CONTENT',
        heading: docx.HeadingLevel.HEADING_1,
        bold: true,
        fontSize: 24,
        color: '1B3A6B',
        spacing: { after: 200 }
      })
    );

    if (S.generatedSyllabus && S.generatedSyllabus.length > 0) {
      S.generatedSyllabus.forEach((unit, i) => {
        sections.push(
          new docx.Paragraph({
            text: `UNIT ${i + 1}: ${unit.title || `Unit ${i + 1}`}`,
            heading: docx.HeadingLevel.HEADING_2,
            bold: true,
            fontSize: 14,
            spacing: { after: 100 }
          })
        );

        let topicsText = '';
        if (Array.isArray(unit.topics)) {
          topicsText = unit.topics.join(', ');
        } else if (typeof unit.topics === 'string') {
          topicsText = unit.topics;
        } else if (typeof unit.topics === 'object') {
          topicsText = JSON.stringify(unit.topics);
        }

        if (topicsText) {
          sections.push(
            new docx.Paragraph({
              text: topicsText,
              fontSize: 11,
              spacing: { after: 200 }
            })
          );
        }
      });
    }

    sections.push(new docx.Paragraph({ text: '', spacing: { after: 200 } }));

    // ════════════════════════════════════════════════════════════════
    // SECTION 9: TEXTBOOKS & REFERENCES
    // ════════════════════════════════════════════════════════════════
    sections.push(
      new docx.Paragraph({
        text: 'TEXTBOOKS & REFERENCES',
        heading: docx.HeadingLevel.HEADING_1,
        bold: true,
        fontSize: 24,
        color: '1B3A6B',
        spacing: { after: 200 }
      })
    );

    if (S_textbookAuthors && S_textbookAuthors.length > 0) {
      S_textbookAuthors.forEach((author, idx) => {
        sections.push(
          new docx.Paragraph({
            text: `${idx + 1}. ${author}`,
            fontSize: 11,
            numbering: { level: 0, instance: 1 },
            spacing: { after: 80 }
          })
        );
      });
    } else {
      sections.push(
        new docx.Paragraph({
          text: 'To be updated based on course requirements',
          fontSize: 11,
          italics: true,
          spacing: { after: 200 }
        })
      );
    }

    // ════════════════════════════════════════════════════════════════
    // CREATE DOCUMENT
    // ════════════════════════════════════════════════════════════════
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: sections
      }]
    });

    // ✅ Generate and download
    const fileName = `${courseCode}_${courseTitle.replace(/\s+/g, '_')}_Syllabus.docx`;
    await docx.Packer.toBlob(doc).then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      console.log(`✅ DOCX downloaded: ${fileName}`);
    });

  } catch (error) {
    console.error('Error generating professional DOCX:', error);
    alert('Error generating DOCX: ' + error.message);
  }
}

// ════════════════════════════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════════
// Make functions globally available
window.generateProposalFromModeA = generateProposalFromModeA;
window.displayModeAAnalysisComplete = displayModeAAnalysisComplete;
window.applyRevisedStructure = applyRevisedStructure;
window.downloadDocxProfessional = downloadDocxProfessional;
window.generateCOsFromTopics = generateCOsFromTopics;
window.createCOStatement = createCOStatement;
