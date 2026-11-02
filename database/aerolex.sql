-- Aerolex Advisors — MySQL schema + seed data
-- Import:  mysql -u root -p aerolex < database/aerolex.sql
-- Default admin login: admin / Admin@123  (change it after first login)
-- Note: the API also creates and seeds these tables automatically on first start.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

 
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `about_features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `icon` varchar(60) NOT NULL DEFAULT 'Globe',
  `title` varchar(120) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `about_features` VALUES (1,'Globe','Global Operational Perspective',1,1,'2026-11-02 07:32:55');
INSERT INTO `about_features` VALUES (2,'Clock','24/7 Coordination Support',2,1,'2026-11-02 07:32:55');
INSERT INTO `about_features` VALUES (3,'Scale','Regulatory Expertise',3,1,'2026-11-02 07:32:55');
INSERT INTO `about_features` VALUES (4,'ShieldCheck','Safety-Driven Processes',4,1,'2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `username` varchar(80) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `admins` VALUES (1,'Administrator','admin','$2a$10$ex4ZoDh3TdiR0hc4xQWBzeQwe2hv6JaVbZVUctWxeLwhXbJSc1Q..','2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `enquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `company` varchar(150) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(60) DEFAULT NULL,
  `service` varchar(150) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','in_progress','closed') NOT NULL DEFAULT 'new',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `hero_highlights` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `icon` varchar(60) NOT NULL DEFAULT 'Globe',
  `title` varchar(120) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `hero_highlights` VALUES (1,'Globe','Global Operations',1,1,'2026-11-02 07:32:55');
INSERT INTO `hero_highlights` VALUES (2,'ShieldCheck','Regulatory Expertise',2,1,'2026-11-02 07:32:55');
INSERT INTO `hero_highlights` VALUES (3,'Send','Flight Dispatch',3,1,'2026-11-02 07:32:55');
INSERT INTO `hero_highlights` VALUES (4,'Workflow','Operational Coordination',4,1,'2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `insights` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(80) DEFAULT NULL,
  `category_icon` varchar(60) NOT NULL DEFAULT 'FileText',
  `image` varchar(500) DEFAULT NULL,
  `excerpt` text DEFAULT NULL,
  `content` mediumtext DEFAULT NULL,
  `author` varchar(120) DEFAULT NULL,
  `published_on` date DEFAULT NULL,
  `read_time` varchar(40) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `insights` VALUES (1,'Navigating Flight Permits and Operational Documentation','navigating-flight-permits-and-operational-documentation','Regulatory','FileText','/images/insight-1.jpg','A practical look at lead times, documentation and follow-ups that keep permits on schedule.','Overflight and landing permits are rarely the most visible part of a mission, but they are often the item that decides whether a flight departs on time. Each civil aviation authority sets its own lead times, document formats and approval workflows, and those requirements can change with little notice.\n\n## Start with the lead times\n\nThe first step is to map every country on the route and record its minimum notice period. Some authorities process routine requests within one working day, while others need several days for private or non-scheduled flights. Building the permit plan backwards from the departure time gives the team a clear deadline for every application.\n\n## Keep the document pack complete\n\nMost permit delays come from missing or outdated documents. A standard pack usually includes the certificate of registration, airworthiness certificate, insurance certificate, operator certificate where applicable, and crew licences. Keeping a verified, current set on file for each aircraft removes the need to chase paperwork during a time-critical request.\n\n## Follow up before it becomes urgent\n\nSubmitting the application is only half the job. A structured follow-up schedule — confirming receipt, checking status at set intervals and escalating early when a reply is overdue — keeps permits moving and gives the operator an accurate picture of readiness.\n\n## Plan for amendments\n\nSchedules change. When a departure time, routing or aircraft changes, the related permits may need to be amended or reissued. Tracking which permits depend on which flight details means the right authorities can be contacted immediately, instead of discovering a mismatch on the day of operation.\n\nGood permit handling is ultimately about visibility: knowing what is required, what has been submitted, and what is still outstanding at any moment in the mission timeline.','Aerolex Operations Desk','2026-10-08','5 min read',1,1,'2026-11-02 07:32:55');
INSERT INTO `insights` VALUES (2,'Building Better Coordination Across Aviation Stakeholders','building-better-coordination-across-aviation-stakeholders','Coordination','Share2','/images/insight-2.jpg','How clear communication between operators, handlers and authorities reduces operational friction.','A single flight can involve the operator, crew, ground handlers, fuel suppliers, airport authorities, air traffic services and the passengers themselves. Each party holds part of the information the others need, and most operational friction comes from that information arriving late or incomplete.\n\n## Agree on one source of truth\n\nCoordination works best when every stakeholder knows where the latest confirmed details live. A shared mission summary — schedule, aircraft, crew, services requested and status of each — reduces the back-and-forth of repeated questions and conflicting versions.\n\n## Communicate changes, not just plans\n\nThe initial plan is usually well communicated. Problems appear when something changes. A clear process for announcing amendments, including who must be told and how quickly, keeps handlers, fuel providers and airports aligned with the current schedule.\n\n## Confirm, then confirm again\n\nRequests sent are not the same as requests confirmed. Tracking acknowledgements from each service provider, and re-confirming critical services close to departure, gives the operator confidence that everything ordered will be in place on arrival.\n\n## Close the loop after the flight\n\nA short post-flight review captures what worked and where communication slowed down. Over time, these notes become a practical playbook for each airport and supplier, making future missions faster to plan and easier to run.','Aerolex Operations Desk','2026-09-22','4 min read',2,1,'2026-11-02 07:32:55');
INSERT INTO `insights` VALUES (3,'Preparing for Operational Disruptions','preparing-for-operational-disruptions','Operations','Shield','/images/insight-3.jpg','Structured approaches to delays, diversions and schedule changes that protect your mission.','Weather, technical issues, airport restrictions and late passenger changes can all disrupt a carefully planned flight. Disruptions cannot be eliminated, but their impact can be reduced significantly with preparation done before the aircraft leaves the ground.\n\n## Identify alternates early\n\nFor each leg, the team should know the suitable alternate airports, their operating hours, handling availability and any permit implications. When a diversion becomes necessary, decisions can then be made in minutes rather than hours.\n\n## Watch the critical timings\n\nAirport opening hours, slot windows, crew duty limits and permit validity periods all create deadlines. Monitoring these together shows how much a delay can grow before it affects the rest of the mission, and when an extension of watch hours or a new slot should be requested.\n\n## Keep stakeholders informed\n\nDuring a disruption, regular and accurate updates matter as much as the solution itself. Handlers need revised arrival times, crews need updated duty plans and passengers need realistic expectations. A predictable update rhythm prevents confusion and duplicated effort.\n\n## Document and learn\n\nEvery disruption is useful data. Recording what happened, how long each step took and which contacts were most effective builds a stronger response for the next time a similar situation occurs.\n\nPrepared teams do not avoid every disruption — they simply recover from them faster and with less impact on the mission.','Aerolex Operations Desk','2026-09-05','6 min read',3,1,'2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size_bytes` int(11) NOT NULL,
  `data` longblob NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nav_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(80) NOT NULL,
  `target` varchar(255) NOT NULL,
  `show_in_header` tinyint(1) NOT NULL DEFAULT 1,
  `show_in_footer` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `nav_links` VALUES (1,'Home','#home',1,1,1,1,'2026-11-02 07:32:55');
INSERT INTO `nav_links` VALUES (2,'About','#about',1,1,2,1,'2026-11-02 07:32:55');
INSERT INTO `nav_links` VALUES (3,'Services','#services',1,1,3,1,'2026-11-02 07:32:55');
INSERT INTO `nav_links` VALUES (4,'VIP Aviation','#vip',1,1,4,1,'2026-11-02 07:32:55');
INSERT INTO `nav_links` VALUES (5,'Our Process','#process',1,1,5,1,'2026-11-02 07:32:55');
INSERT INTO `nav_links` VALUES (6,'Insights','#insights',1,1,6,1,'2026-11-02 07:32:55');
INSERT INTO `nav_links` VALUES (7,'Contact','#contact',1,1,7,1,'2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `process_steps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `icon` varchar(60) NOT NULL DEFAULT 'Headset',
  `title` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `process_steps` VALUES (1,'Headset','Operations Intake','Review mission details, schedules, documentation, and requested services.',1,1,'2026-11-02 07:32:55');
INSERT INTO `process_steps` VALUES (2,'ClipboardCheck','Feasibility & Preparation','Coordinate operational information and identify relevant requirements.',2,1,'2026-11-02 07:32:55');
INSERT INTO `process_steps` VALUES (3,'Settings','Coordination & Monitoring','Follow up with stakeholders and communicate operational updates.',3,1,'2026-11-02 07:32:55');
INSERT INTO `process_steps` VALUES (4,'PlaneTakeoff','Operational Readiness','Consolidate updates and communicate the latest readiness information.',4,1,'2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `service_categories` VALUES (1,'Flight Operations',1,1,'2026-11-02 07:32:55');
INSERT INTO `service_categories` VALUES (2,'Regulatory & Documentation',2,1,'2026-11-02 07:32:55');
INSERT INTO `service_categories` VALUES (3,'Airport & Ground Services',3,1,'2026-11-02 07:32:55');
INSERT INTO `service_categories` VALUES (4,'Crew & Passenger Services',4,1,'2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `icon` varchar(60) NOT NULL DEFAULT 'FileCheck',
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `show_in_footer` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_service_category` (`category_id`),
  CONSTRAINT `fk_service_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `services` VALUES (1,2,'FileCheck','Permit Handling','Coordinate overflight and landing permits, operational documentation, and application follow-ups.','[\"Overflight Permits\",\"Landing Permits\",\"Documentation Coordination\"]',1,1,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (2,1,'RadioTower','ATC Clearances','Support flight plan filing, air traffic clearance coordination, operational communications, and amendments.','[\"ATS Flight Plans\",\"Clearance Coordination\",\"Flight Plan Amendments\"]',1,2,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (3,1,'Route','Flight Planning','Coordinate route requirements, weather information, airspace restrictions, and flight preparation considerations.','[\"Route Review\",\"Weather Coordination\",\"Operational Planning\"]',1,3,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (4,1,'Gauge','Runway Analysis & Performance','Support the review of runway conditions, performance information, airport limitations, and operational documentation.','[\"Runway Conditions\",\"Performance Information\",\"Airport Limitations\"]',1,4,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (5,1,'Scale','Weight & Balance','Coordinate aircraft loading information and weight-and-balance documentation for operational preparation.','[\"Load Information\",\"Weight & Balance Documentation\",\"Loading Coordination\"]',1,5,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (6,3,'Clock','Extension of Watch Hours','Coordinate extended airport service availability requests and follow up with relevant service providers.','[\"Service Availability\",\"Airport Coordination\",\"Request Tracking\"]',1,6,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (7,1,'Radar','Flight Tracking','Monitor flight progress and coordinate updates about delays, arrival times, and operational disruptions.','[\"Flight Status\",\"Delay Updates\",\"Stakeholder Communication\"]',1,7,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (8,2,'Stamp','Visa Assistance','Coordinate crew and passenger travel documentation requirements and organize relevant visa paperwork.','[\"Travel Documentation\",\"Visa Guidance\",\"Readiness Checks\"]',0,8,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (9,3,'CalendarClock','Slot Coordination','Coordinate airport slot requests, scheduling requirements, timing changes, and status updates.','[\"Airport Slot Requests\",\"Schedule Coordination\",\"Status Follow-up\"]',0,9,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (10,3,'Fuel','Ground Handling','Coordinate ground services, aircraft turnaround requirements, fuel arrangements, and airport service providers.','[\"Ground Handling\",\"Fuel Coordination\",\"Turnaround Support\"]',0,10,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (11,4,'Users','Crew & Passenger Support','Coordinate crew logistics, accommodation, transportation, and passenger service requirements.','[\"Crew Logistics\",\"Ground Transportation\",\"Passenger Services\"]',0,11,1,'2026-11-02 07:32:55');
INSERT INTO `services` VALUES (12,2,'ShieldCheck','Regulatory Compliance','Support regulatory documentation, requirement tracking, and compliance-related operational coordination.','[\"Documentation Support\",\"Regulatory Tracking\",\"Compliance Coordination\"]',0,12,1,'2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_sections` (
  `section_key` varchar(40) NOT NULL,
  `label` varchar(80) NOT NULL,
  `eyebrow` varchar(150) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `title_highlight` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `btn1_text` varchar(80) DEFAULT NULL,
  `btn1_link` varchar(255) DEFAULT NULL,
  `btn2_text` varchar(80) DEFAULT NULL,
  `btn2_link` varchar(255) DEFAULT NULL,
  `badge_label` varchar(120) DEFAULT NULL,
  `badge_value` varchar(120) DEFAULT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`section_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `site_sections` VALUES ('about','About','About Aerolex','Your Trusted Partner in','Aviation Operations.','Aerolex Advisors provides specialized aviation operations support, regulatory advisory, and operational coordination to help aviation operators manage complex requirements with greater clarity and precision.','/images/about.jpg','Discover Our Services','#services',NULL,NULL,NULL,NULL,1,2,'2026-11-02 07:32:55');
INSERT INTO `site_sections` VALUES ('contact','Contact','Contact','Start the conversation.','','Share your mission details and our operations team will respond with a tailored plan.','/images/contact-bg.jpg','Send Enquiry',NULL,NULL,NULL,'Thank you! Your enquiry has been received.','Our operations desk will get back to you shortly.',1,8,'2026-11-02 07:32:55');
INSERT INTO `site_sections` VALUES ('cta','Get Started (CTA)','Get Started','Let\'s Keep Your Operations','Moving.','Tell us about your next flight, operational requirements, or aviation support needs.','/images/cta.jpg','Get in Touch','#contact','Explore Our Services','#services',NULL,NULL,1,7,'2026-11-02 07:32:55');
INSERT INTO `site_sections` VALUES ('hero','Hero','Aviation Operations & Strategic Advisory','Precision in','Every Flight.','Expert aviation operations, regulatory coordination, and strategic support for commercial airlines, private aviation operators, and high-value flight missions.','/images/hero.jpg','Explore Our Services','#services','Get in Touch','#contact','Operations Desk','24/7 Coverage',1,1,'2026-11-02 07:32:55');
INSERT INTO `site_sections` VALUES ('insights','Insights','Aviation Insights','Perspectives from the operations desk.','',NULL,NULL,'Read Article',NULL,NULL,NULL,NULL,NULL,1,6,'2026-11-02 07:32:55');
INSERT INTO `site_sections` VALUES ('process','Our Process','Our Process','Every Flight Moves Through a','Structured Process.',NULL,'/images/process-bg.jpg',NULL,NULL,NULL,NULL,NULL,NULL,1,5,'2026-11-02 07:32:55');
INSERT INTO `site_sections` VALUES ('services','Services','Our Services','Operational Expertise.','Delivered with Precision.','Comprehensive aviation services designed to simplify operational complexity and support every stage of the flight lifecycle.',NULL,'Enquire Service','#contact',NULL,NULL,NULL,NULL,1,3,'2026-11-02 07:32:55');
INSERT INTO `site_sections` VALUES ('vip','VIP Aviation','VIP & Business Aviation','Exceptional Support for','High-Value Missions.','Structured, detail-oriented operational support for private charter coordination and executive aviation logistics.','/images/vip.webp','Discuss Your Mission','#contact',NULL,NULL,NULL,NULL,1,4,'2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL,
  `site_name` varchar(150) NOT NULL DEFAULT 'Aerolex Advisors',
  `logo` varchar(500) DEFAULT NULL,
  `cta_text` varchar(80) DEFAULT NULL,
  `cta_link` varchar(255) DEFAULT NULL,
  `topbar_link_text` varchar(120) DEFAULT NULL,
  `topbar_link_url` varchar(255) DEFAULT NULL,
  `topbar_frequency` varchar(120) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(60) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `footer_about` text DEFAULT NULL,
  `copyright_text` varchar(255) DEFAULT NULL,
  `footer_tagline` varchar(150) DEFAULT NULL,
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` varchar(300) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `site_settings` VALUES (1,'Aerolex Advisors','/images/logo.png','Book a Consultation','#contact','Operations Desk Login','/admin/login','FREQ: 131.850 MHz','ops@aerolexadvisors.com','+00 000 000 0000','Global Operations Desk — 24/7','Aviation operations and strategic advisory for airlines, private operators and high-value missions.','© 2026 Aerolex Advisors. All rights reserved.','Precision in Every Flight.','Aerolex Advisors | Aviation Operations & Strategic Advisory','Expert aviation operations, regulatory coordination, and strategic support for commercial airlines, private aviation operators, and high-value flight missions.','2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `topbar_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(120) NOT NULL,
  `value` varchar(120) DEFAULT NULL,
  `value_style` enum('green','white') NOT NULL DEFAULT 'white',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `topbar_items` VALUES (1,'Aerolex Ops Dispatch','Active 24/7/365','green',1,1,'2026-11-02 07:32:55');
INSERT INTO `topbar_items` VALUES (2,'ATC Direct Clearance','Online','white',2,1,'2026-11-02 07:32:55');
INSERT INTO `topbar_items` VALUES (3,'ICAO / IATA Watch Extension','Available','white',3,1,'2026-11-02 07:32:55');
INSERT INTO `topbar_items` VALUES (4,'Global Slots Desk','Open','green',4,1,'2026-11-02 07:32:55');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vip_features` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `icon` varchar(60) NOT NULL DEFAULT 'PlaneLanding',
  `title` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `vip_features` VALUES (1,'PlaneLanding','Ramp & Ground Coordination','Airport services and ground arrangements.',1,1,'2026-11-02 07:32:55');
INSERT INTO `vip_features` VALUES (2,'BedDouble','Crew Logistics','Crew accommodation and transportation.',2,1,'2026-11-02 07:32:55');
INSERT INTO `vip_features` VALUES (3,'Sparkles','Passenger Experience','Passenger requests and travel coordination.',3,1,'2026-11-02 07:32:55');
INSERT INTO `vip_features` VALUES (4,'Eye','Mission Oversight','Operational updates and stakeholder communication.',4,1,'2026-11-02 07:32:55');

SET FOREIGN_KEY_CHECKS = 1;
