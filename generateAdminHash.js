
import "dotenv/config";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout });

try {
  const password = await rl.question("Enter a new admin password: ");

  if (password.length < 12) {
    throw new Error("Use an admin password of at least 12 characters.");
  }

  const hash = await bcrypt.hash(password, 12);

  console.log("\nAdd this line to server/.env:\n");
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log("\nDo not share or commit this hash.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  rl.close();
}
