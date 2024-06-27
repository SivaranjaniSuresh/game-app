ecs_cluster           = "gameapp-tf-cluster"
ecs_key_pair_name     = "DevOps-Key1"
region                = "us-west-2"
availability_zone     = "us-west-2a"
test_vpc              = "twtr_vpc"
test_network_cidr     = "10.0.0.0/16"
test_public_01_cidr   = "10.0.0.0/24"
test_public_02_cidr   = "10.0.10.0/24"
max_instance_size     = 2
min_instance_size     = 2
desired_capacity      = 2
