import { logError, ERROR_SEVERITY } from './errorHandler';

/**
 * A generic function to handle file exports using a web worker.
 * @param {Array} houses - The data to be exported.
 * @param {'excel' | 'pdf'} format - The desired output format.
 * @param {string} baseFilename - The base name for the downloaded file.
 * @returns {Promise<void>} A promise that resolves when the download is initiated, or rejects on error.
 */
const exportWithWorker = (houses, format, baseFilename) => {
  return new Promise((resolve, reject) => {
    // Ensure browser supports web workers
    if (!window.Worker) {
      const errorMsg = 'Your browser does not support Web Workers, which are required for exports.';
      logError(new Error(errorMsg), 'Export Worker', ERROR_SEVERITY.HIGH);
      return reject(new Error(errorMsg));
    }

    // Create a new worker instance.
    // Note: In Create React App, the worker file needs to be in the `public` folder
    // or you need a tool like `craco` to configure it. For this context, we assume it's correctly handled.
    const worker = new Worker(new URL('../workers/export.worker.js', import.meta.url));

    // Listen for messages from the worker
    worker.onmessage = (event) => {
      const { success, blob, error } = event.data;

      if (success && blob) {
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a temporary link to trigger the download
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().split('T')[0];
        a.download = `${baseFilename}-${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

        // Trigger the download and clean up
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        resolve();
      } else {
        const errorMsg = error || 'An unknown error occurred in the export worker.';
        logError(new Error(errorMsg), `Export Worker (${format})`, ERROR_SEVERITY.HIGH);
        reject(new Error(errorMsg));
      }

      // Terminate the worker to free up resources
      worker.terminate();
    };

    // Handle errors in the worker
    worker.onerror = (error) => {
      const errorMsg = `An error occurred in the export worker: ${error.message}`;
      logError(error, `Export Worker (${format})`, ERROR_SEVERITY.HIGH);
      reject(new Error(errorMsg));
      worker.terminate();
    };

    // Send data to the worker to start the process
    worker.postMessage({ houses, format });
  });
};

/**
 * Export houses data to Excel using a Web Worker.
 * @param {Array} houses - Houses data to export.
 * @param {string} filename - Optional filename.
 */
export const exportToExcel = (houses, filename = 'houses-data') => {
  if (!Array.isArray(houses) || houses.length === 0) {
    return Promise.reject(new Error('No houses data to export.'));
  }
  return exportWithWorker(houses, 'excel', filename);
};

/**
 * Export houses data to PDF using a Web Worker.
 * @param {Array} houses - Houses data to export.
 * @param {string} filename - Optional filename.
 */
export const exportToPDF = (houses, filename = 'houses-data') => {
  if (!Array.isArray(houses) || houses.length === 0) {
    return Promise.reject(new Error('No houses data to export.'));
  }
  return exportWithWorker(houses, 'pdf', filename);
};
