import { width, height, batchSize, startsAt } from "./constants";
const pixels = new Uint8Array(width * height * 4); // RGBA for each pixel

export async function captureBatchOfPhotos(nextPhoto, capturePhoto) {
  // capture photos in batches and save them to csv files in a async way
  let batchNumber = 1;
  let csvData = '';
  let photoCount = 0;
  let name;

  csvData += `name,${Array.from({ length: width * height }, (_, i) => `pixel${i}`).join(',')}\n`;

  console.log('Starting capture...');
  do {
    name = nextPhoto();
    capturePhoto(pixels);
    csvData += capturePixelsToCSV(name);

    photoCount++;

    if (photoCount % batchSize === 0) {
      await saveCSV(csvData, `photos_${batchNumber}.csv`);
      batchNumber++;
      csvData = '';
    }
  } while (name !== ".");

  if (photoCount % batchSize !== 0) {
    await saveCSV(csvData, `photos_${batchNumber}.csv`);
  }

  console.log('All batches completed!');
}

function capturePixelsToCSV(name) {
  let csvData = name;

  csvData = csvData.replace(/(_.*)/, '');

  for (let i = 0; i < pixels.length; i += 4) {
    csvData += `,${pixels[i]/255}`;
  }
  return csvData + "\n";
}

function saveCSV(csvData, fileName) {
  //save to csv file
  return new Promise((resolve) => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    resolve();
  });
}