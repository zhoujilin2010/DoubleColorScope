function transpose(m: number[][]): number[][] {
  return m[0].map((_, i) => m.map(row => row[i]));
}

function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * b[i], 0);
}

function scale(v: number[], s: number): number[] {
  return v.map(x => x * s);
}

function sub(a: number[], b: number[]): number[] {
  return a.map((x, i) => x - b[i]);
}

function norm(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

function normalize(v: number[]): number[] {
  const n = norm(v);
  return n === 0 ? v : scale(v, 1 / n);
}

function meanMatrixCols(m: number[][]): number[] {
  const cols = m[0].length;
  return Array.from({ length: cols }, (_, j) => {
    let sum = 0;
    for (let i = 0; i < m.length; i++) sum += m[i][j];
    return sum / m.length;
  });
}

function centerMatrix(m: number[][]): number[][] {
  const means = meanMatrixCols(m);
  return m.map(row => row.map((v, j) => v - means[j]));
}

function powerIteration(A: number[][], iterations = 50): { eigenvalue: number; eigenvector: number[] } {
  const n = A.length;
  let v: number[] = Array.from({ length: n }, (_, i) => i === 0 ? 1 : 0);
  for (let iter = 0; iter < iterations; iter++) {
    const Av = A.map(row => dot(row, v));
    const nrm = norm(Av);
    if (nrm < 1e-10) break;
    v = scale(Av, 1 / nrm);
  }
  const Av = A.map(row => dot(row, v));
  const eigenvalue = dot(v, Av);
  return { eigenvalue, eigenvector: v };
}

export function pca(data: number[][], components = 2): number[][] {
  if (data.length === 0) return [];
  const centered = centerMatrix(data);
  const cov = transpose(centered);

  const eigenvectors: number[][] = [];
  let residual = centered;

  for (let c = 0; c < components; c++) {
    const covMat = transpose(residual).map((_, i) =>
      transpose(residual).map((_, j) => {
        let sum = 0;
        for (let k = 0; k < residual.length; k++) sum += residual[k][i] * residual[k][j];
        return sum / (residual.length - 1);
      })
    );
    const { eigenvector } = powerIteration(covMat, 50);
    eigenvectors.push(eigenvector);
    residual = residual.map(row => {
      const proj = dot(row, eigenvector);
      return row.map((v, j) => v - proj * eigenvector[j]);
    });
  }

  return centered.map(row =>
    eigenvectors.map(ev => dot(row, ev))
  );
}

export function applyPcaToDraws(vectors: number[][]): { x: number; y: number }[] {
  if (vectors.length < 2) return vectors.map(() => ({ x: 0, y: 0 }));
  const result = pca(vectors, 2);
  return result.map(p => ({ x: p[0], y: p[1] }));
}
