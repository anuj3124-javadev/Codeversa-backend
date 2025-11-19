const archiver = require('archiver');
const { PassThrough } = require('stream');

class ZipService {
  createZip(files, options = {}) {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      const chunks = [];
      const stream = new PassThrough();

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });

      archive.on('error', reject);
      archive.pipe(stream);

      files.forEach(file => {
        archive.append(file.content, { 
          name: file.name,
          date: options.date || new Date()
        });
      });

      archive.finalize();
    });
  }

  createProjectZip(code, language, options = {}) {
    const files = [];
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Generate appropriate file structure based on language
    switch (language.toLowerCase()) {
      case 'html':
        files.push(
          { name: 'index.html', content: code },
          { name: 'README.txt', content: `HTML Project\nCreated: ${timestamp}\nLanguage: ${language}` }
        );
        break;
      case 'javascript':
        files.push(
          { name: 'script.js', content: code },
          { name: 'README.txt', content: `JavaScript Project\nCreated: ${timestamp}\nLanguage: ${language}` }
        );
        break;
      case 'java':
        files.push(
          { name: 'Main.java', content: code },
          { name: 'README.txt', content: `Java Project\nCreated: ${timestamp}\nLanguage: ${language}` }
        );
        break;
      case 'python':
        files.push(
          { name: 'main.py', content: code },
          { name: 'README.txt', content: `Python Project\nCreated: ${timestamp}\nLanguage: ${language}` }
        );
        break;
      case 'c':
        files.push(
          { name: 'main.c', content: code },
          { name: 'README.txt', content: `C Project\nCreated: ${timestamp}\nLanguage: ${language}` }
        );
        break;
      case 'cpp':
        files.push(
          { name: 'main.cpp', content: code },
          { name: 'README.txt', content: `C++ Project\nCreated: ${timestamp}\nLanguage: ${language}` }
        );
        break;
      default:
        files.push(
          { name: `code.${language}`, content: code },
          { name: 'README.txt', content: `Code Project\nCreated: ${timestamp}\nLanguage: ${language}` }
        );
    }

    return this.createZip(files, options);
  }

  // Method to create download with custom filename
  async createCustomDownload(code, language, customName) {
    const extension = this.getFileExtension(language);
    const filename = customName.endsWith(`.${extension}`) ? customName : `${customName}.${extension}`;
    
    const files = [
      { name: filename, content: code }
    ];

    return this.createZip(files);
  }

  getFileExtension(language) {
    const extensions = {
      'python': 'py',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'javascript': 'js',
      'html': 'html',
      'css': 'css'
    };
    return extensions[language.toLowerCase()] || 'txt';
  }
}

module.exports = ZipService;