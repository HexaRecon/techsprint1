import crypto from 'crypto';

async function testWebhook() {
    const secret = 'dev-webhook-secret';
    const payload = {
        ref: 'refs/heads/main',
        after: 'commit-hash-123',
        head_commit: {
            message: 'Test Commit'
        },
        repository: {
            html_url: '/home/hexarecon/Desktop/docker/test-repo',
            full_name: 'local/test-repo'
        }
    };

    const payloadString = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payloadString).digest('hex');

    console.log('Sending webhook...');

    try {
        const response = await fetch('http://localhost:3001/webhooks/github', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Hub-Signature-256': digest,
                'X-GitHub-Event': 'push'
            },
            body: payloadString
        });

        console.log('Status:', response.status);
        console.log('Body:', await response.json());
    } catch (err) {
        console.error('Error:', err);
    }
}

testWebhook();
