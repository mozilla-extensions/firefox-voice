javascript: (function() {
  let e = function(t, n, r, i, s) {
    let o = [
      5671614,
      6078827,
      2718634,
      1042238,
      4905060,
      5668005,
      3048706,
      3527201,
      5824429,
      1550215,
    ];

    let i1 = i || 0,
      u = 0,
      n1 = n || [],
      r1 = r || 0,
      s1 = s || 0;
    const a = {
      a: 97,
      b: 98,
      c: 99,
      d: 100,
      e: 101,
      f: 102,
      g: 103,
      h: 104,
      i: 105,
      j: 106,
      k: 107,
      l: 108,
      m: 109,
      n: 110,
      o: 111,
      p: 112,
      q: 113,
      r: 114,
      s: 115,
      t: 116,
      u: 117,
      v: 118,
      w: 119,
      x: 120,
      y: 121,
      z: 122,
      A: 65,
      B: 66,
      C: 67,
      D: 68,
      E: 69,
      F: 70,
      G: 71,
      H: 72,
      I: 73,
      J: 74,
      K: 75,
      L: 76,
      M: 77,
      N: 78,
      O: 79,
      P: 80,
      Q: 81,
      R: 82,
      S: 83,
      T: 84,
      U: 85,
      V: 86,
      W: 87,
      X: 88,
      Y: 89,
      Z: 90,
      "0": 48,
      "1": 49,
      "2": 50,
      "3": 51,
      "4": 52,
      "5": 53,
      "6": 54,
      "7": 55,
      "8": 56,
      "9": 57,
      "/": 47,
      ":": 58,
      "?": 63,
      "=": 61,
      "-": 45,
      _: 95,
      "&": 38,
      $: 36,
      "!": 33,
      ".": 46,
    };
    if (!s1 || s1 === 0) {
      t = o[0] + t;
    }
    for (let f = 0; f < t.length; f++) {
      let l = (function(e, t) {
        return a[e[t]] ? a[e[t]] : e.charCodeAt(t);
      })(t, f);
      if (!l * 1) l = 3;
      const c = l * (o[i1] + l * o[u % o.length]);
      n1[r1] = (n1[r1] ? n1[r1] + c : c) + s1 + u;
      const p = c % (50 * 1);
      if (n1[p]) {
        const d = n1[r1];
        n1[r1] = n1[p];
        n1[p] = d;
      }
      u += c;
      r1 = r1 === 50 ? 0 : r1 + 1;
      i1 = i1 === o.length - 1 ? 0 : i1 + 1;
    }
    if (s1 === 104) {
      let v = "";
      for (let f = 0; f < n1.length; f++) {
        v += String.fromCharCode((n1[f] % (25 * 1)) + 97);
      }
      o = function() {};
      return v + "61799c7020";
    }
    return e(u + "", n1, r1, i1, s1 + 1);
  };
  const t1 = document,
    n1 = t1.location.href,
    r1 = t1.title;
  let i2 = e(n1);
  const s2 = t1.createElement("script");
  s2.type = "text/javascript";
  s2.src =
    "https://getpocket.com/b/r4.js?h=" +
    i2 +
    "&u=" +
    encodeURIComponent(n1) +
    "&t=" +
    encodeURIComponent(r1);
  e = i2 = function() {};
  const o = t1.getElementsByTagName("head")[0] || t1.documentElement;
  o.appendChild(s2);
})();
