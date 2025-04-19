-- Add new estimate email template
INSERT INTO email_templates 
  (name, subject, body, html_content, text_content, category)
VALUES
  (
    'New Estimate Notification', 
    'Your APS Flooring Estimate is Ready for Review', 
    'Your estimate is ready for review. Please check your email for details on how to view and approve it.',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <div style="background-color: #000000; padding: 20px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #D4AF37; margin: 0;">APS Flooring</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0;">Estimate Ready</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #E5E5E5; border-radius: 5px;">
        <h2 style="color: #000000; margin-top: 0;">Your Estimate is Ready</h2>
        
        <p>Dear {{name}},</p>
        
        <p>Thank you for choosing APS Flooring. We are pleased to provide you with your estimate for your flooring project.</p>
        
        <div style="background-color: #F9F9F9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Estimate Details:</strong></p>
          <p style="margin: 0 0 5px 0;"><strong>Estimate Number:</strong> {{estimateNumber}}</p>
          <p style="margin: 0 0 5px 0;"><strong>Total Amount:</strong> ${{estimateTotal}}</p>
          <p style="margin: 0 0 15px 0;"><strong>Valid Until:</strong> {{expirationDate}}</p>
        </div>
        
        <p>Click the button below to view your complete estimate with detailed line items:</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{estimateUrl}}" style="background-color: #D4AF37; color: #000000; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold; display: inline-block;">View & Approve Estimate</a>
        </p>
        
        <p>If you have any questions or would like to discuss the details of this estimate, please contact us at <a href="mailto:estimates@apsflooring.info" style="color: #D4AF37;">estimates@apsflooring.info</a> or call (555) 123-4567.</p>
        
        <p style="margin-top: 30px;">Warm regards,</p>
        <p><strong>APS Flooring Team</strong></p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #E5E5E5; text-align: center; font-size: 12px; color: #777777;">
        <p>&copy; {{year}} APS Flooring LLC. All rights reserved.</p>
        <p>123 Main Street, New Orleans, LA 12345</p>
      </div>
    </div>',
    'Your estimate is ready for review. Estimate Number: {{estimateNumber}}, Total Amount: ${{estimateTotal}}, Valid Until: {{expirationDate}}. Please visit {{estimateUrl}} to view and approve your estimate.',
    'estimate'
  );

-- Add workflow for estimate creation
INSERT INTO automation_workflows
  (name, description, trigger_type, trigger_condition, email_template_id, delay, trigger, actions, is_active)
VALUES
  (
    'Estimate Created - Send Notification',
    'Sends an email to customer when a new estimate is created',
    'estimate_created',
    'draft',
    (SELECT id FROM email_templates WHERE name = 'New Estimate Notification'),
    0,
    'estimate_created',
    '[
      {
        "type": "send_email",
        "data": {
          "recipientEmail": "{{contactEmail}}",
          "templateId": 5,
          "variables": {
            "name": "{{contactName}}",
            "estimateNumber": "{{estimateNumber}}",
            "estimateTotal": "{{estimateTotal}}",
            "expirationDate": "{{validUntil}}",
            "estimateUrl": "{{appUrl}}/estimate/{{estimateId}}",
            "year": "2025"
          }
        }
      }
    ]',
    true
  );