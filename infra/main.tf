locals { env = var.is_prod_branch == true ? ["prod"] : ["dev"] }

module "ecs" {
  source = "./modules/ecs"
  # Environment-specific variables
  env               = var.env
  vpc_id            = var.vpc_id
  cluster_arn       = var.cluster_arn
  subnet_ids        = var.subnet_ids
  container_image   = var.container_image
  security_group_id = var.security_group_id
  listener_arn      = var.listener_arn
}

module "api_gateway" {
  source = "./modules/api_gateway"
  # Environment-specific variables
  stage_name        = var.env
  vpc_link_name     = "ecs-vpc-link"
  load_balancer_url = var.load_balance_url
  rest_api_id       = var.rest_api_id
  root_resource_id  = var.root_resource_id
  tags = {
    Environment = "dev"
    Project     = "example"
  }
}
