// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

// Track uploaded files and their status
const uploadedFiles = {
    aisFile: null,
    form24asFile: null
};

// ITR Form Rules with detailed conditions
const itrRules = {
    ITR1: {
        name: "ITR-1 (Sahaj)",
        conditions: [
            "Salary income only",
            "Income from one house property",
            "Income from other sources (interest, etc.)",
            "Agricultural income up to ₹5,000"
        ],
        exclusions: [
            "No business income",
            "No professional income",
            "No capital gains",
            "Not a director in a company",
            "No foreign assets or income"
        ],
        keywords: {
            salary: ["salary", "form 16", "tds on salary", "income from salary"],
            house: ["house property", "rental income", "let out"],
            other_sources: ["interest income", "dividend", "fixed deposit"],
            agricultural: ["agricultural", "agriculture income"]
        },
        negative_keywords: {
            business: ["business income", "profession", "professional", "44ad", "44ada"],
            capital_gains: ["capital gains", "shares sold", "mutual fund redemption", "property sold"],
            director: ["director", "din number"],
            foreign: ["foreign income", "foreign asset", "overseas income"]
        }
    },
    ITR2: {
        name: "ITR-2",
        conditions: [
            "Salary income",
            "Income from house property",
            "Capital gains",
            "Income from other sources",
            "Director in a company",
            "Foreign assets or income"
        ],
        exclusions: [
            "No business income",
            "No professional income"
        ],
        keywords: {
            allowed: ["salary", "house property", "capital gains", "shares", "stocks", 
                     "mutual funds", "director", "din", "foreign income", "foreign asset",
                     "overseas", "rental income", "dividend", "interest"],
            capital_gains: ["capital gains", "shares sold", "mutual fund redemption",
                          "stocks sold", "property sold", "securities transaction tax"]
        },
        negative_keywords: {
            business: ["business income", "professional income", "44ad", "44ada", "44ae"]
        }
    },
    ITR3: {
        name: "ITR-3",
        conditions: [
            "Business income",
            "Professional income",
            "All types of income applicable to ITR-2"
        ],
        keywords: {
            business: ["business income", "professional income", "profession",
                      "consulting", "contractor", "proprietor", "partnership"],
            professional: ["professional fees", "consultancy", "practice",
                         "clinic", "legal fees", "audit fees"]
        }
    },
    ITR4: {
        name: "ITR-4 (Sugam)",
        conditions: [
            "Presumptive business income under sections 44AD, 44ADA, and 44AE",
            "Total turnover/gross receipts up to ₹2 crore"
        ],
        exclusions: [
            "No other business income",
            "No professional income other than 44ADA"
        ],
        keywords: {
            presumptive: ["44ad", "44ada", "44ae", "presumptive", "gross receipts",
                         "turnover below 2 crore", "goods carriage"],
            indicators: ["small business", "retail business", "trading business",
                       "commission agent", "goods carriage"]
        }
    }
};

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileId = event.target.id;
    uploadedFiles[fileId] = null; // Reset the stored data

    try {
        // First try without password
        const text = await tryReadPDF(file);
        uploadedFiles[fileId] = text;
        
        // Clear any previous error messages
        clearFileError(fileId);
    } catch (error) {
        console.error('Error processing PDF:', error);
        
        if (error.name === 'PasswordException') {
            showPasswordPrompt(file, fileId);
        } else {
            showFileError(fileId, 'Error processing PDF file. Please ensure it is a valid PDF.');
        }
    }
}

async function tryReadPDF(file, password = '') {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: password
    });

    try {
        const pdf = await loadingTask.promise;
        return await extractTextFromPDF(pdf);
    } catch (error) {
        if (error.name === 'PasswordException') {
            throw error; // Re-throw password errors to handle them specially
        }
        throw new Error('Failed to read PDF: ' + error.message);
    }
}

async function extractTextFromPDF(pdf) {
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ');
    }
    return fullText.toLowerCase();
}

function findKeywords(text, keywordList) {
    return keywordList.some(keyword => text.includes(keyword.toLowerCase()));
}

function showPasswordPrompt(file, fileId) {
    const resultDiv = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    
    const html = `
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-yellow-700">This PDF is password protected.</p>
                    <div class="mt-2">
                        <input type="password" id="pdf-password-${fileId}" 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                               placeholder="Enter PDF password">
                        <button onclick="handlePasswordSubmit('${fileId}')" 
                                class="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Submit Password
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    
    resultContent.innerHTML = html;
    resultDiv.classList.remove('hidden');

    // Store file reference for password handling
    uploadedFiles[fileId] = {
        file: file,
        needsPassword: true
    };
}

// Add this function to the global scope for the onclick handler
window.handlePasswordSubmit = async function(fileId) {
    const passwordInput = document.getElementById(`pdf-password-${fileId}`);
    const password = passwordInput.value;
    
    if (!password) {
        showFileError(fileId, 'Please enter a password.');
        return;
    }

    try {
        const fileData = uploadedFiles[fileId];
        if (!fileData || !fileData.file) {
            showFileError(fileId, 'Please upload the file again.');
            return;
        }

        const text = await tryReadPDF(fileData.file, password);
        uploadedFiles[fileId] = text; // Store the extracted text
        
        // Clear the password prompt and any errors
        clearFileError(fileId);
        hidePasswordPrompt();
    } catch (error) {
        console.error('Error processing PDF with password:', error);
        
        if (error.name === 'PasswordException') {
            showFileError(fileId, 'Incorrect password. Please try again.');
        } else {
            showFileError(fileId, 'Error processing PDF file. Please try again.');
        }
    }
};

function showFileError(fileId, message) {
    const errorId = `error-${fileId}`;
    let errorDiv = document.getElementById(errorId);
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = errorId;
        const fileInput = document.getElementById(fileId);
        fileInput.parentNode.insertBefore(errorDiv, fileInput.nextSibling);
    }

    errorDiv.innerHTML = `
        <div class="mt-2 text-sm text-red-600">
            <span class="inline-flex items-center">
                <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                ${message}
            </span>
        </div>`;
}

function clearFileError(fileId) {
    const errorDiv = document.getElementById(`error-${fileId}`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

function hidePasswordPrompt() {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.add('hidden');
}

function analyzeDocuments() {
    // Check if both files are uploaded and processed
    if (!isReadyForAnalysis()) {
        showError('Please upload both AIS and Form 24AS documents and ensure they are properly processed.');
        return;
    }

    const combinedText = `${uploadedFiles.aisFile} ${uploadedFiles.form24asFile}`;
    
    const analysis = {
        // Income Sources
        hasSalaryIncome: checkForSalaryIncome(combinedText),
        hasBusinessIncome: checkForBusinessIncome(combinedText),
        hasPresumptiveIncome: checkForPresumptiveIncome(combinedText),
        hasCapitalGains: checkForCapitalGains(combinedText),
        hasRentalIncome: checkForRentalIncome(combinedText),
        hasOtherSources: checkForOtherSources(combinedText),
        
        // Special Conditions
        isDirector: checkIfDirector(combinedText),
        hasForeignIncome: checkForForeignIncome(combinedText),
        hasAgricultureIncome: checkForAgricultureIncome(combinedText),
        
        // Additional Checks
        multipleProperties: checkForMultipleProperties(combinedText),
        presumptiveTurnover: checkPresumptiveTurnover(combinedText)
    };

    const suggestedForm = determineITRForm(analysis);
    displayResult(suggestedForm, analysis);
}

function checkForSalaryIncome(text) {
    const keywords = itrRules.ITR1.keywords.salary;
    return findKeywords(text, keywords);
}

function checkForBusinessIncome(text) {
    return findKeywords(text, itrRules.ITR3.keywords.business);
}

function checkForPresumptiveIncome(text) {
    return findKeywords(text, itrRules.ITR4.keywords.presumptive);
}

function checkForCapitalGains(text) {
    return findKeywords(text, itrRules.ITR2.keywords.capital_gains);
}

function checkForRentalIncome(text) {
    const keywords = ["rental income", "house property income", "let out property"];
    return findKeywords(text, keywords);
}

function checkForOtherSources(text) {
    const keywords = ["interest income", "dividend income", "other sources"];
    return findKeywords(text, keywords);
}

function checkIfDirector(text) {
    const keywords = ["director", "din", "director identification number"];
    return findKeywords(text, keywords);
}

function checkForForeignIncome(text) {
    const keywords = ["foreign income", "foreign asset", "overseas income", "foreign bank"];
    return findKeywords(text, keywords);
}

function checkForAgricultureIncome(text) {
    const keywords = ["agricultural income", "agriculture income", "farm income"];
    return findKeywords(text, keywords);
}

function checkForMultipleProperties(text) {
    const keywords = ["second house property", "multiple properties", "more than one house"];
    return findKeywords(text, keywords);
}

function checkPresumptiveTurnover(text) {
    const keywords = ["turnover less than 2 crore", "gross receipts below 2 crore"];
    return findKeywords(text, keywords);
}

function determineITRForm(analysis) {
    // Check for ITR-3 first (most comprehensive)
    if (analysis.hasBusinessIncome && !analysis.hasPresumptiveIncome) {
        return 'ITR3';
    }

    // Check for ITR-4 (Presumptive Income)
    if (analysis.hasPresumptiveIncome && analysis.presumptiveTurnover) {
        return 'ITR4';
    }

    // Check for ITR-2
    if (analysis.hasCapitalGains || 
        analysis.isDirector || 
        analysis.hasForeignIncome ||
        analysis.multipleProperties) {
        return 'ITR2';
    }

    // Default to ITR-1 if basic conditions are met
    if ((analysis.hasSalaryIncome || analysis.hasRentalIncome || analysis.hasOtherSources) &&
        !analysis.hasBusinessIncome &&
        !analysis.hasCapitalGains &&
        !analysis.isDirector &&
        !analysis.hasForeignIncome) {
        return 'ITR1';
    }

    // If no clear match, suggest ITR-2 as a safer option
    return 'ITR2';
}

function displayResult(suggestedForm, analysis) {
    const resultDiv = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    
    let html = `<p class="text-xl font-bold mb-4">Suggested Form: ${itrRules[suggestedForm].name}</p>`;
    
    // Display detected income sources
    html += '<div class="mb-6">';
    html += '<p class="font-semibold mb-2">Detected Income Sources & Conditions:</p>';
    html += '<ul class="list-disc pl-6 space-y-2">';
    if (analysis.hasSalaryIncome) html += '<li>✓ Salary income</li>';
    if (analysis.hasBusinessIncome) html += '<li>✓ Business income</li>';
    if (analysis.hasPresumptiveIncome) html += '<li>✓ Presumptive business income</li>';
    if (analysis.hasCapitalGains) html += '<li>✓ Capital gains</li>';
    if (analysis.hasRentalIncome) html += '<li>✓ Rental income</li>';
    if (analysis.hasOtherSources) html += '<li>✓ Other sources of income</li>';
    if (analysis.isDirector) html += '<li>✓ Director in a company</li>';
    if (analysis.hasForeignIncome) html += '<li>✓ Foreign income/assets</li>';
    if (analysis.hasAgricultureIncome) html += '<li>✓ Agricultural income</li>';
    if (analysis.multipleProperties) html += '<li>✓ Multiple properties</li>';
    html += '</ul></div>';

    // Add form description
    html += '<div class="bg-blue-50 rounded-lg p-4">';
    html += `<p class="font-semibold mb-2">${itrRules[suggestedForm].name} is applicable for:</p>`;
    html += '<ul class="list-disc pl-6 space-y-1">';
    itrRules[suggestedForm].conditions.forEach(condition => {
        html += `<li>${condition}</li>`;
    });
    html += '</ul>';
    
    if (itrRules[suggestedForm].exclusions) {
        html += '<p class="font-semibold mt-3 mb-2">Important Exclusions:</p>';
        html += '<ul class="list-disc pl-6 space-y-1 text-red-600">';
        itrRules[suggestedForm].exclusions.forEach(exclusion => {
            html += `<li>${exclusion}</li>`;
        });
        html += '</ul>';
    }
    html += '</div>';

    // Add disclaimer
    html += '<div class="mt-4 text-sm text-gray-600">';
    html += '<p>⚠️ Disclaimer: This suggestion is based on the information detected in your documents. ';
    html += 'Please verify all conditions and consult a tax professional if needed.</p>';
    html += '</div>';

    resultContent.innerHTML = html;
    resultDiv.classList.remove('hidden');
}

function showError(message) {
    const resultDiv = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    
    resultContent.innerHTML = `
        <div class="bg-red-50 border-l-4 border-red-500 p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-red-700">${message}</p>
                </div>
            </div>
        </div>`;
    resultDiv.classList.remove('hidden');
} 

function isReadyForAnalysis() {
    return typeof uploadedFiles.aisFile === 'string' && 
           typeof uploadedFiles.form24asFile === 'string' &&
           uploadedFiles.aisFile !== null &&
           uploadedFiles.form24asFile !== null;
} 