output "frontend_url" {
  description = "URL pública de la consola SHRTN en CloudFront"
  value       = "https://${aws_cloudfront_distribution.cdn.domain_name}"
}