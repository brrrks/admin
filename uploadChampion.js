const AWS = require('aws-sdk');
const inquirer = require('inquirer');
const fs = require('fs');

// S3 설정
const s3 = new AWS.S3();
const bucketName = 'YOUR_BUCKET_NAME'; // S3 버킷 이름을 여기에 입력하세요.

async function getChampionData() {
  const champion = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Champion ID:'
    },
    {
      type: 'input',
      name: 'nameEn',
      message: 'Champion Name (English):'
    },
    {
      type: 'input',
      name: 'nameKo',
      message: 'Champion Name (Korean):'
    },
    {
      type: 'input',
      name: 'portrait',
      message: 'Champion Portrait URL:'
    }
  ]);

  const skins = [];
  let addMoreSkins = true;

  while (addMoreSkins) {
    const skin = await inquirer.prompt([
      {
        type: 'input',
        name: 'skinNameEn',
        message: 'Skin Name (English):'
      },
      {
        type: 'input',
        name: 'skinNameKo',
        message: 'Skin Name (Korean):'
      },
      {
        type: 'input',
        name: 'skinTierEn',
        message: 'Skin Tier (English):'
      },
      {
        type: 'input',
        name: 'skinTierKo',
        message: 'Skin Tier (Korean):'
      },
      {
        type: 'input',
        name: 'priceRp',
        message: 'Price (RP):',
        default: null
      },
      {
        type: 'input',
        name: 'priceMythicEssence',
        message: 'Price (Mythic Essence):',
        default: null
      },
      {
        type: 'input',
        name: 'priceEvent',
        message: 'Price (Event):',
        default: null
      },
      {
        type: 'confirm',
        name: 'limitedEdition',
        message: 'Is Limited Edition?:',
        default: false
      },
      {
        type: 'input',
        name: 'releaseDate',
        message: 'Release Date (YYYY-MM-DD):'
      },
      {
        type: 'input',
        name: 'videoUrl',
        message: 'Video URL:'
      },
      {
        type: 'input',
        name: 'skinImage',
        message: 'Skin Image URL:'
      }
    ]);

    skins.push({
      skinName: {
        en: skin.skinNameEn,
        ko: skin.skinNameKo
      },
      skinTier: {
        en: skin.skinTierEn,
        ko: skin.skinTierKo
      },
      price: {
        rp: skin.priceRp || null,
        mythicEssence: skin.priceMythicEssence || null,
        event: skin.priceEvent || null,
        limitedEdition: skin.limitedEdition
      },
      releaseDate: skin.releaseDate,
      videoUrl: skin.videoUrl,
      skinImage: skin.skinImage
    });

    const { addAnother } = await inquirer.prompt({
      type: 'confirm',
      name: 'addAnother',
      message: 'Would you like to add another skin?',
      default: false
    });

    addMoreSkins = addAnother;
  }

  return {
    id: champion.id,
    name: {
      en: champion.nameEn,
      ko: champion.nameKo
    },
    portrait: champion.portrait,
    skins: skins
  };
}

async function uploadChampionData() {
  const championData = await getChampionData();
  const fileName = `${championData.name.en.toLowerCase()}.json`;
  const fileContent = JSON.stringify(championData, null, 2);

  // 로컬에 파일 저장
  fs.writeFileSync(fileName, fileContent);

  // S3에 파일 업로드
  const params = {
    Bucket: bucketName,
    Key: `champions/${fileName}`,
    Body: fileContent,
    ContentType: 'application/json'
  };

  try {
    await s3.upload(params).promise();
    console.log(`${fileName} successfully uploaded to S3.`);
  } catch (err) {
    console.error('Error uploading to S3:', err);
  }
}

uploadChampionData();