#!/bin/bash
set -e
exec > /var/log/userdata.log 2>&1

# ── System ────────────────────────────────────────────────────────────────
apt-get update -y
apt-get install -y ca-certificates curl gnupg git awscli

# ── Docker ────────────────────────────────────────────────────────────────
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# ── Clone repo ────────────────────────────────────────────────────────────
cd /home/ubuntu
git clone ${repo_url} Telecom-Churn-Intelligence
cd Telecom-Churn-Intelligence

# ── Resolve public IP ─────────────────────────────────────────────────────
PUBLIC_IP=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/public-ipv4 || echo "${fallback_ip}")

# ── Write .env ────────────────────────────────────────────────────────────
cat > .env <<EOF
GEMINI_API_KEY=${gemini_api_key}
MONGO_URI=${mongo_uri}
AI_SERVICE_URL=http://ai:8000
PASSWORD=${db_password}
VITE_API_URL=http://$PUBLIC_IP/api
JWT_SECRET=supersecretjwtkey2024
EOF

chown -R ubuntu:ubuntu /home/ubuntu/Telecom-Churn-Intelligence

# ── Build & start ─────────────────────────────────────────────────────────
docker compose build --build-arg VITE_API_URL=http://$PUBLIC_IP/api
docker compose up -d

echo "=== DEPLOY COMPLETE ==="
echo "App running at: http://$PUBLIC_IP"
