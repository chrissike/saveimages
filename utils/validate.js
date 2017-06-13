const path = require('path');

module.exports.isAllowedExtName = fileName => {
  const extName = path.extname(fileName).toLowerCase();
  return (
    extName == '.jpg' ||
    extName == '.png' ||
    extName == '.dng' ||
    extName == '.webp'
  );
};

module.exports.isAllowedDownloadFileName = fileName => {
  console.log(fileName);
  const extName = path.extname(fileName).toLowerCase();
  console.log(extName);
  return extName == '.webp';
};
