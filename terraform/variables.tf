variable "frontend_distribution_files" {
  type = map(string)
  default = {
    "index.html" = "text/html"
    "app.js"     = "application/javascript"
    "style.css"  = "text/css"
  }
}