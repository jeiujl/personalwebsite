// Small inline icon set (24×24, stroke-based) so no icon library is needed.
// Shared by <Icon /> and the 3D hero scene, which draws them onto textures.
export const iconPaths = {
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-up-right': 'M7 17 17 7M8 7h9v9',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  sun: 'M12 3v2M12 19v2M5.6 5.6 7 7M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  calendar: 'M5 5h14v15H5zM5 10h14M9 3v4M15 3v4',
  layout: 'M4 4h16v16H4zM4 9h16M9 9v11',
  phone: 'M8 3h8v18H8zM11 18h2',
  'phone-call':
    'M6.5 4h3l1.5 4.5-2 1.5a10 10 0 0 0 5 5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 6a2 2 0 0 1 2-2Z',
  message: 'M4 5h16v11H10l-6 4V5Z',
  users:
    'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14c1.9.8 3 2.9 3 6',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z',
  bolt: 'M13 3 5 14h6l-1 7 8-11h-6l1-7Z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
} as const;

export type IconName = keyof typeof iconPaths;
