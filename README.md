# ITR Form Suggester

A smart, privacy-focused web application that analyzes your AIS (Annual Information Statement) and Form 24AS PDFs to suggest the most appropriate ITR (Income Tax Return) form for filing. The application runs entirely in your browser, ensuring your sensitive tax documents remain private.

## 🚀 Features

- **Smart Document Analysis**: Automatically analyzes AIS and Form 24AS PDFs
- **Privacy First**: All processing happens locally in your browser
- **Comprehensive Checks**: Detects multiple income sources and conditions:
  - Salary Income
  - Business Income
  - Capital Gains
  - Rental Income
  - Director Status
  - Foreign Income
  - Presumptive Income
  - Other Sources
- **Detailed Explanations**: Provides clear reasoning for ITR form suggestions
- **Educational Content**: Includes information about different ITR forms
- **Modern UI**: Clean, responsive interface with clear instructions

## 📋 ITR Forms Coverage

### ITR-1 (Sahaj)
- For individuals with:
  - Salary income
  - Income from one house property
  - Income from other sources (interest)
  - Agricultural income up to ₹5,000
- Not for: Business income, professional income, capital gains

### ITR-2
- For individuals and HUFs with:
  - Capital gains
  - Foreign income/assets
  - Multiple properties
  - Director in a company
- Not for: Business/professional income

### ITR-3
- For individuals and HUFs having:
  - Business income
  - Professional income
  - Plus all income types applicable to ITR-2

### ITR-4 (Sugam)
- For presumptive income:
  - Business income under section 44AD
  - Professional income under section 44ADA
  - Income from goods carriage under section 44AE
- Total turnover/gross receipts up to ₹2 crore

## 🔒 Privacy & Security

- **100% Client-Side**: All processing happens in your browser
- **No Data Transfer**: Your documents are never uploaded to any server
- **No Storage**: Documents are processed in memory only
- **Open Source**: Code is transparent and auditable

## 🛠️ Technical Implementation

### PDF Processing
- Uses PDF.js for client-side PDF parsing
- Extracts text content for analysis
- Handles both AIS and Form 24AS formats

### Analysis Engine
- Pattern matching for income sources
- Rule-based decision system for ITR form selection
- Comprehensive validation of multiple conditions

### Frontend
- Vanilla JavaScript for core functionality
- Tailwind CSS for modern, responsive design
- No build process required

## 🚀 Deployment

### GitHub Pages
1. Fork this repository
2. Go to repository Settings > Pages
3. Select "main" branch and "/ (root)" folder
4. Click Save
5. Access at `https://<your-username>.github.io/tax_itr_processor/`

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/tax_itr_processor.git

# Navigate to project directory
cd tax_itr_processor

# Start a local server (using Python)
python -m http.server 8000

# Or using Node.js
npx http-server
```

Visit `http://localhost:8000` in your browser.

## 📝 Usage Instructions

1. **Prepare Documents**
   - Have your AIS PDF ready
   - Have your Form 24AS PDF ready
   - Ensure PDFs are text-searchable (not scanned images)

2. **Upload Documents**
   - Click to upload AIS
   - Click to upload Form 24AS
   - Wait for processing

3. **Review Results**
   - Check suggested ITR form
   - Review detected income sources
   - Read the detailed explanation
   - Consider the exclusions and conditions

## ⚠️ Limitations

- **PDF Requirements**
  - PDFs must be text-searchable
  - Scanned documents without OCR won't work
  - Some PDF formats might not be compatible

- **Detection Accuracy**
  - Depends on PDF text quality
  - Complex layouts might affect results
  - Some edge cases might need manual verification

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project however you'd like.

---

Made with ❤️ for the Indian Tax Filing Community
