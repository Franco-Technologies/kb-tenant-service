output "service_name" {
  value = aws_ecs_service.app.name
}

output "service_url" {
  value = aws_ecs_service.app.load_balancer
}

output "ecs_service_id" {
  value = aws_ecs_service.app.id
}
