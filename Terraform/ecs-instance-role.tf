resource "aws_iam_role" "ecs-instance-role-tf" {
    name                = "ecs-instance-role-tf"
    path                = "/"
    assume_role_policy  = "${data.aws_iam_policy_document.ecs-instance-policy.json}"
}

data "aws_iam_policy_document" "ecs-instance-policy" {
    statement {
        actions = ["sts:AssumeRole"]

        principals {
            type        = "Service"
            identifiers = ["ec2.amazonaws.com"]
        }
    }
}

resource "aws_iam_role_policy_attachment" "ecs-instance-role-attachment" {
    role       = "${aws_iam_role.ecs-instance-role-tf.name}"
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs-instance-profile-tf" {
    name = "ecs-instance-profile-tf"
    path = "/"
    role = "${aws_iam_role.ecs-instance-role-tf.name}"
    provisioner "local-exec" {
     command = "sleep 10"
    }
    # provisioner "local-exec" {
    #   command = "powershell.exe -Command \"Start-Sleep -Seconds 10\""
    # }
}
