provider "aws" {
  region = var.region
}



resource "aws_instance" "ec2_instance" {
  ami                  = "ami-0db929b647d69d379"
  instance_type        = "t2.micro"
  user_data = <<-EOF
    #!/bin/bash
    KAFKA_DIR="/home/ssm-user/solve/kafka_2.13-3.6.0"
    SOLVE_DIR="/home/ssm-user/solve"
    sudo -u ssm-user nohup $KAFKA_DIR/bin/zookeeper-server-start.sh $KAFKA_DIR/config/zookeeper.properties > $SOLVE_DIR/zookeeper.log 2>&1 &
    sudo -u ssm-user nohup $KAFKA_DIR/bin/kafka-server-start.sh $KAFKA_DIR/config/server.properties > $SOLVE_DIR/kafka.log 2>&1 &
  EOF

  tags = {
    Name = "Riplcode-SSM-Enabled-Instance"
  }
}


output "instance_id" {
  value = aws_instance.ec2_instance.id
}

output "aws_region" {
  value = var.region
}