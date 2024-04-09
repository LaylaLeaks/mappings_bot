const fs = require('fs');
const axios = require('axios');
const { stringify } = require('querystring');
const endpoint = "https://fortnitecentral.genxgames.gg/api/v1/mappings";
let data = [];

const loadData = () => {
  try {
    const rawData = fs.readFileSync('mappings.json');
    data = JSON.parse(rawData);
  } catch (error) {
    console.error('Error:', error);
  }
};

const checkForUpdate = async () => {
  loadData();
  try {
    const res = await axios.get(endpoint);
    const currentFileNames = data.map(item => item.fileName);
    const newFileNames = res.data.map(item => item.fileName);

    if (currentFileNames.length!== newFileNames.length ||!currentFileNames.every(fileName => newFileNames.includes(fileName))) {
      console.log("\u001b[32m[%s] NEW MAPPING FOUND\u001b[0m", res.data[0].fileName);
    } else {
      console.log("\u001b[31mNO NEW MAPPING\u001b[0m");
    }

    fs.writeFileSync('mappings.json', JSON.stringify(res.data, null, 2));
    data = res.data;
  } catch (error) {
    console.error('Error:', error);
  }
  setTimeout(checkForUpdate, 5000);
};

loadData();
checkForUpdate();