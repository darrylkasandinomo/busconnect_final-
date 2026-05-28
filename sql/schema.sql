-- BusConnect — Schema + seed data

CREATE DATABASE IF NOT EXISTS busconnect;
USE busconnect;

-- ── Tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS drivers (
  user_id           INT AUTO_INCREMENT PRIMARY KEY,
  voornaam          VARCHAR(100) NOT NULL,
  achternaam        VARCHAR(100) NOT NULL,
  email             VARCHAR(200) UNIQUE NOT NULL,
  telefoon          VARCHAR(50),
  profile_photo_url LONGTEXT,
  rijbewijs         VARCHAR(10),
  ervaring          INT DEFAULT 0,
  voertuig          VARCHAR(100),
  capaciteit        INT,
  kentekenplaat     VARCHAR(20),
  bouwjaar          INT,
  route             VARCHAR(50),
  school            VARCHAR(100),
  tijd_och          VARCHAR(10),
  tijd_mid          VARCHAR(10),
  dag               VARCHAR(50),
  prijs             INT DEFAULT 0,
  op_afhaal         VARCHAR(50),
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  contact_name       VARCHAR(100),
  contact_achternaam VARCHAR(100),
  contact_email      VARCHAR(200),
  contact_subject    VARCHAR(200),
  contact_message    TEXT,
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bus_locations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  bus_id      VARCHAR(50),
  latitude    DECIMAL(10,8),
  longitude   DECIMAL(11,8),
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Seed data ─────────────────────────────────────────────────

INSERT INTO drivers (
    voornaam, achternaam, email, telefoon,
    rijbewijs, ervaring, voertuig, capaciteit, kentekenplaat, bouwjaar,
    route, school, tijd_och, tijd_mid, dag, prijs, op_afhaal
) VALUES
('Jan',    'Smit',        'jan.smit@example.com',      '+5970000001', 'B', 5,  'Minibus',   8,  'SR-1234', 2018, 'Noord',   'O.S. Flora',     '07:00', '13:00', 'Maandag-Vrijdag',  150, 'Thuis'),
('Maria',  'de Vries',    'maria.devries@example.com', '+5970000002', 'D', 8,  'Schoolbus', 22, 'SR-5678', 2020, 'Zuid',    'HAVO Karmel',    '06:45', '13:30', 'Maandag-Vrijdag',  180, 'Hoek'),
('Carlos', 'Brunings',    'carlos.b@example.com',      '+5970000003', 'B', 3,  'Minibus',   10, 'SR-9101', 2019, 'Oost',    'LTS Nickerie',   '07:15', '14:00', 'Maandag-Vrijdag',  130, 'Thuis'),
('Priya',  'Ramkhelawan', 'priya.r@example.com',       '+5970000004', 'D', 12, 'Schoolbus', 30, 'SR-1121', 2017, 'West',    'VOJ Paramaribo', '06:30', '13:00', 'Maandag-Vrijdag',  200, 'Bushalte'),
('Devon',  'Amoida',      'devon.a@example.com',       '+5970000005', 'B', 6,  'Minibus',   12, 'SR-3141', 2021, 'Centrum', 'O.S. Tammenga',  '07:00', '12:30', 'Maandag-Zaterdag', 160, 'Thuis');

INSERT INTO contact_messages (contact_name, contact_achternaam, contact_email, contact_subject, contact_message) VALUES
('Aisha',  'Jansen',     'aisha.j@example.com',  'Beschikbaarheid',    'Ik wil weten of er plek is op de route Noord voor mijn dochter.'),
('Ravi',   'Soerdjbali', 'ravi.s@example.com',   'Prijzen',            'Wat zijn de kosten voor twee kinderen op dezelfde route?'),
('Sandra', 'Pengel',     'sandra.p@example.com', 'Technisch probleem', 'De tracker werkt niet goed op mijn telefoon.');

INSERT INTO bus_locations (bus_id, latitude, longitude) VALUES
('SR-1234', 5.86520, -55.16682),
('SR-1234', 5.86600, -55.16700),
('SR-1234', 5.86750, -55.16750),
('SR-5678', 5.85100, -55.20300),
('SR-5678', 5.85200, -55.20400);
