
resource "aws_alb" "ecs-load-balancer" {
    name                = "ecs-load-balancer"
    internal            = false
    load_balancer_type  = "application"
    security_groups     = ["${aws_security_group.test_public_sg.id}"]
    subnets             = ["${aws_subnet.test_public_sn_01.id}", "${aws_subnet.test_public_sn_02.id}"]

    tags = {
      Name = "ecs-load-balancer"
    }
}

resource "aws_alb_target_group" "ecstargetgroupfe" {
    name                = "ecstargetgroupfe"
    port                = "80"
    protocol            = "HTTP"
    #port              = "443"
    #protocol          = "HTTPS"
    #ssl_policy        = "ELBSecurityPolicy-2016-08"
    #certificate_arn   = "arn:aws:acm:eu-central-1:1222:certificate/xxx"
    vpc_id              = "${aws_vpc.test_vpc.id}"

    health_check {
        healthy_threshold   = "5"
        unhealthy_threshold = "2"
        interval            = "30"
        matcher             = "200"
        path                = "/"
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = "5"
    }

    tags = {
      Name = "ecstargetgroupfe"
    }
}

resource "aws_alb_target_group" "ecstargetgroupbe" {
    name                = "ecstargetgroupbe"
    port                = "5000"
    protocol            = "HTTP"
    vpc_id              = "${aws_vpc.test_vpc.id}"

    health_check {
        healthy_threshold   = "5"
        unhealthy_threshold = "2"
        interval            = "30"
        matcher             = "200"
        path                = "/doc"
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = "5"
    }

    tags = {
      Name = "ecstargetgroupbe"
    }
}

resource "aws_alb_listener" "alb_listener" {
    load_balancer_arn = "${aws_alb.ecs-load-balancer.arn}"
    port              = "80"
    protocol          = "HTTP"

    default_action {
        type = "forward"
        forward {
            target_group {
                arn = "${aws_alb_target_group.ecstargetgroupbe.arn}"
            }

            target_group {
                arn = "${aws_alb_target_group.ecstargetgroupfe.arn}"
            }

            stickiness {
                enabled  = true
                duration = 28800
            }
        }
    }
}

resource "aws_lb_listener_rule" "static_be" {
  listener_arn = aws_alb_listener.alb_listener.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.ecstargetgroupbe.arn
  }

  condition {
    path_pattern {
      values = ["/doc", "/tweet*", "/login", "/fastlogin"]
    }
  }
}
