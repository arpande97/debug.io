# debug.io

A modern web-based debugging and remote system management platform built with Next.js and AWS integration.

## 🚀 Features

- Real-time terminal access via web interface
- AWS EC2 instance management
- Secure SSH connections
- AWS Systems Manager integration
- Modern, responsive UI built with Tailwind CSS
- Authentication powered by NextAuth.js

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- AWS account with appropriate credentials
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd debug.io
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
# AWS Configuration
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Additional configuration as needed
```

## 🚀 Development

To run the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🏗️ Building for Production

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## 🧪 Linting and Code Formatting

- Run linting:
```bash
npm run lint
# or
yarn lint
```

- The project uses ESLint and Prettier for code quality and formatting
- Configuration files:
  - `.eslintrc.json` - ESLint configuration
  - `.prettierrc.json` - Prettier configuration

## 🏗️ Project Structure

```
debug.io/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Utility functions and helpers
│   └── styles/       # Global styles and Tailwind CSS
├── public/           # Static assets
├── terraform/        # Infrastructure as Code
└── ...config files
```

## 🔧 Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) - AWS integration
- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [SSH2](https://github.com/mscdex/ssh2) - SSH client

## ☁️ AWS Infrastructure Details

### Amazon Machine Images (AMI)
- Uses custom AMIs in the us-east-2 region
- Pre-configured with SSM agent for secure remote access
- Base software stack includes:
  - Docker runtime
  - Java 8 environment
  - Kafka and Zookeeper prerequisites

### EC2 Instance Configuration
- Instance Type: t2.micro (configurable)
- Region: us-east-2 (configurable via Terraform variables)
- Auto-provisioned with Terraform
- User data script for automated setup of:
  - Docker installation and configuration
  - Kafka and Zookeeper services
  - System dependencies

### Security and Access Management
- **IAM Roles and Policies**:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ecr:*",
          "cloudtrail:LookupEvents"
        ],
        "Resource": "*"
      }
    ]
  }
  ```
- **Security Groups**:
  - Inbound: Port 22 (SSH)
  - Outbound: All traffic
  - Configurable through Terraform

### AWS Systems Manager (SSM) Integration
- Secure shell access without exposed SSH ports
- Session Manager for web-based terminal access
- Custom IAM roles with:
  - SSM Managed Instance Core policy
  - ECR and CloudTrail access permissions
- Real-time session management and monitoring

### Instance Lifecycle Management
- Automated provisioning via Terraform
- Instance state monitoring
- Automatic session cleanup
- Graceful termination handling
- WebSocket-based terminal communication

### AWS SDK Implementation
- EC2 instance management through @aws-sdk/client-ec2
- SSM session handling via @aws-sdk/client-ssm
- Real-time terminal access using WebSocket protocol
- Custom SSM session protocol implementation

### Infrastructure as Code
- Complete Terraform configuration for:
  - EC2 instances
  - IAM roles and policies
  - Security groups
  - Network settings
- State management through Terraform
- Automated deployment scripts

## 🚀 Infrastructure

The project includes Terraform configurations for infrastructure management:

1. Navigate to the terraform directory:
```bash
cd terraform
```

2. Initialize Terraform:
```bash
./terraform-init.sh
```

3. Apply the infrastructure:
```bash
terraform apply
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support, please open an issue in the GitHub repository or contact the maintainers.
