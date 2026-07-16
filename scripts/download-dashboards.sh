#!/usr/bin/env bash
# Downloads community Grafana dashboards from grafana.com into infrastructure/grafana/dashboards/.
# Requires: curl, jq
# Usage: ./scripts/download-dashboards.sh
set -euo pipefail

DASHBOARDS_DIR="$(cd "$(dirname "$0")/.." && pwd)/infrastructure/grafana/dashboards"

download_dashboard() {
  local id=$1
  local name=$2
  local out="${DASHBOARDS_DIR}/${name}.json"
  echo "  → $name (ID: $id)"
  local revision
  revision=$(curl -fsSL "https://grafana.com/api/dashboards/${id}" | jq -r '.revision')
  curl -fsSL "https://grafana.com/api/dashboards/${id}/revisions/${revision}/download" -o "$out"
  # Replace datasource variable placeholders with the provisioned UID so file-based
  # provisioning works without the import wizard mapping step.
  sed -i 's/\${DS_PROMETHEUS}/prometheus/g; s/\${DS_PROM}/prometheus/g' "$out"
  jq 'del(.__inputs) | del(.__requires)' "$out" > "${out}.tmp" && mv "${out}.tmp" "$out"
}

echo "Downloading Grafana dashboards to ${DASHBOARDS_DIR}/"
download_dashboard 10991 "rabbitmq-overview"
download_dashboard 9628  "postgresql"
download_dashboard 1860  "node-exporter-full"
download_dashboard 763   "redis"
echo "Done. Restart Grafana to pick up new dashboards."
