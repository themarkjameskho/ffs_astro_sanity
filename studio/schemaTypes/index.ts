import { blogPost } from './documents/blogPost';
import { category } from './documents/blogCategory';
import { author } from './documents/blogAuthor';
import { tag } from './documents/blogTag';
import { globalSettings } from './documents/globalSettings';
import { page } from './documents/page';
import { serviceAreaFolder } from './documents/serviceAreaFolder';
import { blogListSection } from './objects/blogListSection';
import { contactSection } from './objects/contactSection';
import { ctaSection } from './objects/ctaSection';
import { heroSection } from './objects/heroSection';
import { faqSection } from './objects/faqSection';
import { areasSection } from './objects/areasSection';
import { stepsSection } from './objects/stepsSection';
import { htmlSection } from './objects/htmlSection';
import { iconGridSection } from './objects/iconGridSection';
import { processSection } from './objects/processSection';
import { serviceAreaSection } from './objects/serviceAreaSection';
import { serviceGridSection } from './objects/serviceGridSection';
import { twoColTextImageSection } from './objects/twoColTextImageSection';
import { leadFormSection } from './objects/leadFormSection';
import { contactInfo } from './settings/contactInfo';
import { seo } from './settings/seo';

export const schemaTypes = [
  // Documents
  page,
  blogPost,
  category,
  author,
  tag,
  globalSettings,
  serviceAreaFolder,
  // Sections
  heroSection,
  faqSection,
  areasSection,
  stepsSection,
  serviceGridSection,
  processSection,
  serviceAreaSection,
  ctaSection,
  contactSection,
  blogListSection,
  iconGridSection,
  twoColTextImageSection,
  htmlSection,
  leadFormSection,
  // Settings
  seo,
  contactInfo
];
