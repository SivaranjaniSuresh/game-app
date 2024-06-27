resource "aws_launch_configuration" "ecs-launch-twtr-configuration" {
    name                        = "ecs-launch-twtr-configuration"
    image_id                    = "ami-0b20a6f09484773af"
    instance_type               = "m4.xlarge"
    iam_instance_profile        = "${aws_iam_instance_profile.ecs-instance-profile-tf.id}"
    
    root_block_device {
      volume_type = "standard"
      volume_size = 100
      delete_on_termination = true
    }

    lifecycle {
      create_before_destroy = true
    }

    security_groups             = ["${aws_security_group.test_public_sg.id}"]
    associate_public_ip_address = "true"
    key_name                    = "${var.ecs_key_pair_name}"
    user_data                   = <<EOF
                                  #!/bin/bash
                                  echo ECS_CLUSTER=${var.ecs_cluster} >> /etc/ecs/ecs.config
                                  EOF
}


# Would like to turn this on but I have a problem with user_data below...

# Looks like AWS is migrating from launch configurations to launch templates
# See here: https://docs.aws.amazon.com/autoscaling/ec2/userguide/launch-templates.html
# "Not all Amazon EC2 Auto Scaling features are available when you use launch configurations"
# "With launch templates, you can also use newer features of Amazon EC2. This includes 
# (...) T2 Unlimited instances, Capacity Reservations.."
# Tt appears that most of the arguments in aws_launch_configuration are supported by 
# aws_launch_template.
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/launch_template

# resource "aws_launch_template" "ecs-launch-twtr-template" {
#     name_prefix                 = "ecs-twtr-template"
#     image_id                    = "ami-fad25980"
#     instance_type               = "t2.xlarge"

#     iam_instance_profile {
#       name = "ecsInstanceRole"
#     }

#     block_device_mappings {
#       device_name = "/dev/xvda"
#       ebs {
#         volume_size = 30
#         volume_type = "gp2"
#       }
#     }
    
#     network_interfaces {
#       associate_public_ip_address = true
#     }

#     placement {
#       availability_zone = "${data.aws_availability_zones.available.names[0]}"
#     }

#     lifecycle {
#       create_before_destroy = true
#     }

#     vpc_security_group_ids = ["${aws_security_group.test_public_sg.id}"]
#     key_name                    = "${var.ecs_key_pair_name}"

#     # Error: creating EC2 Launch Template (ecs-twtr-template20240620002619465100000005): 
#     # operation error EC2: CreateLaunchTemplate, https response error StatusCode: 400, 
#     # RequestID: 4020c18f-b3fb-4e74-a784-a08489a017a5, api error 
#     # InvalidUserData.Malformed: Invalid BASE64 encoding of user data.
#     # I think I need something like this: user_data = filebase64("${path.module}/example.sh")
#     # Who can make this work?
#     user_data                   = <<EOF
#                                   #!/bin/bash
#                                   echo ECS_CLUSTER=${var.ecs_cluster} >> /etc/ecs/ecs.config
#                                   EOF
# }
