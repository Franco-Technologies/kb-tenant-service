
resource "aws_api_gateway_resource" "this" {
  rest_api_id = var.rest_api_id
  parent_id   = var.root_resource_id
  path_part   = "tenant-management"
}

resource "aws_api_gateway_method" "this" {
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.this.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_apigatewayv2_vpc_link" "this" {
  name               = var.vpc_link_name
  security_group_ids = [var.security_group_id]
  subnet_ids         = var.subnet_ids

  tags = var.tags
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.this.id
  http_method             = "ANY"
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = var.load_balancer_url
  connection_type         = "VPC_LINK"
  connection_id           = aws_api_gateway_vpc_link.this.id
}

resource "aws_api_gateway_deployment" "this" {
  depends_on  = [aws_api_gateway_integration.integration]
  rest_api_id = var.rest_api_id
  stage_name  = var.stage_name
}
