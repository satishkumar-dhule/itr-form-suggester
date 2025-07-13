# ITR Form Analyzer

A static web application that analyzes AIS (Annual Information Statement) and Form 24AS PDFs to suggest the appropriate ITR (Income Tax Return) form for filing. This application runs entirely in the browser with no backend server required.

## Features

- Upload and analyze AIS PDF documents
- Upload and analyze Form 24AS PDF documents
- Automatic detection of income sources and tax-related information
- Intelligent suggestion of appropriate ITR form based on detected information
- Detailed explanation of why a particular ITR form is suggested
- No data is sent to any server - all processing happens in your browser

## How to Use

1. Visit the deployed website
2. Upload your AIS PDF file
3. Upload your Form 24AS PDF file
4. Click "Analyze Documents"
5. Review the suggested ITR form and the reasoning behind the suggestion

## Privacy & Security

- All document processing happens locally in your browser
- No data is uploaded to any server
- Your tax documents remain completely private
- The application uses PDF.js to read PDFs directly in the browser

## Deployment to GitHub Pages

1. Fork this repository
2. Go to your fork's Settings > Pages
3. Under "Source", select "main" branch
4. Select "/ (root)" as the folder
5. Click "Save"
6. Your site will be published at `https://<your-username>.github.io/tax_itr_processor/`

## Local Development

To run this project locally:

1. Clone the repository
2. Open `index.html` in your browser
   - Due to browser security restrictions, you'll need to serve the files using a local web server
   - You can use Python's built-in server: `python -m http.server 8000`
   - Or use any other local web server of your choice

## Technical Details

- Built with vanilla JavaScript
- Uses PDF.js for PDF processing
- Uses Tailwind CSS for styling
- No build process required
- No dependencies to install

## Limitations

- PDF processing is limited to text extraction
- Complex PDF layouts might not be parsed correctly
- The accuracy of suggestions depends on the quality of text extraction
- Some PDFs might not be readable if they are scanned images without OCR

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project however you'd like. # itr-form-suggester
