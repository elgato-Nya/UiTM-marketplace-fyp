export const getObjectValueByKey = (enumObj, key) => {
  return enumObj[key] || null;
};

export const getObjectKeyByValue = (enumObj, value) => {
  return Object.keys(enumObj).find((key) => enumObj[key] === value) || null;
};
