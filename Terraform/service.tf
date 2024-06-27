resource "aws_ecs_service" "backend-ecs-service" {
  	name            = "backend-ecs-service"

	# Error: creating ECS Service (backend-ecs-service): InvalidParameterException: 
	# You cannot specify an IAM role for services that require a service linked role
  	#iam_role        = "${aws_iam_role.ecs-service-role.name}"

  	cluster         = "${aws_ecs_cluster.my-ecs-cluster.id}"
  	task_definition = "${aws_ecs_task_definition.backend_td.family}:${max("${aws_ecs_task_definition.backend_td.revision}", "${data.aws_ecs_task_definition.backend_td.revision}")}"
  	desired_count   = 1
	launch_type      = "EC2"
	#launch_type      = "FARGATE"
  	#platform_version = "LATEST"
  	scheduling_strategy = "REPLICA"

	#network_configuration {
	#	assign_public_ip = true
	#	security_groups  = ["${aws_security_group.test_public_sg.id}"]
	#	subnets          = ["${aws_subnet.test_public_sn_01.id}", "${aws_subnet.test_public_sn_02.id}"]
	#}

  	load_balancer {
    	target_group_arn  = "${aws_alb_target_group.ecstargetgroupbe.arn}"
    	container_port    = 5000
    	container_name    = "backend"
	}
}

resource "aws_ecs_service" "frontend-ecs-service" {
  	name            = "frontend-ecs-service"

	# Error: creating ECS Service (backend-ecs-service): InvalidParameterException: 
	# You cannot specify an IAM role for services that require a service linked role
  	#iam_role        = "${aws_iam_role.ecs-service-role.name}"

  	cluster         = "${aws_ecs_cluster.my-ecs-cluster.id}"
  	task_definition = "${aws_ecs_task_definition.frontend_td.family}:${max("${aws_ecs_task_definition.frontend_td.revision}", "${data.aws_ecs_task_definition.frontend_td.revision}")}"
  	desired_count   = 1
	launch_type      = "EC2"
  	scheduling_strategy = "REPLICA"

	# network_configuration {
	# 	assign_public_ip = true
	# 	security_groups  = ["${aws_security_group.test_public_sg.id}"]
	# 	subnets          = ["${aws_subnet.test_public_sn_01.id}", "${aws_subnet.test_public_sn_02.id}"]
	# }

  	load_balancer {
    	target_group_arn  = "${aws_alb_target_group.ecstargetgroupfe.arn}"
    	container_port    = 80
    	container_name    = "frontend"
	}
}
