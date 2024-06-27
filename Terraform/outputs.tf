output "region" {
  value = "${var.region}"
}

output "test_vpc_id" {
  value = "${aws_vpc.test_vpc.id}"
}

output "test_public_sn_01_id" {
  value = "${aws_subnet.test_public_sn_01.id}"
}

output "test_public_sn_02_id" {
  value = "${aws_subnet.test_public_sn_02.id}"
}

output "test_public_sg_id" {
  value = "${aws_security_group.test_public_sg.id}"
}

output "ecs-service-role-arn" {
  value = "${aws_iam_role.ecs-service-role.arn}"
}

output "ecs-instance-role-name" {
  value = "${aws_iam_role.ecs-instance-role-tf.name}"
}

output "ecs-load-balancer-name" {
    value = "${aws_alb.ecs-load-balancer.name}"
}

output "ecs-load-balancer-dns-name" {
  description = "The DNS name of the created ELB"
  value = "${aws_alb.ecs-load-balancer}"
}

output "ecs-target-group-be-arn" {
    value = "${aws_alb_target_group.ecstargetgroupbe.arn}"
}

output "ecs-target-group-fe-arn" {
    value = "${aws_alb_target_group.ecstargetgroupfe.arn}"
}
