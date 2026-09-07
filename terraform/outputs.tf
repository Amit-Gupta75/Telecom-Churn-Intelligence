output "ec2_public_ip" {
  value = aws_eip.app.public_ip
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app.public_ip}"
}

output "frontend_url" {
  value = "http://${aws_eip.app.public_ip}"
}

output "backend_url" {
  value = "http://${aws_eip.app.public_ip}:5000"
}

output "ai_url" {
  value = "http://${aws_eip.app.public_ip}:8001"
}

output "ecr_ai_url" {
  value = aws_ecr_repository.ai.repository_url
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}
