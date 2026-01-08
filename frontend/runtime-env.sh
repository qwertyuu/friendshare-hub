#!/bin/sh
# Script exécuté automatiquement par nginx:alpine avant de démarrer Nginx
# Les scripts dans /docker-entrypoint.d/ sont executés dans l'ordre alphabétique

set -e

echo "🔧 Injection de la configuration runtime..."

# Créer le fichier de configuration JavaScript
cat <<EOF > /usr/share/nginx/html/config.js
window.ENV = {
  VITE_API_URL: '${VITE_API_URL:-/api}'
};
EOF

echo "✅ Configuration runtime créée : VITE_API_URL=${VITE_API_URL:-/api}"

# Pas besoin de démarrer Nginx - le script par défaut de nginx:alpine s'en charge
