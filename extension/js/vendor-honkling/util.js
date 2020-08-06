function isNumeric(str) {
  return !isNaN(str)
}

function isAllZero(data) {
  return data.every(function(elem) {return elem == 0})
}

function duplicateElements(arr, times) {
  duplicated = []
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < times; j++) {
      duplicated.push(arr[i]);
    }
  }
  return duplicated
}

function shuffleArray(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function printData(name, data) {
  if (data.length == 0) {
    console.log('\t', name, ' has length of 0');
  } else if (this.isAllZero(data)) {
    console.log(name, data);
    console.log('\t', name, ' is all zero array with length ', data.length);
  }
  console.log(name, data);

  if (Array.isArray(data[0])) {
    // 2D array
    var temp = data;
    data = [];

    for (var i = 0; i < temp.length; i++) {
      for (var j = 0; j < temp[i].length; j++) {
        data.push(temp[i][j]);
      }
    }
  }
  const arrMin = arr => Math.min(...arr);
  const arrMax = arr => Math.max(...arr);
  const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length

  console.log('\trange : ( ', arrMin(data), ' ~ ', arrMax(data), ' )');
  console.log('\tmean : ', arrAvg(data))

  var i = 0;
  while (data[i] == 0) {
    i++;
  }
  console.log('\tfirst non zero element : ', i, ' - ', data[i]);

  i = data.length - 1;
  while (data[i] == 0) {
    i--;
  }
  console.log('\tlast non zero element : ', i, ' - ', data[i]);
}

function roundTo(num, place) {
  return +(Math.round(num + "e+" + place)  + "e-"+place);
}

function numberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function sortNumberArray(arr) {
  arr.sort(function (a, b) { return a - b; });
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  if (typeof p !== 'number') throw new TypeError('p must be a number');
  if (p <= 0) return arr[0];
  if (p >= 1) return arr[arr.length - 1];

  var index = (arr.length - 1) * p
      lower = Math.floor(index),
      upper = lower + 1,
      weight = index % 1;

  if (upper >= arr.length) return arr[lower];
  return arr[lower] * (1 - weight) + arr[upper] * weight;
}

function transpose2d(arr) {
  let row = arr.length;
  let col = arr[0].length;

  let transposed = [];
  for (var j = 0; j < col; j++) {
    transposed.push([]);
  }

  for (var i = 0; i < row; i++) {
    for (var j = 0; j < col; j++) {
      transposed[j].push(arr[i][j]);
    }
  }
  return transposed;
}

function flatten2d(arr) {
  let row = arr.length;
  let col = arr[0].length;

  let flattened = [];

  for (var i = 0; i < row; i++) {
    for (var j = 0; j < col; j++) {
      flattened.push(arr[i][j]);
    }
  }
  return flattened;
}

function transposeFlatten2d(arr) {
  let row = arr.length;
  let col = arr[0].length;

  let flattened = [];

  for (var j = 0; j < col; j++) {
    for (var i = 0; i < row; i++) {
      flattened.push(arr[i][j]);
    }
  }
  return flattened;
}

function calculateAccuracy(output, target) {
  if (output.length != target.length) {
    console.error('output(' + output.length + ') and target(' + target.length + ') have different size !');
  }
  let correct = 0;
  for (var i = 0; i < output.length; i++) {
    if (output[i] == target[i]) {
      correct += 1;
    }
  }
  return correct/output.length;
}

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
