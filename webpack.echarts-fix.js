/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Webpack plugin to fix EPERM errors on echarts sankey install.js
 * by replacing file reads with a stub file using multiple hooks
 */
const path = require('path');
const fs = require('fs');

class EchartsPermissionFixPlugin {
  apply(compiler) {
    const stubPath = path.resolve(__dirname, 'src/utils/echarts-sankey-stub.js');
    const problematicPath = path.resolve(__dirname, 'node_modules/echarts/lib/chart/sankey/install.js');
    
    // Intercept at multiple points to catch the file access
    compiler.hooks.normalModuleFactory.tap('EchartsPermissionFixPlugin', (nmf) => {
      // Hook 1: Before resolve
      nmf.hooks.beforeResolve.tap('EchartsPermissionFixPlugin', (data) => {
        if (data && data.request) {
          if (data.request.includes('echarts/lib/chart/sankey/install.js') || 
              data.request === problematicPath ||
              data.request.endsWith('sankey/install.js')) {
            data.request = stubPath;
          }
        }
      });
      
      // Hook 2: After resolve
      nmf.hooks.afterResolve.tap('EchartsPermissionFixPlugin', (data) => {
        if (data && data.resource) {
          if (data.resource === problematicPath || 
              data.resource.includes('echarts/lib/chart/sankey/install.js')) {
            data.resource = stubPath;
          }
        }
      });
    });
    
    // Override file system to intercept reads
    compiler.hooks.environment.tap('EchartsPermissionFixPlugin', () => {
      const originalReadFileSync = fs.readFileSync;
      fs.readFileSync = function(filePath, ...args) {
        const filePathStr = String(filePath || '');
        if (filePathStr === problematicPath || filePathStr.includes('echarts/lib/chart/sankey/install.js')) {
          return originalReadFileSync.call(this, stubPath, ...args);
        }
        return originalReadFileSync.call(this, filePath, ...args);
      };
    });
  }
}

module.exports = EchartsPermissionFixPlugin;
