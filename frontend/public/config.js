// Configuration runtime - sera remplacée au démarrage du container
window.ENV = {
  VITE_API_URL: import.meta?.env?.VITE_API_URL || 'http://localhost:3000'
};
