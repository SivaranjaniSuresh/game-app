data "aws_ecs_task_definition" "backend_td" {
  task_definition = "${aws_ecs_task_definition.backend_td.family}"
}

data "aws_ecs_task_definition" "frontend_td" {
  task_definition = "${aws_ecs_task_definition.frontend_td.family}"
}

# For task definitions that only specify EC2 for the requiresCompatibilities parameter, 
# the supported CPU values are between 256 CPU units (0.25 vCPUs) and 16384 CPU units 
# (16 vCPUs). For task definitions that specify FARGATE for the requiresCompatibilities 
# parameter (even if EC2 is also specified), you must use one of the values in the 
# following table: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-cpu-memory-error.html

resource "aws_ecs_task_definition" "backend_td" {
    family                = "backend"
    container_definitions = <<DEFINITION
[
  {
    "name": "backend",
    "image": "975050125209.dkr.ecr.us-west-2.amazonaws.com/gameapp-fe",
    "essential": true,
    "portMappings": [
      {
        "containerPort": 5000,
        "hostPort": 0
      }
    ],
    "memory": 300,
    "cpu": 10
  }
]
DEFINITION
}

resource "aws_ecs_task_definition" "frontend_td" {
    family                = "frontend"
    container_definitions = <<DEFINITION
[
  {
    "name": "frontend",
    "image": "975050125209.dkr.ecr.us-west-2.amazonaws.com/gameapp-fe",
    "essential": true,
    "portMappings": [
      {
        "containerPort": 80,
        "hostPort": 0
      }
    ],
    "memory": 300,
    "cpu": 10
  }
]
DEFINITION
}
