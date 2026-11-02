// MySQL schema for Aerolex. All statements are idempotent (IF NOT EXISTS).
export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY,
    site_name VARCHAR(150) NOT NULL DEFAULT 'Aerolex Advisors',
    logo VARCHAR(500) NULL,
    cta_text VARCHAR(80) NULL,
    cta_link VARCHAR(255) NULL,
    topbar_link_text VARCHAR(120) NULL,
    topbar_link_url VARCHAR(255) NULL,
    topbar_frequency VARCHAR(120) NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(60) NULL,
    address VARCHAR(255) NULL,
    footer_about TEXT NULL,
    copyright_text VARCHAR(255) NULL,
    footer_tagline VARCHAR(150) NULL,
    meta_title VARCHAR(200) NULL,
    meta_description VARCHAR(300) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS site_sections (
    section_key VARCHAR(40) PRIMARY KEY,
    label VARCHAR(80) NOT NULL,
    eyebrow VARCHAR(150) NULL,
    title VARCHAR(255) NULL,
    title_highlight VARCHAR(255) NULL,
    description TEXT NULL,
    image VARCHAR(500) NULL,
    btn1_text VARCHAR(80) NULL,
    btn1_link VARCHAR(255) NULL,
    btn2_text VARCHAR(80) NULL,
    btn2_link VARCHAR(255) NULL,
    badge_label VARCHAR(120) NULL,
    badge_value VARCHAR(120) NULL,
    is_visible TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS topbar_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(120) NOT NULL,
    value VARCHAR(120) NULL,
    value_style ENUM('green','white') NOT NULL DEFAULT 'white',
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS nav_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(80) NOT NULL,
    target VARCHAR(255) NOT NULL,
    show_in_header TINYINT(1) NOT NULL DEFAULT 1,
    show_in_footer TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS hero_highlights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(60) NOT NULL DEFAULT 'Globe',
    title VARCHAR(120) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS about_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(60) NOT NULL DEFAULT 'Globe',
    title VARCHAR(120) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NULL,
    icon VARCHAR(60) NOT NULL DEFAULT 'FileCheck',
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    tags TEXT NULL,
    show_in_footer TINYINT(1) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_category FOREIGN KEY (category_id)
      REFERENCES service_categories(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS vip_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(60) NOT NULL DEFAULT 'PlaneLanding',
    title VARCHAR(150) NOT NULL,
    description VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS process_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(60) NOT NULL DEFAULT 'Headset',
    title VARCHAR(150) NOT NULL,
    description VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(80) NULL,
    category_icon VARCHAR(60) NOT NULL DEFAULT 'FileText',
    image VARCHAR(500) NULL,
    excerpt TEXT NULL,
    content MEDIUMTEXT NULL,
    author VARCHAR(120) NULL,
    published_on DATE NULL,
    read_time VARCHAR(40) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    company VARCHAR(150) NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(60) NULL,
    service VARCHAR(150) NULL,
    message TEXT NULL,
    status ENUM('new','in_progress','closed') NOT NULL DEFAULT 'new',
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INT NOT NULL,
    data LONGBLOB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];
