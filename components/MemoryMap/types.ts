export type InterestNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  fx?: number;
  fy?: number;
  createdAt: number;
};

export type InterestEdge = {
  id: string;
  source: string;
  target: string;
  type?: 'mesh' | 'link';
  weight?: number;
};

export type ViewState = {
  panX: number;
  panY: number;
  zoom: number;
};
