export interface MainSceneLine {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  width: number;
  curvature: number;
}

export const lines: MainSceneLine[] = [
  {
    start: [1, 5.5, 0],
    end: [2.5, 3.2, 0],
    color: '#0057ff',
    width: 0.05,
    curvature: -1,
  }, // right
  {
    start: [-2.5, 3.3, 0],
    end: [1, 5.5, 0],
    color: '#0896d7',
    width: 0.05,
    curvature: -1,
  }, // top
  {
    start: [-2.5, 3.25, 0],
    end: [-1, 1.5, 0],
    color: '#8f08d7',
    width: 0.05,
    curvature: 0.8,
  }, // left
  {
    start: [-1, 1.5, 0],
    end: [2.5, 3.15, 0],
    color: '#d70859',
    width: 0.05,
    curvature: 1,
  }, // bottom
];
