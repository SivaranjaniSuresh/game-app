
resource "aws_autoscaling_group" "ecs-autoscaling-group" {
    name                        = "ecs-autoscaling-group"
    max_size                    = "${var.max_instance_size}"
    min_size                    = "${var.min_instance_size}"
    desired_capacity            = "${var.desired_capacity}"
    vpc_zone_identifier         = ["${aws_subnet.test_public_sn_01.id}", "${aws_subnet.test_public_sn_02.id}"]
    
    # deprecating (AWS launch configuration)
    launch_configuration        = "${aws_launch_configuration.ecs-launch-twtr-configuration.name}"
    
    # new: AWS launch template, could not make it work due to base64-encode of user data
    # launch_template {
    #   id      = aws_launch_template.ecs-launch-twtr-template.id
    #   version = "$Latest"
    # }
    
    health_check_type           = "ELB"
  }
