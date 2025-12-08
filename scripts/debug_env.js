
const dotenv = require('dotenv');
const fs = require('fs');

if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    console.log('Keys in .env.local:', Object.keys(envConfig));
} else {
    console.log('.env.local does not exist');
}
