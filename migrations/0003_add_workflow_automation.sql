-- Add initial email templates for automation
INSERT INTO email_templates 
  (name, subject, body, html_content, text_content, category)
VALUES
  (
    'Estimate Approved Notification', 
    'Estimate Approved: Next Steps for Your Flooring Project', 
    'Your estimate has been approved. Our team will be preparing a contract for your review.',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <div style="background-color: #000000; padding: 20px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #D4AF37; margin: 0;">APS Flooring</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0;">Estimate Approved</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #E5E5E5; border-radius: 5px;">
        <h2 style="color: #000000; margin-top: 0;">Thank You for Approving Your Estimate</h2>
        
        <p>Dear {{name}},</p>
        
        <p>Thank you for approving your estimate for <strong>{{projectTitle}}</strong>. We''re excited to work with you on this project!</p>
        
        <p>Here''s what happens next:</p>
        
        <ol>
          <li>Our team will prepare a contract based on the approved estimate</li>
          <li>You''ll receive the contract for review and electronic signature</li>
          <li>Upon signing, we''ll create your customer portal account</li>
          <li>We''ll work with you to schedule your installation</li>
        </ol>
        
        <p>If you have any questions in the meantime, please don''t hesitate to contact us.</p>
        
        <p>We look forward to transforming your space with our premium flooring solutions!</p>
        
        <p style="margin-top: 30px;">Warm regards,</p>
        <p><strong>APS Flooring Team</strong></p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #E5E5E5; text-align: center; font-size: 12px; color: #777777;">
        <p>&copy; {{year}} APS Flooring LLC. All rights reserved.</p>
        <p>123 Main Street, New Orleans, LA 12345</p>
      </div>
    </div>',
    'Thank you for approving your estimate for your flooring project. We''re excited to work with you! Our team will prepare a contract based on the approved estimate. You''ll receive the contract for review and electronic signature soon. Upon signing, we''ll create your customer portal account and work with you to schedule your installation. If you have any questions, please contact us.',
    'estimate'
  ),
  (
    'Contract Ready for Signature', 
    'Your APS Flooring Contract is Ready for Signature', 
    'Your contract is ready for your review and signature.',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <div style="background-color: #000000; padding: 20px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #D4AF37; margin: 0;">APS Flooring</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0;">Contract Ready</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #E5E5E5; border-radius: 5px;">
        <h2 style="color: #000000; margin-top: 0;">Your Contract is Ready</h2>
        
        <p>Dear {{name}},</p>
        
        <p>We''re pleased to inform you that your contract for <strong>{{projectTitle}}</strong> is now ready for your review and signature.</p>
        
        <p>The contract includes:</p>
        <ul>
          <li>Project scope details</li>
          <li>Materials and specifications</li>
          <li>Timeline for completion</li>
          <li>Payment schedule</li>
          <li>Warranty information</li>
        </ul>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{contractUrl}}" style="background-color: #D4AF37; color: #000000; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold; display: inline-block;">Review & Sign Contract</a>
        </p>
        
        <p>After signing, you''ll receive access to your customer portal where you can track your project''s progress and communicate with our team.</p>
        
        <p>If you have any questions about the contract, please contact us at <a href="mailto:contracts@apsflooring.info" style="color: #D4AF37;">contracts@apsflooring.info</a> or call (555) 123-4567.</p>
        
        <p style="margin-top: 30px;">Warm regards,</p>
        <p><strong>APS Flooring Team</strong></p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #E5E5E5; text-align: center; font-size: 12px; color: #777777;">
        <p>&copy; {{year}} APS Flooring LLC. All rights reserved.</p>
        <p>123 Main Street, New Orleans, LA 12345</p>
      </div>
    </div>',
    'Your contract is ready for your review and signature. The contract includes project scope details, materials and specifications, timeline for completion, payment schedule, and warranty information. After signing, you''ll receive access to your customer portal where you can track your project''s progress and communicate with our team.',
    'contract'
  ),
  (
    'Welcome to Customer Portal', 
    'Welcome to Your APS Flooring Customer Portal', 
    'Your customer portal account has been created. You can now access your project details.',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <div style="background-color: #000000; padding: 20px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #D4AF37; margin: 0;">APS Flooring</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0;">Customer Portal</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #E5E5E5; border-radius: 5px;">
        <h2 style="color: #000000; margin-top: 0;">Welcome to Your Customer Portal</h2>
        
        <p>Dear {{name}},</p>
        
        <p>Thank you for choosing APS Flooring for your project. We''re excited to let you know that your customer portal account has been created.</p>
        
        <p>Through your portal, you can:</p>
        <ul>
          <li>View project details and progress updates</li>
          <li>Access important documents</li>
          <li>View and pay invoices</li>
          <li>Communicate with our team</li>
          <li>Request service or support</li>
        </ul>
        
        <div style="background-color: #F9F9F9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
          <p style="margin: 0 0 5px 0;">Username: {{username}}</p>
          <p style="margin: 0 0 15px 0;">Password: {{password}}</p>
          <p style="font-size: 12px; color: #777777; margin: 0;">For security reasons, please change your password after your first login.</p>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{portalUrl}}" style="background-color: #D4AF37; color: #000000; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold; display: inline-block;">Access Your Portal</a>
        </p>
        
        <p>If you have any questions, please don''t hesitate to contact us at <a href="mailto:support@apsflooring.info" style="color: #D4AF37;">support@apsflooring.info</a> or call (555) 123-4567.</p>
        
        <p style="margin-top: 30px;">Warm regards,</p>
        <p><strong>APS Flooring Team</strong></p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #E5E5E5; text-align: center; font-size: 12px; color: #777777;">
        <p>&copy; {{year}} APS Flooring LLC. All rights reserved.</p>
        <p>123 Main Street, New Orleans, LA 12345</p>
      </div>
    </div>',
    'Your customer portal account has been created. You can now access your project details, view documents, pay invoices, and communicate with our team. Username: {{username}}, Password: {{password}}',
    'customer'
  ),
  (
    'Project Created Notification', 
    'Your APS Flooring Project Has Been Created', 
    'Your flooring project has been created in our system. You can view the details in your customer portal.',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <div style="background-color: #000000; padding: 20px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #D4AF37; margin: 0;">APS Flooring</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0;">Project Created</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #E5E5E5; border-radius: 5px;">
        <h2 style="color: #000000; margin-top: 0;">Your Project Has Been Created</h2>
        
        <p>Dear {{name}},</p>
        
        <p>We''re excited to inform you that your flooring project <strong>{{projectTitle}}</strong> has been created in our system.</p>
        
        <p>Project details:</p>
        <ul>
          <li><strong>Project Name:</strong> {{projectTitle}}</li>
          <li><strong>Flooring Type:</strong> {{flooringType}}</li>
          <li><strong>Area:</strong> {{squareFootage}} square feet</li>
          <li><strong>Estimated Start:</strong> {{startDate}}</li>
        </ul>
        
        <p>What happens next:</p>
        <ol>
          <li>Our project manager will contact you to confirm details</li>
          <li>We''ll schedule a pre-installation inspection if needed</li>
          <li>Materials will be ordered for your project</li>
          <li>Your installation will be scheduled</li>
        </ol>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{portalUrl}}" style="background-color: #D4AF37; color: #000000; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold; display: inline-block;">View Project Details</a>
        </p>
        
        <p>If you have any questions about your project, please contact your project manager or reach out to us at <a href="mailto:projects@apsflooring.info" style="color: #D4AF37;">projects@apsflooring.info</a>.</p>
        
        <p style="margin-top: 30px;">Warm regards,</p>
        <p><strong>APS Flooring Team</strong></p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #E5E5E5; text-align: center; font-size: 12px; color: #777777;">
        <p>&copy; {{year}} APS Flooring LLC. All rights reserved.</p>
        <p>123 Main Street, New Orleans, LA 12345</p>
      </div>
    </div>',
    'Your flooring project has been created in our system. You can view the details in your customer portal. Our project manager will contact you to confirm details and schedule your installation.',
    'project'
  );

-- Add initial SMS templates
INSERT INTO sms_templates 
  (name, content, category)
VALUES
  (
    'Estimate Approved SMS', 
    'Thank you for approving your APS Flooring estimate. We''ll prepare your contract and send it soon for your review. Questions? Call us at (555) 123-4567.',
    'estimate'
  ),
  (
    'Contract Ready SMS', 
    'Your APS Flooring contract is ready for signature! Please check your email or log in to your customer portal to review and sign. Need help? Call (555) 123-4567.',
    'contract'
  ),
  (
    'Project Created SMS', 
    'Good news! Your APS Flooring project has been created. Check your email for login details to track progress in your customer portal.',
    'project'
  );

-- Create initial automation workflows

-- Workflow 1: Estimate Approved - Create Contract
INSERT INTO automation_workflows
  (name, description, trigger_type, trigger_condition, email_template_id, delay, trigger, actions, is_active)
VALUES
  (
    'Estimate Approved - Admin Notification',
    'Notifies admin when a customer approves an estimate',
    'estimate_approval',
    'approved',
    1,
    0,
    'estimate_approval',
    '[
      {
        "type": "send_email",
        "data": {
          "recipientEmail": "admin@apsflooring.info",
          "customSubject": "Customer Approved Estimate #{{estimateNumber}}",
          "customBody": "<p>A customer has approved an estimate:</p><p>Estimate #: {{estimateNumber}}</p><p>Customer: {{customerName}}</p><p>Amount: ${{estimateTotal}}</p><p>Please log in to the admin panel to review and create a contract.</p>"
        }
      }
    ]',
    true
  ),
  (
    'Estimate Approved - Auto Create Contract',
    'Automatically creates a contract when an estimate is approved',
    'estimate_approval',
    'approved',
    NULL,
    1,
    'estimate_approval',
    '[
      {
        "type": "convert_to_contract",
        "data": {
          "estimateId": "{{estimateId}}",
          "sendToCustomer": false
        }
      }
    ]',
    true
  ),
  (
    'Contract Created - Send Notification',
    'Sends a notification to the customer when their contract is ready',
    'contract_created',
    'draft',
    2,
    0,
    'contract_created',
    '[
      {
        "type": "send_email",
        "data": {
          "templateId": 2,
          "variables": {
            "name": "{{customerName}}",
            "projectTitle": "{{contractTitle}}",
            "contractUrl": "{{appUrl}}/customer/contracts/{{contractId}}",
            "year": "2025"
          }
        }
      }
    ]',
    true
  ),
  (
    'Contract Signed - Create Customer Account',
    'Creates a customer portal account when a contract is signed',
    'contract_signed',
    'signed',
    3,
    0,
    'contract_signed',
    '[
      {
        "type": "create_customer_account",
        "data": {
          "contactId": "{{contactId}}",
          "sendWelcomeEmail": true
        }
      }
    ]',
    true
  ),
  (
    'Contract Signed - Create Project',
    'Creates a project in the system when a contract is signed',
    'contract_signed',
    'signed',
    4,
    1,
    'contract_signed',
    '[
      {
        "type": "create_project",
        "data": {
          "customerId": "{{customerUserId}}",
          "contactId": "{{contactId}}",
          "title": "{{contractTitle}}",
          "description": "{{contractDescription}}",
          "flooringType": "{{flooringDetails}}",
          "estimatedCost": "{{contractAmount}}",
          "notifyCustomer": true
        }
      }
    ]',
    true
  );

-- Add functions to update storage.ts
CREATE OR REPLACE FUNCTION get_workflows_by_trigger(trigger_type TEXT, condition TEXT)
RETURNS SETOF automation_workflows AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM automation_workflows
  WHERE trigger_type = trigger_type
  AND (condition IS NULL OR trigger_condition = condition)
  AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to get email template by ID
CREATE OR REPLACE FUNCTION get_email_template_by_id(template_id INTEGER)
RETURNS email_templates AS $$
DECLARE
  template email_templates;
BEGIN
  SELECT * INTO template FROM email_templates WHERE id = template_id;
  RETURN template;
END;
$$ LANGUAGE plpgsql;