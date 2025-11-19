const Docker = require('dockerode');
const { PassThrough } = require('stream');
const config = require('../config/env');

class DockerRunner {
  constructor() {
    try {
      this.docker = new Docker({
        host: config.docker.host,
        port: process.env.DOCKER_PORT || 2375
      });
      console.log('✅ Docker runner initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Docker runner:', error);
      this.docker = null;
    }
  }

  getImageForLanguage(language) {
    const images = {
      'python': 'python:3.9-alpine',
      'java': 'openjdk:11-jdk-slim',
      'c': 'gcc:latest',
      'cpp': 'gcc:latest',
      'javascript': 'node:16-alpine'
    };
    return images[language.toLowerCase()] || 'python:3.9-alpine';
  }

  getExecutionCommand(language, code) {
    const base64Code = Buffer.from(code).toString('base64');
    
    const commands = {
      'python': `echo "${base64Code}" | base64 -d > main.py && python3 main.py`,
      'java': `echo "${base64Code}" | base64 -d > Main.java && javac Main.java && java Main`,
      'c': `echo "${base64Code}" | base64 -d > main.c && gcc main.c -o main && ./main`,
      'cpp': `echo "${base64Code}" | base64 -d > main.cpp && g++ main.cpp -o main && ./main`,
      'javascript': `echo "${base64Code}" | base64 -d > script.js && node script.js`
    };
    
    return commands[language.toLowerCase()] || `echo "${base64Code}" | base64 -d > main.py && python3 main.py`;
  }

  async runCode(language, code, input = '') {
    if (!this.docker) {
      throw new Error('Docker is not available. Please ensure Docker is running.');
    }

    console.log(`🚀 Executing ${language} code...`);

    try {
      // Create container
      const container = await this.docker.createContainer({
        Image: this.getImageForLanguage(language),
        Cmd: ['sh', '-c', this.getExecutionCommand(language, code)],
        AttachStdout: true,
        AttachStderr: true,
        Tty: false,
        OpenStdin: true,
        StdinOnce: false,
        NetworkDisabled: true,
        HostConfig: {
          AutoRemove: true,
          NetworkMode: 'none',
          Memory: 256 * 1024 * 1024,
          MemorySwap: 512 * 1024 * 1024,
        }
      });

      console.log('📦 Container created, starting...');

      // Start container
      await container.start();

      // Handle input if provided
      if (input) {
        const stdinStream = await container.attach({
          stream: true,
          stdin: true,
          stdout: false,
          stderr: false
        });
        
        stdinStream.write(input + '\n');
        stdinStream.end();
      }

      // Attach to container output
      const stream = await container.attach({
        stream: true,
        stdin: false,
        stdout: true,
        stderr: true
      });

      // Collect output
      let stdout = '';
      let stderr = '';

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(async () => {
          console.log('⏰ Execution timeout');
          try {
            await container.stop();
            resolve({
              stdout: stdout,
              stderr: stderr + '\n⏰ Execution timeout (10 seconds)',
              exitCode: -1
            });
          } catch (error) {
            resolve({
              stdout: stdout,
              stderr: stderr + '\n⏰ Execution timeout',
              exitCode: -1
            });
          }
        }, 10000); // 10 second timeout

        container.wait().then(async (result) => {
          clearTimeout(timeout);
          console.log('✅ Execution completed with exit code:', result.StatusCode);
          
          // Wait a bit for all output to be captured
          setTimeout(async () => {
            try {
              await container.remove();
            } catch (e) {
              // Container already auto-removed
            }
            
            resolve({
              stdout: stdout.trim(),
              stderr: stderr.trim(),
              exitCode: result.StatusCode
            });
          }, 100);
        }).catch(reject);

        // Capture stdout
        stream.on('data', (chunk) => {
          const output = chunk.toString();
          stdout += output;
          console.log('📤 Output:', output);
        });

        // Capture stderr
        stream.on('error', (error) => {
          stderr += error.toString();
          console.log('❌ Error:', error);
        });
      });

    } catch (error) {
      console.error('💥 Execution error:', error);
      throw new Error(`Failed to execute code: ${error.message}`);
    }
  }
}

module.exports = DockerRunner;