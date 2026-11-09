function mergeSort(array, comparator) {
  if (!Array.isArray(array)) {
    throw new TypeError('array must be an array');
  }
  if (typeof comparator !== 'function') {
    throw new TypeError('comparator must be a function');
  }

  if (array.length <= 1) {
    return array.slice();
  }

  // Divide: แบ่ง array ออกเป็นครึ่งซ้ายและครึ่งขวาซ้ำ ๆ จนเหลือข้อมูลชุดละหนึ่งรายการ
  const middle = Math.floor(array.length / 2);
  const left = mergeSort(array.slice(0, middle), comparator);
  const right = mergeSort(array.slice(middle), comparator);
  const result = [];
  let leftIndex = 0;
  let rightIndex = 0;

  // Merge: เปรียบเทียบหัวของแต่ละครึ่งและเลือกฝั่งซ้ายเมื่อเท่ากันเพื่อรักษาเสถียรภาพ
  while (leftIndex < left.length && rightIndex < right.length) {
    if (comparator(left[leftIndex], right[rightIndex]) <= 0) {
      result.push(left[leftIndex]);
      leftIndex += 1;
    } else {
      result.push(right[rightIndex]);
      rightIndex += 1;
    }
  }

  while (leftIndex < left.length) {
    result.push(left[leftIndex]);
    leftIndex += 1;
  }
  while (rightIndex < right.length) {
    result.push(right[rightIndex]);
    rightIndex += 1;
  }

  // เวลา O(n log n), พื้นที่ O(n)
  return result;
}

module.exports = mergeSort;
