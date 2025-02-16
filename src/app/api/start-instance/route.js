import { StartSessionCommand, SSMClient } from "@aws-sdk/client-ssm";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { SendCommandCommand, ListCommandInvocationsCommand, SSMClient as SSMServiceClient } from "@aws-sdk/client-ssm";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

async function waitForInstanceRunning(instanceId, region) {
  const ec2Client = new EC2Client({ region });

  while (true) {
    try {
      const command = new DescribeInstancesCommand({ InstanceIds: [instanceId] });
      const response = await ec2Client.send(command);

      const instanceState = response.Reservations?.[0]?.Instances?.[0]?.State?.Name;
      console.log(`⏳ Instance ${instanceId} is in state: ${instanceState}`);

      if (instanceState === "running") {
        console.log(`✅ Instance ${instanceId} is now running.`);
        return;
      }
    } catch (error) {
      console.error("⚠️ Error checking instance status:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
  }
}

async function waitForSSM(instanceId, region) {
  const ssmClient = new SSMServiceClient({ region });

  while (true) {
    try {
      const sendCommand = new SendCommandCommand({
        InstanceIds: [instanceId],
        DocumentName: "AWS-RunShellScript",
        Parameters: { commands: ["echo SSM_READY"] },
      });

      const sendCommandResponse = await ssmClient.send(sendCommand);
      const commandId = sendCommandResponse.Command.CommandId;

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before checking

      const listCommand = new ListCommandInvocationsCommand({
        CommandId: commandId,
        InstanceId: instanceId,
      });

      const listCommandResponse = await ssmClient.send(listCommand);

      if (listCommandResponse.CommandInvocations?.[0]?.Status === "Success") {
        console.log(`✅ SSM Agent is now active on instance ${instanceId}.`);
        return;
      }
    } catch (error) {
      console.log(`⏳ Waiting for SSM Agent on ${instanceId}...`);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
  }
}

export async function POST(req) {

  try {
    console.log("🚀 Running Terraform to create EC2 instance...");
    await execPromise("cd terraform && terraform apply -auto-approve");

    console.log("📥 Fetching EC2 instance ID from Terraform output...");
    const { stdout } = await execPromise("cd terraform && terraform output -raw instance_id");
    const instanceId = stdout.trim();
    console.log(`✅ EC2 instance created: ${instanceId}`);

    const { stdout: regionOutput } = await execPromise("cd terraform && terraform output -raw aws_region");
    const region = regionOutput.trim();

    await waitForInstanceRunning(instanceId, region);
    await waitForSSM(instanceId, region);

    console.log("🔗 Starting SSM session...");
    const ssmClient = new SSMClient({ region });

    const command = new StartSessionCommand({ Target: instanceId });
    const response = await ssmClient.send(command);

    console.log("✅ SSM session started:", response);

    return new Response(
      JSON.stringify({
        sessionId: response.SessionId,
        streamUrl: response.StreamUrl,
        tokenValue: response.TokenValue,
        instanceId: instanceId,
        region: region,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in process:", error);
    return new Response(JSON.stringify({ error: "Failed to start session" }), { status: 500 });
  }
}
