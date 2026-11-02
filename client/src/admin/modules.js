// Admin Panel configuration for every list-type module.
// fields: what the add/edit form shows. columns: what the table shows.
const sortActive = [
  { name: 'sort_order', label: 'Display order', type: 'number', help: 'Lower numbers appear first' },
  { name: 'is_active', label: 'Visible on website', type: 'bool', default: true },
];

export const MODULES = {
  'topbar-items': {
    title: 'Top Bar Items',
    singular: 'top bar item',
    section: 'Top bar',
    description: 'The live status strip above the header (e.g. "ATC Direct Clearance: Online").',
    columns: ['label', 'value', 'value_style'],
    fields: [
      { name: 'label', label: 'Label', required: true, placeholder: 'ATC Direct Clearance' },
      { name: 'value', label: 'Status value', placeholder: 'Online' },
      { name: 'value_style', label: 'Value colour', type: 'select', default: 'white', options: [{ value: 'white', label: 'White (bold)' }, { value: 'green', label: 'Green (active)' }] },
      ...sortActive,
    ],
  },
  'nav-links': {
    title: 'Navigation Links',
    singular: 'navigation link',
    section: 'Header & footer',
    description: 'Menu links in the header and the "Quick Links" column of the footer. Use #section to scroll to a section on the home page.',
    columns: ['label', 'target', 'show_in_header', 'show_in_footer'],
    fields: [
      { name: 'label', label: 'Label', required: true, placeholder: 'Services' },
      { name: 'target', label: 'Link target', required: true, placeholder: '#services', help: 'Sections: #home, #about, #services, #vip, #process, #insights, #contact — or a full URL' },
      { name: 'show_in_header', label: 'Show in header menu', type: 'bool', default: true },
      { name: 'show_in_footer', label: 'Show in footer Quick Links', type: 'bool', default: true },
      ...sortActive,
    ],
  },
  'hero-highlights': {
    title: 'Hero Highlights',
    singular: 'highlight',
    section: 'Hero',
    description: 'The four icon + text items in the dark strip below the hero banner.',
    columns: ['icon', 'title'],
    fields: [
      { name: 'icon', label: 'Icon', type: 'icon', required: true, default: 'Globe' },
      { name: 'title', label: 'Title', required: true, placeholder: 'Global Operations' },
      ...sortActive,
    ],
  },
  'about-features': {
    title: 'About Features',
    singular: 'feature',
    section: 'About',
    description: 'The feature boxes in the About Aerolex section.',
    columns: ['icon', 'title'],
    fields: [
      { name: 'icon', label: 'Icon', type: 'icon', required: true, default: 'Globe' },
      { name: 'title', label: 'Title', required: true, placeholder: '24/7 Coordination Support' },
      ...sortActive,
    ],
  },
  'service-categories': {
    title: 'Service Categories',
    singular: 'category',
    section: 'Services',
    description: 'The filter tabs above the services grid. A tab only shows when it has at least one visible service.',
    columns: ['name'],
    fields: [
      { name: 'name', label: 'Category name', required: true, placeholder: 'Flight Operations' },
      ...sortActive,
    ],
  },
  services: {
    title: 'Services',
    singular: 'service',
    section: 'Services',
    description: 'Service cards in the Our Services section. Cards are numbered automatically in display order.',
    columns: ['icon', 'title', 'category_name', 'tags', 'show_in_footer'],
    fields: [
      { name: 'title', label: 'Service title', required: true, placeholder: 'Permit Handling' },
      { name: 'category_id', label: 'Category', type: 'select', optionsFrom: 'service-categories', optionLabel: 'name', placeholder: 'No category' },
      { name: 'icon', label: 'Icon', type: 'icon', required: true, default: 'FileCheck' },
      { name: 'show_in_footer', label: 'Show in footer Services list', type: 'bool', default: false },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'tags', label: 'Tags', type: 'tags', full: true, help: 'Small labels shown on the card. Press Enter after each one.' },
      ...sortActive,
    ],
  },
  'vip-features': {
    title: 'VIP Features',
    singular: 'VIP feature',
    section: 'VIP Aviation',
    description: 'The list of support areas in the VIP & Business Aviation section.',
    columns: ['icon', 'title', 'description'],
    fields: [
      { name: 'icon', label: 'Icon', type: 'icon', required: true, default: 'PlaneLanding' },
      { name: 'title', label: 'Title', required: true, placeholder: 'Crew Logistics' },
      { name: 'description', label: 'Short description', full: true },
      ...sortActive,
    ],
  },
  'process-steps': {
    title: 'Process Steps',
    singular: 'process step',
    section: 'Our Process',
    description: 'The step cards in the Our Process section (icons alternate red / dark red).',
    columns: ['icon', 'title', 'description'],
    fields: [
      { name: 'icon', label: 'Icon', type: 'icon', required: true, default: 'Headset' },
      { name: 'title', label: 'Title', required: true, placeholder: 'Operations Intake' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      ...sortActive,
    ],
  },
  insights: {
    title: 'Insights',
    singular: 'article',
    section: 'Insights',
    description: 'Articles shown in Aviation Insights. Each one has its own detail page at /insights/slug.',
    columns: ['image', 'title', 'category', 'published_on'],
    viewLink: (r) => `/insights/${r.slug}`,
    fields: [
      { name: 'title', label: 'Title', required: true, full: true },
      { name: 'slug', label: 'URL slug', help: 'Leave empty to generate from the title' },
      { name: 'category', label: 'Category tag', placeholder: 'Regulatory' },
      { name: 'category_icon', label: 'Category icon', type: 'icon', default: 'FileText' },
      { name: 'published_on', label: 'Publish date', type: 'date' },
      { name: 'author', label: 'Author', placeholder: 'Aerolex Operations Desk' },
      { name: 'read_time', label: 'Read time', placeholder: '5 min read' },
      { name: 'image', label: 'Cover image', type: 'image', full: true },
      { name: 'excerpt', label: 'Excerpt (card text)', type: 'textarea', full: true },
      { name: 'content', label: 'Article content', type: 'textarea', tall: true, full: true, help: 'Separate paragraphs with a blank line. Start a line with "## " for a sub-heading and "- " for bullet points.' },
      ...sortActive,
    ],
  },
};

export const FIELD_LABELS = {
  label: 'Label', value: 'Value', value_style: 'Colour', target: 'Link', show_in_header: 'Header', show_in_footer: 'Footer',
  icon: 'Icon', title: 'Title', name: 'Name', category_name: 'Category', tags: 'Tags', description: 'Description',
  image: 'Image', category: 'Category', published_on: 'Published',
};
