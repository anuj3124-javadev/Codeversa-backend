const { spawn } = require('child_process');
const { writeFileSync, unlinkSync, existsSync } = require('fs');
const { join } = require('path');
const { tmpdir } = require('os');

class JavaScriptRunner {
  constructor() {
    console.log('✅ JavaScript Runner initialized (No Docker required)');
    this.inputPrompts = [
      'enter your name',
      'enter name',
      'input',
      'please enter',
      'enter value',
      'provide input',
      'enter data'
    ];
  }

  getFilename(language) {
    const filenames = {
      'python': 'main.py',
      'java': 'Main.java',
      'c': 'main.c',
      'cpp': 'main.cpp',
      'javascript': 'script.js'
    };
    return filenames[language.toLowerCase()] || 'main.py';
  }

  async runCode(language, code, input = '') {
    console.log(`🚀 Executing ${language} code...`);
    console.log(`📝 Input to provide: "${input}"`);

    try {
      const filename = this.getFilename(language);
      const filePath = join(tmpdir(), filename);
      writeFileSync(filePath, code, 'utf8');

      switch (language.toLowerCase()) {
        case 'python':
          return await this.runPython(filePath, input);
        case 'java':
          return await this.runJava(filePath, input);
        case 'c':
          return await this.runC(filePath, input);
        case 'cpp':
          return await this.runCpp(filePath, input);
        case 'javascript':
          return await this.runJavaScript(filePath, input);
        default:
          return await this.runPython(filePath, input);
      }

    } catch (error) {
      console.error('💥 Execution error:', error);
      return {
        stdout: '',
        stderr: `Execution failed: ${error.message}`,
        status: 'error'
      };
    }
  }

  // ========== PYTHON ==========
  async runPython(filePath, input) {
    return new Promise((resolve) => {
      const childProcess = spawn('python', ['-u', filePath], { // -u for unbuffered
        cwd: tmpdir(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.handleProcess(childProcess, 'python', filePath, input, resolve);
    });
  }

  // ========== JAVA ==========
  async runJava(filePath, input) {
    const tempDir = tmpdir();
    
    try {
      console.log('🔨 Compiling Java code...');
      
      // Compile Java
      const compileResult = await this.compileJava(filePath);
      if (compileResult.status === 'error') {
        this.cleanupFiles('java', filePath);
        return compileResult;
      }

      console.log('✅ Java compilation successful, now running...');

      return new Promise((resolve) => {
        const runProcess = spawn('java', ['-cp', tempDir, 'Main'], {
          cwd: tempDir,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, JAVA_TOOL_OPTIONS: '' }
        });

        this.handleProcess(runProcess, 'java', filePath, input, resolve);
      });

    } catch (error) {
      this.cleanupFiles('java', filePath);
      return {
        stdout: '',
        stderr: `Java compilation error: ${error.message}`,
        status: 'error'
      };
    }
  }

  async compileJava(filePath) {
    return new Promise((resolve) => {
      const compileProcess = spawn('javac', [filePath], {
        cwd: tmpdir(),
        stdio: 'pipe'
      });

      let compileStderr = '';

      compileProcess.stderr.on('data', (data) => {
        compileStderr += data.toString();
      });

      compileProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ status: 'done' });
        } else {
          resolve({
            stdout: '',
            stderr: `Java compilation failed: ${compileStderr}`,
            status: 'error'
          });
        }
      });

      compileProcess.on('error', (error) => {
        resolve({
          stdout: '',
          stderr: `Java compilation error: ${error.message}`,
          status: 'error'
        });
      });

      setTimeout(() => {
        if (!compileProcess.killed) {
          compileProcess.kill();
          resolve({
            stdout: '',
            stderr: 'Java compilation timeout',
            status: 'error'
          });
        }
      }, 10000);
    });
  }

  // ========== C ==========
  async runC(filePath, input) {
    const tempDir = tmpdir();
    
    try {
      console.log('🔨 Compiling C code...');
      
      const compileResult = await this.compileC(filePath);
      if (compileResult.status === 'error') {
        this.cleanupFiles('c', filePath);
        return compileResult;
      }

      console.log('✅ C compilation successful, now running...');

      return new Promise((resolve) => {
        const runProcess = spawn(`${filePath}.exe`, [], {
          cwd: tempDir,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        this.handleProcess(runProcess, 'c', filePath, input, resolve);
      });

    } catch (error) {
      this.cleanupFiles('c', filePath);
      return {
        stdout: '',
        stderr: `C compilation error: ${error.message}`,
        status: 'error'
      };
    }
  }

  async compileC(filePath) {
    return new Promise((resolve) => {
      const compileProcess = spawn('gcc', [filePath, '-o', `${filePath}.exe`], {
        cwd: tmpdir(),
        stdio: 'pipe'
      });

      let compileStderr = '';

      compileProcess.stderr.on('data', (data) => {
        compileStderr += data.toString();
      });

      compileProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ status: 'done' });
        } else {
          resolve({
            stdout: '',
            stderr: `C compilation failed: ${compileStderr}`,
            status: 'error'
          });
        }
      });

      compileProcess.on('error', (error) => {
        resolve({
          stdout: '',
          stderr: `C compilation error: ${error.message}`,
          status: 'error'
        });
      });

      setTimeout(() => {
        if (!compileProcess.killed) {
          compileProcess.kill();
          resolve({
            stdout: '',
            stderr: 'C compilation timeout',
            status: 'error'
          });
        }
      }, 10000);
    });
  }

  // ========== C++ ==========
  async runCpp(filePath, input) {
    const tempDir = tmpdir();
    
    try {
      console.log('🔨 Compiling C++ code...');
      
      const compileResult = await this.compileCpp(filePath);
      if (compileResult.status === 'error') {
        this.cleanupFiles('cpp', filePath);
        return compileResult;
      }

      console.log('✅ C++ compilation successful, now running...');

      return new Promise((resolve) => {
        const runProcess = spawn(`${filePath}.exe`, [], {
          cwd: tempDir,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        this.handleProcess(runProcess, 'cpp', filePath, input, resolve);
      });

    } catch (error) {
      this.cleanupFiles('cpp', filePath);
      return {
        stdout: '',
        stderr: `C++ compilation error: ${error.message}`,
        status: 'error'
      };
    }
  }

  async compileCpp(filePath) {
    return new Promise((resolve) => {
      const compileProcess = spawn('g++', [filePath, '-o', `${filePath}.exe`], {
        cwd: tmpdir(),
        stdio: 'pipe'
      });

      let compileStderr = '';

      compileProcess.stderr.on('data', (data) => {
        compileStderr += data.toString();
      });

      compileProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ status: 'done' });
        } else {
          resolve({
            stdout: '',
            stderr: `C++ compilation failed: ${compileStderr}`,
            status: 'error'
          });
        }
      });

      compileProcess.on('error', (error) => {
        resolve({
          stdout: '',
          stderr: `C++ compilation error: ${error.message}`,
          status: 'error'
        });
      });

      setTimeout(() => {
        if (!compileProcess.killed) {
          compileProcess.kill();
          resolve({
            stdout: '',
            stderr: 'C++ compilation timeout',
            status: 'error'
          });
        }
      }, 10000);
    });
  }

  // ========== JAVASCRIPT ==========
  async runJavaScript(filePath, input) {
    return new Promise((resolve) => {
      const childProcess = spawn('node', [filePath], {
        cwd: tmpdir(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.handleProcess(childProcess, 'javascript', filePath, input, resolve);
    });
  }

  // ========== UNIVERSAL PROCESS HANDLER ==========
  handleProcess(childProcess, language, filePath, input, resolve) {
    let stdout = '';
    let stderr = '';
    let inputSent = false;
    let hasPrompt = false;

    const sendInput = () => {
      if (!inputSent && input) {
        console.log(`📤 Sending input to ${language}: "${input}"`);
        childProcess.stdin.write(input + '\n');
        childProcess.stdin.end();
        inputSent = true;
      } else if (!input) {
        childProcess.stdin.end();
        inputSent = true;
      }
    };

    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(`📤 ${language} stdout: ${output.trim()}`);

      // Check for input prompts
      const lowerOutput = output.toLowerCase();
      const isPrompt = this.inputPrompts.some(prompt => lowerOutput.includes(prompt)) || 
                       output.includes(':') || output.includes('>') || 
                       output.includes('?') || output.includes('enter');

      if (isPrompt && !hasPrompt) {
        console.log(`🎯 Detected input prompt in ${language}`);
        hasPrompt = true;
        
        // Small delay to ensure prompt is fully displayed
        setTimeout(() => {
          sendInput();
        }, 100);
      }
    });

    childProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      
      // Filter out Java warnings
      if (language === 'java') {
        if (!errorOutput.includes('JAVA_TOOL_OPTIONS') && !errorOutput.includes('Picked up')) {
          stderr += errorOutput;
        }
      } else {
        stderr += errorOutput;
      }
      
      console.log(`❌ ${language} stderr: ${errorOutput.trim()}`);
    });

    // If no prompt detected within 1.5 seconds, send input anyway
    const inputTimeout = setTimeout(() => {
      if (!inputSent) {
        console.log(`⏰ No prompt detected in ${language}, sending input automatically`);
        sendInput();
      }
    }, 1500);

    childProcess.on('close', (code) => {
      clearTimeout(inputTimeout);
      this.cleanupFiles(language, filePath);

      // Clean Java output
      if (language === 'java') {
        stdout = this.cleanJavaOutput(stdout);
        stderr = this.cleanJavaOutput(stderr);
      }

      if (code === 0) {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          status: 'done'
        });
      } else {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim() || `${language} execution failed with code ${code}`,
          status: 'error'
        });
      }
    });

    childProcess.on('error', (error) => {
      clearTimeout(inputTimeout);
      this.cleanupFiles(language, filePath);
      resolve({
        stdout: stdout.trim(),
        stderr: `${language} execution error: ${error.message}`,
        status: 'error'
      });
    });

    // Overall timeout
    setTimeout(() => {
      if (!childProcess.killed) {
        childProcess.kill();
        resolve({
          stdout: stdout.trim(),
          stderr: `Execution timeout: ${language} code took too long to run`,
          status: 'error'
        });
      }
    }, 15000);
  }

  cleanJavaOutput(output) {
    if (!output) return '';
    
    const lines = output.split('\n').filter(line => 
      !line.includes('JAVA_TOOL_OPTIONS') && 
      !line.includes('Picked up JAVA_TOOL_OPTIONS') &&
      !line.trim().startsWith('Picked up')
    );
    
    return lines.join('\n').trim();
  }

  cleanupFiles(language, filePath) {
    try {
      const tempDir = tmpdir();
      
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }

      if (language === 'c' || language === 'cpp') {
        const exePath = filePath + '.exe';
        if (existsSync(exePath)) {
          unlinkSync(exePath);
        }
      }

      if (language === 'java') {
        const classPath = join(tempDir, 'Main.class');
        if (existsSync(classPath)) {
          unlinkSync(classPath);
        }
      }

    } catch (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.message);
    }
  }
}

module.exports = JavaScriptRunner;