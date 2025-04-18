import { db } from './server/db.js';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    console.log("Running new migration directly...");
    
    // Read the migration file
    const migrationSql = fs.readFileSync(
      path.join(process.cwd(), 'migrations', '0002_powerful_the_hand.sql'),
      'utf8'
    );
    
    // Split into individual statements at the statement-breakpoint comments
    const statements = migrationSql.split('--> statement-breakpoint');
    
    console.log(`Found ${statements.length} SQL statements to execute.`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`Executing statement ${i+1}/${statements.length}...`);
          await db.execute(statement);
          console.log(`Statement ${i+1} executed successfully.`);
        } catch (err) {
          // If table already exists, that's ok - continue
          if (err.message.includes('already exists')) {
            console.log(`Table already exists, continuing...`);
          } else {
            throw err;
          }
        }
      }
    }
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);