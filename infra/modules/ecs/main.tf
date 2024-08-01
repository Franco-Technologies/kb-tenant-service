resource "aws_ecs_task_definition" "app" {
  family                   = "${var.env}-tenant-management-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = var.exec_role_arn
  container_definitions = jsonencode([
    {
      name  = "tenant-management-container"
      image = var.container_image
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/tenant-management"
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_cloudwatch_log_group" "app" {
  name = "/ecs/tenant-management"
}

resource "aws_security_group" "app" {
  name        = "${var.env}-tenant-management-sg"
  description = "Security group for the tenant management service"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow traffic from the load balancer
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [var.load_balancer_sg_id]
  }

}

resource "aws_ecs_service" "app" {
  name                 = "${var.env}-tenant-management-service"
  cluster              = var.cluster_arn
  task_definition      = aws_ecs_task_definition.app.arn
  launch_type          = "FARGATE"
  desired_count        = var.service_desired_count
  force_new_deployment = var.force_new_deployment

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "tenant-management-container"
    container_port   = 3000
  }
}

resource "aws_lb_target_group" "app" {
  name        = "${var.env}-tenant-management-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
}

resource "aws_lb_listener_rule" "app" {
  listener_arn = var.listener_arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  condition {
    path_pattern {
      values = ["/tenant-management/*"]
    }
  }
}
