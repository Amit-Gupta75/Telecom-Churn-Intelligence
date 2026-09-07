#!/usr/bin/env bash
set -e

TERRAFORM_DIR="$(cd "$(dirname "$0")/terraform" && pwd)"
CMD="${1:-help}"

info() { echo -e "\033[1;34m[INFO]\033[0m  $*"; }
ok()   { echo -e "\033[1;32m[OK]\033[0m    $*"; }
die()  { echo -e "\033[1;31m[ERROR]\033[0m $*"; exit 1; }

check_aws_env() {
  [ -z "$AWS_ACCESS_KEY_ID" ]     && die "Set AWS_ACCESS_KEY_ID env var first"
  [ -z "$AWS_SECRET_ACCESS_KEY" ] && die "Set AWS_SECRET_ACCESS_KEY env var first"
  ok "AWS credentials found in environment"
}

check_tf_vars() {
  [ -z "$TF_VAR_gemini_api_key" ] && die "Set TF_VAR_gemini_api_key env var first"
  [ -z "$TF_VAR_mongo_uri" ]      && die "Set TF_VAR_mongo_uri env var first"
  [ -z "$TF_VAR_db_password" ]    && die "Set TF_VAR_db_password env var first"
  [ -z "$TF_VAR_ssh_public_key" ] && die "Set TF_VAR_ssh_public_key env var first"
  ok "Terraform variables found in environment"
}

check_deps() {
  command -v terraform &>/dev/null || die "Terraform not installed. See: https://developer.hashicorp.com/terraform/install"
  command -v aws       &>/dev/null || die "AWS CLI not installed."
}

cd "$TERRAFORM_DIR"

case "$CMD" in

  start)
    check_deps
    check_aws_env
    check_tf_vars
    info "Initialising Terraform..."
    terraform init -upgrade

    info "Planning..."
    terraform plan -out=tfplan

    info "Applying (this takes ~3 min)..."
    terraform apply tfplan

    ok "Infrastructure is UP!"
    terraform output
    ;;

  stop)
    check_deps
    check_aws_env
    info "This will DESTROY all AWS resources created by Terraform."
    read -rp "Type 'yes' to confirm: " confirm
    [ "$confirm" = "yes" ] || { echo "Aborted."; exit 0; }

    terraform destroy -auto-approve
    ok "All resources destroyed."
    ;;

  status)
    check_deps
    check_aws_env
    terraform output 2>/dev/null || info "No infrastructure deployed yet. Run: ./terraform.sh start"
    ;;

  plan)
    check_deps
    check_aws_env
    check_tf_vars
    terraform init -upgrade -reconfigure
    terraform plan
    ;;

  ssh)
    IP=$(terraform output -raw ec2_public_ip 2>/dev/null) || die "No EC2 deployed. Run: ./terraform.sh start"
    info "Connecting to ubuntu@$IP ..."
    ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa "ubuntu@$IP"
    ;;

  help|*)
    echo ""
    echo "Usage: ./terraform.sh <command>"
    echo ""
    echo "  start   — Provision EC2, VPC, ECR, Security Groups on AWS"
    echo "  stop    — Destroy ALL AWS resources (stops billing)"
    echo "  status  — Show deployed resource URLs / IPs"
    echo "  plan    — Dry-run (show what will be created, no changes)"
    echo "  ssh     — SSH into the EC2 instance"
    echo ""
    echo "Required env vars before running:"
    echo "  export AWS_ACCESS_KEY_ID=<your-key>"
    echo "  export AWS_SECRET_ACCESS_KEY=<your-secret>"
    echo "  export TF_VAR_gemini_api_key=<your-gemini-key>"
    echo "  export TF_VAR_mongo_uri='mongodb+srv://...'"
    echo "  export TF_VAR_db_password=<your-db-password>"
    echo "  export TF_VAR_ssh_public_key=\"\$(cat ~/.ssh/id_rsa.pub)\""
    echo ""
    ;;
esac
