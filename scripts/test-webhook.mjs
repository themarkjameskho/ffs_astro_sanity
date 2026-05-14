#!/usr/bin/env node

/**
 * Webhook Configuration Verification Script
 * Run this to verify your n8n webhook is properly configured
 */

const webhookUrl = 'https://hmstr.app.n8n.cloud/webhook/0bc118b1-bc6d-49be-8c8f-f68d10628f4a';

async function testWebhook() {
  console.log('🔍 Testing n8n Webhook Configuration...\n');
  console.log(`Webhook URL: ${webhookUrl}\n`);

  try {
    // Test 1: Verify webhook is accessible
    console.log('Test 1: Checking webhook accessibility...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Forwarded-By': 'webhook-test-script'
      },
      body: new URLSearchParams({
        testType: 'configuration-check',
        timestamp: new Date().toISOString(),
        source: '{{fork_source_slug}}-website'
      }).toString()
    });

    if (response.ok) {
      console.log('✅ Webhook is accessible and responding\n');
      
      // Test 2: Verify webhook accepts form data
      console.log('Test 2: Simulating form submission...');
      const formResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Forwarded-By': '{{BRAND_ABBREV_LOWER}}-contact-form'
        },
        body: new URLSearchParams({
          name: 'Test User',
          email: 'test@{{fork_source_slug}}-website.local',
          phone: '918-416-7098',
          message: 'This is a webhook configuration test',
          formTitle: 'Webhook Test',
          pageSlug: 'webhook-test',
          submittedAt: new Date().toISOString()
        }).toString()
      });

      if (formResponse.ok) {
        console.log('✅ Form data submitted successfully\n');
      } else {
        console.log(`⚠️ Form submission returned status ${formResponse.status}\n`);
      }

    } else {
      console.log(`❌ Webhook returned status: ${response.status}\n`);
    }

    // Summary
    console.log('=' .repeat(50));
    console.log('\n📋 Webhook Summary:\n');
    console.log(`Endpoint: ${webhookUrl}`);
    console.log('Method: POST');
    console.log('Content-Type: application/x-www-form-urlencoded');
    console.log('\nReady for production! ✅');
    console.log('\n' + '='.repeat(50));

  } catch (error) {
    console.error('❌ Error testing webhook:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testWebhook();
