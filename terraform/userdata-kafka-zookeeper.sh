#!/bin/bash

# Update and install necessary dependencies
sudo apt update -y && sudo apt upgrade -y
sudo apt install -y openjdk-11-jdk wget net-tools

# Set Java environment variables
echo "JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))" >> /etc/environment
source /etc/environment

# Create directories for Kafka and Zookeeper
KAFKA_VERSION="3.5.1"
SCALA_VERSION="2.13"
KAFKA_DIR="/opt/kafka"
mkdir -p $KAFKA_DIR

# Download and extract Kafka
wget https://downloads.apache.org/kafka/$KAFKA_VERSION/kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz -O /tmp/kafka.tgz
tar -xvf /tmp/kafka.tgz -C $KAFKA_DIR --strip-components=1
rm /tmp/kafka.tgz

# Set Kafka environment variables
echo "KAFKA_HOME=$KAFKA_DIR" >> /etc/environment
source /etc/environment

# Configure Zookeeper properties
cat <<EOF > $KAFKA_DIR/config/zookeeper.properties
tickTime=2000
dataDir=/tmp/zookeeper
clientPort=2181
maxClientCnxns=0
EOF

# Configure Kafka server properties
cat <<EOF > $KAFKA_DIR/config/server.properties
broker.id=0
log.dirs=/tmp/kafka-logs
zookeeper.connect=localhost:2181
num.network.threads=3
num.io.threads=8
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
zookeeper.connection.timeout.ms=6000
EOF

# Start Zookeeper
nohup $KAFKA_DIR/bin/zookeeper-server-start.sh $KAFKA_DIR/config/zookeeper.properties > /tmp/zookeeper.log 2>&1 &

# Start Kafka
nohup $KAFKA_DIR/bin/kafka-server-start.sh $KAFKA_DIR/config/server.properties > /tmp/kafka.log 2>&1 &

# Output success message
echo "Kafka and Zookeeper setup completed successfully"
