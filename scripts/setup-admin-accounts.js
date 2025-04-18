const { db } = require('../server/db');
const { users } = require('../shared/schema');
const { eq } = require('drizzle-orm');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

// Hash passwords for storage
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function setupAdminAccounts() {
  try {
    console.log("Starting admin accounts setup...");
    
    // Check for developer admin account
    const developerUsername = "developer";
    const [devAdmin] = await db.select().from(users).where(eq(users.username, developerUsername));
    
    if (!devAdmin) {
      console.log("Creating developer admin account...");
      const devPassword = process.argv[2] || "dev123"; // Use command line arg or default
      const hashedDevPassword = await hashPassword(devPassword);
      
      await db.insert(users).values({
        username: developerUsername,
        password: hashedDevPassword,
        role: "admin"
      });
      
      console.log(`Developer admin account created with username: ${developerUsername}`);
      console.log(`Developer admin password: ${devPassword} (CHANGE THIS IN PRODUCTION)`);
    } else {
      console.log("Developer admin account already exists");
      
      // Update password if specified as command line arg
      if (process.argv[2]) {
        const newDevPassword = process.argv[2];
        const hashedDevPassword = await hashPassword(newDevPassword);
        
        await db.update(users)
          .set({ password: hashedDevPassword })
          .where(eq(users.username, developerUsername));
        
        console.log(`Developer admin password updated to: ${newDevPassword}`);
      }
    }
    
    // Check for business owner admin account
    const ownerUsername = "owner";
    const [ownerAdmin] = await db.select().from(users).where(eq(users.username, ownerUsername));
    
    if (!ownerAdmin) {
      console.log("Creating business owner admin account...");
      const ownerPassword = process.argv[3] || "owner123"; // Use command line arg or default
      const hashedOwnerPassword = await hashPassword(ownerPassword);
      
      await db.insert(users).values({
        username: ownerUsername,
        password: hashedOwnerPassword,
        role: "admin"
      });
      
      console.log(`Business owner admin account created with username: ${ownerUsername}`);
      console.log(`Business owner admin password: ${ownerPassword} (CHANGE THIS IN PRODUCTION)`);
    } else {
      console.log("Business owner admin account already exists");
      
      // Update password if specified as command line arg
      if (process.argv[3]) {
        const newOwnerPassword = process.argv[3];
        const hashedOwnerPassword = await hashPassword(newOwnerPassword);
        
        await db.update(users)
          .set({ password: hashedOwnerPassword })
          .where(eq(users.username, ownerUsername));
        
        console.log(`Business owner admin password updated to: ${newOwnerPassword}`);
      }
    }
    
    console.log("Admin accounts setup complete!");
    console.log("\nTo use this script to reset passwords:");
    console.log("node scripts/setup-admin-accounts.js [developer_password] [owner_password]");
    
  } catch (error) {
    console.error("Error setting up admin accounts:", error);
  } finally {
    process.exit(0);
  }
}

setupAdminAccounts();