/**
 * Stub file for echarts sankey install.js when permission errors occur
 * This is a workaround for EPERM errors on macOS
 * Since we're using IgnorePlugin to ignore sankey charts, this just exports an empty function
 */
export function install(registers) {
  // Empty install function - sankey charts are not used in this application
  // This stub exists only to prevent EPERM errors when webpack tries to read the original file
}
