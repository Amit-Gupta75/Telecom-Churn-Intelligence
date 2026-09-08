variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "project" {
  type    = string
  default = "telecom-churn-intel"
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "ssh_public_key" {
  type = string
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "mongo_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "MongoDB Atlas password (also used as PASSWORD env var)"
  type        = string
  sensitive   = true
}

variable "repo_url" {
  description = "GitHub repo HTTPS URL to clone on EC2"
  type        = string
  default     = "https://github.com/<your-username>/Telecom-Churn-Intelligence.git"
}

variable "fallback_ip" {
  type    = string
  default = ""
}
