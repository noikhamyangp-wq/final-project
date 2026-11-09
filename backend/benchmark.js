const { performance } = require('node:perf_hooks');
const mergeSort = require('./mergeSort');

function bubbleSort(array, comparator) {
  const result = array.slice();
  for (let end = result.length - 1; end > 0; end -= 1) {
    for (let index = 0; index < end; index += 1) {
      if (comparator(result[index], result[index + 1]) > 0) {
        [result[index], result[index + 1]] = [result[index + 1], result[index]];
      }
    }
  }
  return result;
}

function measure(sortFunction, values, comparator) {
  const start = performance.now();
  sortFunction(values, comparator);
  return Number((performance.now() - start).toFixed(2));
}

const sizes = [100, 1000, 5000];
const compareScores = (left, right) => left.score - right.score;
const results = sizes.map((size) => {
  const values = Array.from({ length: size }, (_, id) => ({
    id,
    score: Math.floor(Math.random() * 10001) / 100,
  }));
  return {
    รายการ: size,
    'Bubble Sort (ms)': measure(bubbleSort, values, compareScores),
    'Merge Sort (ms)': measure(mergeSort, values, compareScores),
  };
});

console.table(results);
