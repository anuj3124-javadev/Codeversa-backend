const DockerRunner = require('./dockerRunner');
const { Run } = require('../models');

class EnhancedDockerRunner extends DockerRunner {
  constructor() {
    super();
    this.jobQueue = [];
    this.isProcessing = false;
  }

  async queueCodeExecution(userId, language, code, input = '') {
    try {
      const run = await Run.create({
        user_id: userId,
        language,
        input,
        status: 'queued'
      });

      this.jobQueue.push({ runId: run.id, userId, language, code, input });
      
      if (!this.isProcessing) {
        this.processQueue();
      }

      return run.id;
    } catch (error) {
      console.error('Error queuing code execution:', error);
      throw error;
    }
  }

  async processQueue() {
    if (this.isProcessing || this.jobQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.jobQueue.length > 0) {
      const job = this.jobQueue.shift();
      await this.executeJob(job);
    }

    this.isProcessing = false;
  }

  async executeJob(job) {
    try {
      await Run.update({ status: 'running' }, { where: { id: job.runId } });
      
      const result = await this.runCode(job.language, job.code, job.input);
      
      await Run.update({
        status: result.exitCode === 0 ? 'done' : 'error',
        stdout: result.stdout,
        stderr: result.stderr
      }, { where: { id: job.runId } });

    } catch (error) {
      console.error('Job execution error:', error);
      await Run.update({
        status: 'error',
        stderr: error.message
      }, { where: { id: job.runId } });
    }
  }

  async getJobStatus(runId) {
    return await Run.findByPk(runId);
  }
}

module.exports = EnhancedDockerRunner;