function ts() { return new Date().toISOString().replace('T',' ').split('.')[0]; }
module.exports = {
  info: (m, meta) => console.log(`[${ts()}] [INFO] ${m}${meta? ' ' + JSON.stringify(meta):''}`),
  warn: (m, meta) => console.warn(`[${ts()}] [WARN] ${m}${meta? ' ' + JSON.stringify(meta):''}`),
  error: (m, meta) => console.error(`[${ts()}] [ERROR] ${m}${meta? ' ' + JSON.stringify(meta):''}`)
};
