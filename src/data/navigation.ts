export type NavItem = {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string; icon?: string; svg?: string }>;
};

const heatTreatmentSvg = `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 6c-1.2 4.6.6 7.7-2 11-3.3 4.3-11 8.2-11 18 0 9.4 7.2 17 15 17s15-7.6 15-17c0-8.2-4.5-12.4-9.5-17.2C35.5 14.8 34 10.9 32 6Z" fill="#0a7fd1" fill-opacity="0.12"/>
    <path d="M32 10.5c0 3.1-1.5 5.7-4.1 8.8-2.8 3.3-5.9 6.2-5.9 11.6 0 6.7 4.5 11.9 10 11.9s10-5.2 10-11.9c0-4.4-2.5-7.5-6-10.9-2.6-2.4-4-5-4-9.5Z" stroke="#0a7fd1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M34.5 34.8c.7 3.3-1.7 6.2-4.2 6.2-2.5 0-4.3-2.3-4.3-4.8 0-3.6 2.5-5.8 4.5-7.4.5 2.5 2.9 3.5 4 5.9Z" fill="#0a7fd1"/>
  </svg>
`;

const conventionalTreatmentSvg = `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="24" y="16" width="18" height="32" rx="4" stroke="#0a7fd1" stroke-width="2.2" />
    <path d="M28 16c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4" stroke="#0a7fd1" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M27 22h12" stroke="#0a7fd1" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M31 11h6" stroke="#0a7fd1" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M34 37v6" stroke="#0a7fd1" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="34" cy="32" r="6" stroke="#0a7fd1" stroke-width="2.2"/>
    <path d="M16 20h6M14 25h6" stroke="#0a7fd1" stroke-width="2" stroke-linecap="round"/>
  </svg>
`;

const pestControlChildren: NonNullable<NavItem['children']> = [
  { label: 'Ant Control', href: '/pest-control/ant-control/', icon: '/images/ant-icon.webp' },
  { label: 'Cockroach Control', href: '/pest-control/cockroach-control/', icon: '/images/cockroach_icon.webp' },
  { label: 'Flea Control', href: '/pest-control/flea-treatment/', icon: '/images/flea_icon.webp' },
  { label: 'Mite Control', href: '/pest-control/mite-treatment/', icon: '/images/mite.webp' },
  { label: 'Moth Control', href: '/pest-control/moth-control/', icon: '/images/moth.webp' },
  { label: 'Scorpion Control', href: '/pest-control/scorpion-control/', icon: '/images/scorpion.webp' },
  { label: 'Silverfish Control', href: '/pest-control/silverfish-control/', icon: '/images/silverfish.webp' },
  { label: 'Spider Treatment', href: '/pest-control/spider-treatment/', icon: '/images/Spider-Icon.webp' },
  { label: 'Termite Control', href: '/pest-control/termite-control/', icon: '/images/termite-Icon.webp' },
  { label: 'Tick Treatment', href: '/pest-control/tick-treatment/', icon: '/images/ticks-icon.webp' }
];

const bedBugTreatmentChildren: NonNullable<NavItem['children']> = [
  { 
    label: 'Heat Treatment', 
    href: '/bed-bug-treatment/heat-treatment/', 
    svg: heatTreatmentSvg
  },
  { 
    label: 'Conventional Treatment', 
    href: '/bed-bug-treatment/chemical-treatment/', 
    svg: conventionalTreatmentSvg
  }
];

const serviceAreaChildren: NonNullable<NavItem['children']> = [
  { label: 'Tulsa', href: '/service-area/tulsa/' },
  { label: 'Broken Arrow', href: '/service-area/broken-arrow/' },
  { label: 'Sand Springs', href: '/service-area/sand-springs/' },
  { label: 'Jenks', href: '/service-area/jenks/' },
  { label: 'Bixby', href: '/service-area/bixby/' },
  { label: 'Bartlesville', href: '/service-area/bartlesville/' },
  { label: 'Collinsville', href: '/service-area/collinsville/' },
  { label: 'Owasso', href: '/service-area/owasso/' },
  { label: 'Claremore', href: '/service-area/claremore/' },
  { label: 'Muskogee', href: '/service-area/muskogee/' }
];

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Bed Bug Treatment', href: '/bed-bug-treatment/', children: bedBugTreatmentChildren },
  { label: 'Service Area', href: '/service-area/', children: serviceAreaChildren },
  { label: 'Contact Us', href: '/contact-us/' },
  { label: 'Blog', href: '/blog/' }
];
