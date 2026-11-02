// Definition of every list-type module managed from the Admin Panel.
// Each entry drives the generic CRUD router (validation, coercion, ordering).
const sort = { type: 'int', default: 0 };
const active = { type: 'bool', default: 1 };
const icon = { type: 'text', max: 60, required: true };

export const RESOURCES = {
  'topbar-items': {
    table: 'topbar_items',
    label: 'Top Bar Items',
    fields: {
      label: { type: 'text', max: 120, required: true },
      value: { type: 'text', max: 120 },
      value_style: { type: 'enum', values: ['green', 'white'], default: 'white' },
      sort_order: sort,
      is_active: active,
    },
  },
  'nav-links': {
    table: 'nav_links',
    label: 'Navigation Links',
    fields: {
      label: { type: 'text', max: 80, required: true },
      target: { type: 'text', max: 255, required: true },
      show_in_header: { type: 'bool', default: 1 },
      show_in_footer: { type: 'bool', default: 1 },
      sort_order: sort,
      is_active: active,
    },
  },
  'hero-highlights': {
    table: 'hero_highlights',
    label: 'Hero Highlights',
    fields: { icon, title: { type: 'text', max: 120, required: true }, sort_order: sort, is_active: active },
  },
  'about-features': {
    table: 'about_features',
    label: 'About Features',
    fields: { icon, title: { type: 'text', max: 120, required: true }, sort_order: sort, is_active: active },
  },
  'service-categories': {
    table: 'service_categories',
    label: 'Service Categories',
    fields: { name: { type: 'text', max: 120, required: true }, sort_order: sort, is_active: active },
  },
  services: {
    table: 'services',
    label: 'Services',
    select: `SELECT s.*, c.name AS category_name FROM services s LEFT JOIN service_categories c ON c.id = s.category_id`,
    alias: 's',
    fields: {
      category_id: { type: 'int', nullable: true },
      icon,
      title: { type: 'text', max: 150, required: true },
      description: { type: 'text', max: 2000 },
      tags: { type: 'json' },
      show_in_footer: { type: 'bool', default: 0 },
      sort_order: sort,
      is_active: active,
    },
  },
  'vip-features': {
    table: 'vip_features',
    label: 'VIP Features',
    fields: {
      icon,
      title: { type: 'text', max: 150, required: true },
      description: { type: 'text', max: 255 },
      sort_order: sort,
      is_active: active,
    },
  },
  'process-steps': {
    table: 'process_steps',
    label: 'Process Steps',
    fields: {
      icon,
      title: { type: 'text', max: 150, required: true },
      description: { type: 'text', max: 255 },
      sort_order: sort,
      is_active: active,
    },
  },
  insights: {
    table: 'insights',
    label: 'Insights',
    fields: {
      title: { type: 'text', max: 255, required: true },
      slug: { type: 'slug', max: 255, from: 'title' },
      category: { type: 'text', max: 80 },
      category_icon: { type: 'text', max: 60, default: 'FileText' },
      image: { type: 'text', max: 500 },
      excerpt: { type: 'text', max: 1000 },
      content: { type: 'text', max: 100000 },
      author: { type: 'text', max: 120 },
      published_on: { type: 'date' },
      read_time: { type: 'text', max: 40 },
      sort_order: sort,
      is_active: active,
    },
  },
  enquiries: {
    table: 'enquiries',
    label: 'Enquiries',
    orderBy: 'created_at DESC, id DESC',
    fields: {
      full_name: { type: 'text', max: 150, required: true },
      company: { type: 'text', max: 150 },
      email: { type: 'email', max: 150, required: true },
      phone: { type: 'text', max: 60 },
      service: { type: 'text', max: 150 },
      message: { type: 'text', max: 5000 },
      status: { type: 'enum', values: ['new', 'in_progress', 'closed'], default: 'new' },
      admin_notes: { type: 'text', max: 5000 },
    },
  },
};

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.status = 400;
    this.field = field;
  }
}

export function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates and coerces an input body against a resource's field definitions.
 * partial=true (PUT) only processes fields that are present.
 */
export function cleanInput(fields, body = {}, { partial = false } = {}) {
  const out = {};
  for (const [name, def] of Object.entries(fields)) {
    const present = Object.prototype.hasOwnProperty.call(body, name);
    if (!present) {
      if (partial) continue;
      if (def.type === 'slug') continue; // generated later
      if (def.required) throw new ValidationError(`${name.replace(/_/g, ' ')} is required`, name);
      if (def.default !== undefined) out[name] = def.default;
      continue;
    }
    let v = body[name];
    switch (def.type) {
      case 'text':
      case 'email':
      case 'slug': {
        v = v === null || v === undefined ? '' : String(v).trim();
        if (def.required && !v) throw new ValidationError(`${name.replace(/_/g, ' ')} is required`, name);
        if (def.max && v.length > def.max) throw new ValidationError(`${name.replace(/_/g, ' ')} must be at most ${def.max} characters`, name);
        if (def.type === 'email' && v && !EMAIL_RE.test(v)) throw new ValidationError('Please enter a valid email address', name);
        if (def.type === 'slug') v = slugify(v);
        out[name] = v === '' && !def.required ? null : v;
        break;
      }
      case 'int': {
        if ((v === '' || v === null || v === undefined) && def.nullable) { out[name] = null; break; }
        const n = Number(v);
        if (!Number.isInteger(n)) throw new ValidationError(`${name.replace(/_/g, ' ')} must be a whole number`, name);
        out[name] = n;
        break;
      }
      case 'bool':
        out[name] = v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0;
        break;
      case 'enum':
        if (!def.values.includes(v)) throw new ValidationError(`${name.replace(/_/g, ' ')} must be one of: ${def.values.join(', ')}`, name);
        out[name] = v;
        break;
      case 'date':
        if (!v) { out[name] = null; break; }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v).slice(0, 10))) throw new ValidationError(`${name.replace(/_/g, ' ')} must be a date (YYYY-MM-DD)`, name);
        out[name] = String(v).slice(0, 10);
        break;
      case 'json': {
        let arr = v;
        if (typeof arr === 'string') {
          try { arr = JSON.parse(arr); } catch { arr = arr.split(','); }
        }
        if (!Array.isArray(arr)) arr = [];
        out[name] = JSON.stringify(arr.map((x) => String(x).trim()).filter(Boolean).slice(0, 20));
        break;
      }
      default:
        out[name] = v;
    }
  }
  return out;
}

// Turn DB rows into API objects (JSON columns parsed).
export function present(fields, row) {
  if (!row) return row;
  const r = { ...row };
  for (const [name, def] of Object.entries(fields)) {
    if (def.type === 'json') {
      try { r[name] = r[name] ? JSON.parse(r[name]) : []; } catch { r[name] = []; }
    }
  }
  return r;
}
