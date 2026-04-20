import 'dotenv/config';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

await connectDB();
const admin = await User.findOne({ role: 'admin' }).select('+password');
console.log('Admin user found:', admin ? admin.email : 'None');
console.log('Admin password hash:', admin ? admin.password : 'None');
process.exit(0);
