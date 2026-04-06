import bcrypt from 'bcryptjs';

const hash = '$2b$10$r.ytxvWzTEGb80vZFbjxHe4p/0w4eb7yzwjKKx0eF50uC6HgNlQly';
const testPassword = 'ctrl#9f3k!vayl'; // This is the admin password from basic auth, maybe it's the same?

async function test() {
  console.log('Testing hash:', hash);
  console.log('Testing password candidate:', testPassword);
  
  const match = await bcrypt.compare(testPassword, hash);
  console.log('Match?', match);
  
  // Try another common password if user reused it from scripts
  const match2 = await bcrypt.compare('EnterPasswordHere', hash);
  console.log('Test "EnterPasswordHere" match?', match2);
}

test();
