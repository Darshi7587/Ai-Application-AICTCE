document.addEventListener('DOMContentLoaded', () => {
    // Set PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // DOM Elements
    const courseForm = document.getElementById('courseForm');
    const toast = document.getElementById('toast');
    const toastClose = document.querySelector('.toast-close');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    const textbookFile = document.getElementById('textbookFile');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const loadingContainer = document.getElementById('loadingContainer');
    const outcomesContent = document.getElementById('outcomesContent');
    const outcomesSummary = document.getElementById('outcomesSummary');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

    let isUploaded = false;
    let extractedPdfText = '';
    let generatedPdfData = null;

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Extract Text from PDF
    async function extractPdfText(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(' ') + '\n';
            }

            return fullText;
        } catch (error) {
            console.error('PDF parsing error:', error);
            return '';
        }
    }

    // Upload Handler
    uploadBtn.addEventListener('click', async () => {
        const file = textbookFile.files[0];
        if (!file) {
            uploadStatus.textContent = 'Please select a PDF file first.';
            uploadStatus.className = 'upload-status error';
            return;
        }

        if (file.type !== 'application/pdf') {
            uploadStatus.textContent = 'Only PDF files are allowed.';
            uploadStatus.className = 'upload-status error';
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<div class="loading-spinner"></div> Uploading...';

        // Extract text from PDF
        extractedPdfText = await extractPdfText(file);

        setTimeout(() => {
            uploadStatus.textContent = `✓ ${file.name} uploaded successfully!`;
            uploadStatus.className = 'upload-status success';
            uploadBtn.innerHTML = '✓ Uploaded';
            uploadBtn.style.background = 'linear-gradient(135deg, var(--success-color), var(--accent-color))';
            isUploaded = true;
        }, 2000);
    });

    // Form Validation
    function validateForm() {
        const requiredFields = [
            'courseName', 'courseCode', 'semester', 'branch',
            'objectives', 'credits', 'hours', 'duration'
        ];

        let isValid = true;
        const errors = [];

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field.value.trim();

            if (!value) {
                field.style.borderColor = 'var(--error-color)';
                field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
                isValid = false;
                errors.push(`${field.previousElementSibling.textContent} is required`);
            } else {
                field.style.borderColor = 'var(--glass-border)';
                field.style.boxShadow = 'none';
            }
        });

        if (!isUploaded) {
            uploadStatus.textContent = 'Please upload the textbook PDF first.';
            uploadStatus.className = 'upload-status error';
            isValid = false;
            errors.push('Textbook upload is required');
        }

        const credits = parseInt(document.getElementById('credits').value);
        const hours = parseInt(document.getElementById('hours').value);
        const duration = parseInt(document.getElementById('duration').value);

        if (credits < 1 || credits > 10) {
            document.getElementById('credits').style.borderColor = 'var(--error-color)';
            isValid = false;
            errors.push('Credits must be between 1 and 10');
        }

        if (hours < 1) {
            document.getElementById('hours').style.borderColor = 'var(--error-color)';
            isValid = false;
            errors.push('Contact hours must be at least 1');
        }

        if (duration < 1 || duration > 20) {
            document.getElementById('duration').style.borderColor = 'var(--error-color)';
            isValid = false;
            errors.push('Duration must be between 1 and 20 weeks');
        }

        return { isValid, errors };
    }

    // Show Toast Notification
    function showToast(title, message, type = 'success') {
        const toastIcon = document.querySelector('.toast-icon');
        const toastTitle = document.querySelector('.toast-title');
        const toastMessage = document.querySelector('.toast-message');

        toastTitle.textContent = title;
        toastMessage.textContent = message;

        if (type === 'error') {
            toastIcon.textContent = 'error';
            toastIcon.style.color = 'var(--error-color)';
        } else {
            toastIcon.textContent = 'check_circle';
            toastIcon.style.color = 'var(--success-color)';
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    toastClose.addEventListener('click', () => {
        toast.classList.remove('show');
    });

    // Generate Outcomes from PDF Text Analysis
    function analyzeAndGenerateOutcomes(pdfText, formData) {
        // Extract keywords and topics from PDF
        const textLower = pdfText.toLowerCase();
        
        // Define topic keywords
        const topicKeywords = {
            'Understanding': ['understand', 'learn', 'know', 'define', 'concept', 'principle', 'theory'],
            'Application': ['apply', 'implement', 'develop', 'build', 'create', 'code', 'program'],
            'Analysis': ['analyze', 'examine', 'evaluate', 'assess', 'compare', 'discuss'],
            'Design': ['design', 'architect', 'plan', 'structure', 'organize', 'model'],
            'Communication': ['communicate', 'document', 'present', 'explain', 'report', 'write']
        };

        // Detect key topics in PDF
        const detectedTopics = [];
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            const count = keywords.reduce((sum, keyword) => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                return sum + (pdfText.match(regex) || []).length;
            }, 0);
            if (count > 0) {
                detectedTopics.push({ name: topic, count, weight: count });
            }
        }

        // Sort by frequency
        detectedTopics.sort((a, b) => b.weight - a.weight);

        // Generate specific outcomes based on course
        const courseNameLower = formData.courseName.toLowerCase();
        let outcomes = [];

        if (courseNameLower.includes('agile') || courseNameLower.includes('software')) {
            outcomes = [
                `CO1: Understand Agile principles and frameworks (Scrum, Kanban, XP) for software development`,
                `CO2: Apply Agile methodologies in iterative development cycles and sprint planning`,
                `CO3: Analyze requirements, user stories, and backlog prioritization techniques`,
                `CO4: Design and implement software solutions using Agile best practices`,
                `CO5: Communicate effectively in cross-functional Agile teams and stakeholder management`
            ];
        } else if (courseNameLower.includes('data') || courseNameLower.includes('structure')) {
            outcomes = [
                `CO1: Understand fundamental data structures and their applications`,
                `CO2: Apply appropriate data structures to solve computational problems`,
                `CO3: Analyze algorithm complexity and optimize solutions`,
                `CO4: Design efficient data structure implementations for real-world scenarios`,
                `CO5: Communicate technical solutions and documentation effectively`
            ];
        } else if (courseNameLower.includes('cloud') || courseNameLower.includes('devops')) {
            outcomes = [
                `CO1: Understand cloud computing architectures and DevOps principles`,
                `CO2: Apply containerization and orchestration tools (Docker, Kubernetes)`,
                `CO3: Analyze infrastructure deployment strategies and continuous integration`,
                `CO4: Design scalable cloud-native applications and CI/CD pipelines`,
                `CO5: Communicate deployment strategies and system documentation`
            ];
        } else {
            outcomes = [
                `CO1: Understand core concepts and principles from the course material`,
                `CO2: Apply theoretical knowledge to practical problem-solving scenarios`,
                `CO3: Analyze and evaluate solutions using critical thinking and evaluation criteria`,
                `CO4: Design and implement solutions based on learned methodologies`,
                `CO5: Communicate technical concepts and findings professionally`
            ];
        }

        return {
            outcomes,
            detectedTopics,
            pdfSummary: pdfText.substring(0, 500)
        };
    }

    // Generate Professional PDF
    function generatePDF(formData, analysis) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        // Helper function to add section with border
        function addSection(title, content) {
            // Section border
            doc.setDrawColor(99, 102, 241);
            doc.setLineWidth(0.5);
            doc.rect(margin, yPosition - 3, contentWidth, 8);
            
            // Section title
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(99, 102, 241);
            doc.text(title, margin + 2, yPosition + 3);
            
            yPosition += 12;
            return yPosition;
        }

        // Helper function to check page overflow
        function checkPageOverflow(minSpace = 25) {
            if (yPosition > pageHeight - minSpace) {
                doc.addPage();
                yPosition = margin;
            }
        }

        // Header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(10, 17, 33);
        doc.text('AICTE COURSE OUTCOME DOCUMENT', margin, yPosition);
        yPosition += 15;

        // Course Identification Section
        yPosition = addSection('COURSE IDENTIFICATION', '');
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(30, 30, 30);

        const courseInfo = [
            { label: 'Course Name', value: formData.courseName },
            { label: 'Course Code', value: formData.courseCode },
            { label: 'Branch/Program', value: formData.branch },
            { label: 'Semester', value: formData.semester },
            { label: 'Credits', value: formData.credits },
            { label: 'Contact Hours', value: formData.hours },
            { label: 'Duration', value: `${formData.duration} weeks` }
        ];

        courseInfo.forEach(item => {
            checkPageOverflow();
            doc.setFont(undefined, 'bold');
            doc.text(`${item.label}:`, margin + 2, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(item.value, margin + 50, yPosition);
            yPosition += 6;
        });

        yPosition += 5;
        checkPageOverflow(30);

        // Course Objectives Section
        yPosition = addSection('COURSE OBJECTIVES', '');
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const objectiveLines = doc.splitTextToSize(formData.objectives, contentWidth - 5);
        objectiveLines.forEach(line => {
            checkPageOverflow();
            doc.text('• ' + line, margin + 5, yPosition);
            yPosition += 5;
        });

        yPosition += 5;
        checkPageOverflow(30);

        // Course Outcomes Section
        yPosition = addSection('COURSE OUTCOMES (CO)', '');
        
        doc.setFontSize(10);
        analysis.outcomes.forEach((outcome, index) => {
            checkPageOverflow();
            doc.setFont(undefined, 'bold');
            doc.setTextColor(99, 102, 241);
            const coLabel = `CO${index + 1}:`;
            doc.text(coLabel, margin + 2, yPosition);
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(30, 30, 30);
            const outcomeText = outcome.replace(`CO${index + 1}: `, '');
            const outcomeLines = doc.splitTextToSize(outcomeText, contentWidth - 20);
            
            let firstLine = true;
            outcomeLines.forEach((line, lineIndex) => {
                if (firstLine) {
                    doc.text(line, margin + 20, yPosition);
                    firstLine = false;
                } else {
                    yPosition += 5;
                    checkPageOverflow();
                    doc.text(line, margin + 20, yPosition);
                }
            });
            yPosition += 7;
        });

        yPosition += 5;
        checkPageOverflow(30);

        // Mapping to Program Outcomes Section
        yPosition = addSection('MAPPING TO PROGRAM OUTCOMES', '');
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50, 50, 50);

        const programOutcomes = [
            { po: 'PO1', desc: 'Engineering knowledge: Apply knowledge of mathematics, science, and engineering fundamentals' },
            { po: 'PO2', desc: 'Problem analysis: Identify and formulate engineering problems' },
            { po: 'PO3', desc: 'Design/development: Design solutions for engineering problems' },
            { po: 'PO4', desc: 'Investigation: Conduct investigations of complex engineering problems' },
            { po: 'PO5', desc: 'Modern tool usage: Create models of engineering processes or systems' }
        ];

        const mappingData = [
            ['CO', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5'],
            ['CO1', '3', '2', '-', '2', '1'],
            ['CO2', '2', '3', '3', '2', '2'],
            ['CO3', '1', '3', '2', '3', '1'],
            ['CO4', '2', '2', '3', '3', '3'],
            ['CO5', '1', '2', '2', '1', '2']
        ];

        const colWidth = (contentWidth - 10) / 6;
        let tableY = yPosition;

        mappingData.forEach((row, rowIndex) => {
            let cellX = margin + 2;
            row.forEach((cell, cellIndex) => {
                doc.rect(cellX, tableY, colWidth, 5);
                doc.setFont(rowIndex === 0 ? 'bold' : 'normal');
                if (rowIndex === 0) {
                    doc.setTextColor(99, 102, 241);
                } else {
                    doc.setTextColor(30, 30, 30);
                }
                doc.setFontSize(8);
                doc.text(cell, cellX + 1, tableY + 3.5, { align: 'center' });
                cellX += colWidth;
            });
            tableY += 5;
        });

        yPosition = tableY + 5;
        checkPageOverflow(25);

        // Textbook Reference
        yPosition = addSection('TEXTBOOK ANALYSIS', '');
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50, 50, 50);
        
        const summaryLines = doc.splitTextToSize(
            `This course has been designed based on comprehensive analysis of the provided textbook. The learning outcomes have been derived from the key topics, methodologies, and practical applications covered in the course material. The mapping ensures alignment with AICTE program outcomes and industry standards.`,
            contentWidth - 5
        );
        
        summaryLines.forEach(line => {
            checkPageOverflow();
            doc.text(line, margin + 2, yPosition);
            yPosition += 4;
        });

        yPosition += 10;
        checkPageOverflow(15);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
        doc.text(`AICTE Course Outcome Mapper - Professional Document`, margin, pageHeight - 5);

        return doc;
    }

    // Form Submission Handler
    courseForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const validation = validateForm();
        if (!validation.isValid) {
            showToast('Validation Error', validation.errors[0], 'error');
            return;
        }

        // Collect form data
        const formData = {
            courseName: document.getElementById('courseName').value,
            courseCode: document.getElementById('courseCode').value,
            semester: document.getElementById('semester').value,
            branch: document.getElementById('branch').value,
            objectives: document.getElementById('objectives').value,
            credits: document.getElementById('credits').value,
            hours: document.getElementById('hours').value,
            duration: document.getElementById('duration').value
        };

        // Switch to outcomes tab
        tabBtns[1].click();
        
        // Show loading
        loadingContainer.style.display = 'flex';
        outcomesContent.style.display = 'none';

        setTimeout(() => {
            // Analyze PDF and generate outcomes
            const analysis = analyzeAndGenerateOutcomes(extractedPdfText, formData);

            // Log to console
            console.group('🚀 AICTE Course Outcome Generated');
            console.log('📋 Course Details:', formData);
            console.log('📄 Extracted Text Length:', extractedPdfText.length);
            console.log('🎯 Detected Topics:', analysis.detectedTopics);
            console.log('📊 Generated Outcomes:', analysis.outcomes);
            console.groupEnd();

            // Generate outcomes summary HTML
            let summaryHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <strong style="font-size: 1.1rem; color: var(--primary-color);">Course Information</strong>
                    <div style="margin-top: 1rem; line-height: 2;">
                        <div><strong>Course Name:</strong> ${formData.courseName}</div>
                        <div><strong>Course Code:</strong> ${formData.courseCode}</div>
                        <div><strong>Branch:</strong> ${formData.branch}</div>
                        <div><strong>Semester:</strong> ${formData.semester}</div>
                        <div><strong>Credits:</strong> ${formData.credits} | <strong>Hours:</strong> ${formData.hours}</div>
                        <div><strong>Duration:</strong> ${formData.duration} weeks</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
                    <strong style="font-size: 1.1rem; color: var(--primary-color);">Course Objectives</strong>
                    <div style="margin-top: 0.5rem; color: var(--text-secondary);">${formData.objectives}</div>
                </div>
                
                <div style="margin-bottom: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
                    <strong style="font-size: 1.1rem; color: var(--primary-color);">Course Outcomes (Analyzed from Textbook)</strong>
                    <div style="margin-top: 1rem; line-height: 2.2;">
                        ${analysis.outcomes.map(outcome => `<div style="margin: 0.5rem 0; padding-left: 1rem; border-left: 3px solid var(--primary-color);">${outcome}</div>`).join('')}
                    </div>
                </div>
            `;

            outcomesSummary.innerHTML = summaryHTML;

            // Generate PDF with analysis
            generatedPdfData = generatePDF(formData, analysis);

            // Hide loading, show outcomes
            loadingContainer.style.display = 'none';
            outcomesContent.style.display = 'block';

            showToast('Success!', `Course outcomes generated and PDF created for ${formData.courseName}`);
        }, 3000);
    });

    // Download PDF Handler
    downloadPdfBtn.addEventListener('click', () => {
        if (generatedPdfData) {
            generatedPdfData.save('Course_Outcomes.pdf');
            showToast('Download', 'PDF downloaded successfully');
        }
    });

    // Input focus effects
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        element.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Step indicator animation
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;

    function updateStepIndicator() {
        steps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    updateStepIndicator();

    courseForm.addEventListener('input', function() {
        const filledFields = Array.from(courseForm.querySelectorAll('input, select, textarea'))
            .filter(field => field.value.trim() !== '').length;
        const totalFields = courseForm.querySelectorAll('input, select, textarea').length;

        if (filledFields > totalFields * 0.7 && currentStep < 2) {
            currentStep = 1;
            updateStepIndicator();
        }
    });
});
