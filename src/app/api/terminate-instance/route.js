import { EC2Client, TerminateInstancesCommand } from "@aws-sdk/client-ec2";
import { SSMClient, TerminateSessionCommand } from "@aws-sdk/client-ssm";

export async function POST(req, res ) {
  try {
    const { instanceId, sessionId, region } = await req.json();

    if (!instanceId || !sessionId) {
      return new Response(
        JSON.stringify({ error: "Instance ID and Session ID are required" }),
        { status: 400 }
      );
    }

    const ec2Client = new EC2Client({ region });
    const ssmClient = new SSMClient({ region });

    try {
      const terminateSessionCommand = new TerminateSessionCommand({
        SessionId: sessionId,
      });
      await ssmClient.send(terminateSessionCommand);
      console.log(`✅ SSM session ${sessionId} terminated.`);
    } catch (ssmError) {
      console.error("❌ Failed to terminate SSM session:", ssmError);
      return new Response(
        JSON.stringify({ error: "Failed to terminate SSM session" }),
        { status: 500 }
      );
    }

    try {
      const terminateInstanceCommand = new TerminateInstancesCommand({
        InstanceIds: [instanceId],
      });
      await ec2Client.send(terminateInstanceCommand);
      console.log(`✅ EC2 instance ${instanceId} terminated.`);
    } catch (ec2Error) {
      console.error("❌ Failed to terminate EC2 instance:", ec2Error);
      return new Response(
        JSON.stringify({ error: "Failed to terminate EC2 instance" }),
        { status: 500 }
      );
    }
    return new Response(
      JSON.stringify({
        message: "EC2 instance and SSM session terminated successfully",
      }),
      { status: 200 }
    );


  }
  catch (error) {
    console.error("❌ Error in process:", error);
    return new Response(JSON.stringify({ error: "Failed to terminate instance." }), { status: 500 });
  }
}