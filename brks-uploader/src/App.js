import React, { useState } from 'react';
import AWS from 'aws-sdk';
import './App.css';

function App() {
  const [championData, setChampionData] = useState({
    id: '',
    nameEn: '',
    nameKo: '',
    portrait: '',
    skins: []
  });

  const [currentSkin, setCurrentSkin] = useState({
    skinNameEn: '',
    skinNameKo: '',
    skinTierEn: '',
    skinTierKo: '',
    priceRp: '',
    priceMythicEssence: '',
    priceEvent: '',
    limitedEdition: false,
    releaseDate: '',
    videoUrl: '',
    skinImage: ''
  });

  const [skins, setSkins] = useState([]);
  const [portraitFile, setPortraitFile] = useState(null);
  const [skinImageFile, setSkinImageFile] = useState(null);

  // S3 객체를 컴포넌트 외부에서 정의하여 재사용
  const s3 = new AWS.S3({
    accessKeyId: 'AKIA6JKEYBHVHGT2RWS3',
    secretAccessKey: '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',
    region: 'ap-northeast-2'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChampionData({ ...championData, [name]: value });
  };

  const handleSkinChange = (e) => {
    const { name, value } = e.target;
    setCurrentSkin({ ...currentSkin, [name]: value });
  };

  const handlePortraitFileChange = (e) => {
    setPortraitFile(e.target.files[0]);
  };

  const handleSkinImageFileChange = (e) => {
    setSkinImageFile(e.target.files[0]);
  };

  const addSkin = () => {
    setSkins([...skins, currentSkin]);
    setCurrentSkin({
      skinNameEn: '',
      skinNameKo: '',
      skinTierEn: '',
      skinTierKo: '',
      priceRp: '',
      priceMythicEssence: '',
      priceEvent: '',
      limitedEdition: false,
      releaseDate: '',
      videoUrl: '',
      skinImage: ''
    });
    setSkinImageFile(null);
  };

  const uploadImageToS3 = async (file, key) => {
    const params = {
      Bucket: 'brks-champion',
      Key: key,
      Body: file,
      ContentType: file.type
    };

    try {
      const data = await s3.upload(params).promise();
      return data.Location; // S3에서 파일이 업로드된 URL 반환
    } catch (err) {
      console.error('Error uploading to S3:', err);
      return null;
    }
  };

  const uploadToS3 = async () => {
    const portraitKey = `champions/portraits/${championData.nameEn.toLowerCase()}_portrait.${portraitFile.name.split('.').pop()}`;
    const skinImageKey = `champions/skins/${championData.nameEn.toLowerCase()}_${currentSkin.skinNameEn.toLowerCase()}_skin.${skinImageFile.name.split('.').pop()}`;

    // 초상화와 스킨 이미지 업로드
    const portraitUrl = await uploadImageToS3(portraitFile, portraitKey);
    const skinImageUrl = await uploadImageToS3(skinImageFile, skinImageKey);

    // 초상화 URL 및 스킨 이미지 URL 업데이트
    setChampionData({ ...championData, portrait: portraitUrl });
    setCurrentSkin({ ...currentSkin, skinImage: skinImageUrl });

    const fileName = `${championData.nameEn.toLowerCase()}.json`;
    const fileContent = JSON.stringify({ ...championData, skins }, null, 2);

    const params = {
      Bucket: 'brks-champion',
      Key: `champions/${fileName}`,
      Body: fileContent,
      ContentType: 'application/json'
    };

    try {
      await s3.upload(params).promise();
      alert('File successfully uploaded to S3.');
    } catch (err) {
      console.error('Error uploading to S3:', err);
      alert('Failed to upload file.');
    }
  };

  return (
    <div className="App">
      <h1>Champion Uploader</h1>
      <div>
        <label>ID:</label>
        <input type="text" name="id" value={championData.id} onChange={handleChange} />
        <label>Name (English):</label>
        <input type="text" name="nameEn" value={championData.nameEn} onChange={handleChange} />
        <label>Name (Korean):</label>
        <input type="text" name="nameKo" value={championData.nameKo} onChange={handleChange} />
        <label>Portrait Image:</label>
        <input type="file" onChange={handlePortraitFileChange} />
      </div>
      <div>
        <h2>Add Skins</h2>
        <label>Skin Name (English):</label>
        <input type="text" name="skinNameEn" value={currentSkin.skinNameEn} onChange={handleSkinChange} />
        <label>Skin Name (Korean):</label>
        <input type="text" name="skinNameKo" value={currentSkin.skinNameKo} onChange={handleSkinChange} />
        <label>Skin Tier (English):</label>
        <input type="text" name="skinTierEn" value={currentSkin.skinTierEn} onChange={handleSkinChange} />
        <label>Skin Tier (Korean):</label>
        <input type="text" name="skinTierKo" value={currentSkin.skinTierKo} onChange={handleSkinChange} />
        <label>Price (RP):</label>
        <input type="text" name="priceRp" value={currentSkin.priceRp} onChange={handleSkinChange} />
        <label>Price (Mythic Essence):</label>
        <input type="text" name="priceMythicEssence" value={currentSkin.priceMythicEssence} onChange={handleSkinChange} />
        <label>Price (Event):</label>
        <input type="text" name="priceEvent" value={currentSkin.priceEvent} onChange={handleSkinChange} />
        <label>Limited Edition:</label>
        <input type="checkbox" name="limitedEdition" checked={currentSkin.limitedEdition} onChange={() => setCurrentSkin({ ...currentSkin, limitedEdition: !currentSkin.limitedEdition })} />
        <label>Release Date:</label>
        <input type="date" name="releaseDate" value={currentSkin.releaseDate} onChange={handleSkinChange} />
        <label>Video URL:</label>
        <input type="text" name="videoUrl" value={currentSkin.videoUrl} onChange={handleSkinChange} />
        <label>Skin Image:</label>
        <input type="file" onChange={handleSkinImageFileChange} />
        <button onClick={addSkin}>Add Skin</button>
      </div>
      <div>
        <h2>Skins</h2>
        <ul>
          {skins.map((skin, index) => (
            <li key={index}>
              {skin.skinNameEn} ({skin.skinNameKo})
            </li>
          ))}
        </ul>
      </div>
      <button onClick={uploadToS3}>Upload to S3</button>
    </div>
  );
}

export default App;