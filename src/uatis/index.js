/**
 * 生成一个安全的消息ID。
 * 该函数利用window.crypto的getRandomValues方法来生成一个随机的32位无符号整数，
 * 作为安全消息ID的基础。
 * 
 * @returns {string} 返回一个基于随机生成的32位无符号整数的消息ID字符串。
 */
function generateSecureMessageId() {
    // 创建一个长度为1的Uint32Array，用于存储随机生成的32位无符号整数
    const array = new Uint32Array(1);
    // 使用window.crypto的getRandomValues方法填充array，确保生成的数值是安全的随机数
    window.crypto.getRandomValues(array);
    // 将生成的32位无符号整数转换为字符串并返回
    return array[0].toString();
}

/**
 * 根据指定的键合并两个数组。
 * @param {string} customKey - 用于合并数组的键名。
 * @param {Array} array1 - 第一个数组。
 * @param {Array} array2 - 第二个数组。
 * @returns {Array} - 合并后的数组，如果两个数组中有相同的键值，则第二个数组的项会覆盖第一个数组的项。
 */
function mergeArraysByKey(customKey, array1, array2) {
    // 使用 Map 来合并数组，以便保留键值对应的唯一项
    const mergedMap = new Map();
  
    // 遍历第一个数组，以 customKey 为键，将数组项添加到 mergedMap
    array1.forEach(item => mergedMap.set(item[customKey], item));
    // 遍历第二个数组，如果 customKey 相同，则会覆盖第一个数组的项
    array2.forEach(item => mergedMap.set(item[customKey], item));
  
    // 将合并后的 Map 转换为数组并返回
    return Array.from(mergedMap.values());
}
export {
    generateSecureMessageId,
    mergeArraysByKey
}
