-- BusConnect — Full database schema + seed data

CREATE DATABASE IF NOT EXISTS busconnect_final;
USE busconnect_final;

-- ── Tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_messages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL,
    achternaam  VARCHAR(100),
    email       VARCHAR(100) NOT NULL,
    subject     VARCHAR(100),
    message     TEXT         NOT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id           INT AUTO_INCREMENT PRIMARY KEY,
    voornaam          VARCHAR(50)   NOT NULL,
    achternaam        VARCHAR(100)  NOT NULL,
    email             VARCHAR(100)  NOT NULL UNIQUE,
    telefoon          VARCHAR(20)   NOT NULL,
    profile_photo_url LONGTEXT      DEFAULT NULL,
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_applications (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT           NULL,
    applied_email     VARCHAR(255)  NOT NULL,
    applied_phone     VARCHAR(50)   NOT NULL,
    profile_photo_url TEXT          NULL,
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voertuigen (
    voertuigen_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT          NOT NULL,
    rijbewijs     VARCHAR(20)  NOT NULL,
    ervaring      INT          NOT NULL,
    voertuig      VARCHAR(50)  NOT NULL,
    capaciteit    INT          NOT NULL,
    kentekenplaat VARCHAR(20)  NOT NULL,
    bouwjaar      INT          NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS school_details (
    school_details_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT          NOT NULL,
    route             VARCHAR(225) NOT NULL,
    school            VARCHAR(255) NOT NULL,
    tijd_och          TIME,
    tijd_mid          TIME,
    dag               VARCHAR(150),
    prijs             DECIMAL(10,2),
    op_afhaal         VARCHAR(20)  NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    email    VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- ── Seed data ─────────────────────────────────────────────────

-- Admin accounts (passwords are bcrypt hashes of 'admin123')
INSERT INTO admins (email, password) VALUES
('admin@busconnect.sr',   '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'),
('manager@busconnect.sr', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');

-- Sample driver users
INSERT INTO users (voornaam, achternaam, email, telefoon) VALUES
('Jan',    'Smit',        'jan.smit@example.com',      '+5970000001'),
('Maria',  'de Vries',    'maria.devries@example.com', '+5970000002'),
('Carlos', 'Brunings',    'carlos.b@example.com',      '+5970000003'),
('Priya',  'Ramkhelawan', 'priya.r@example.com',       '+5970000004'),
('Devon',  'Amoida',      'devon.a@example.com',       '+5970000005');

-- Vehicle information per driver
INSERT INTO voertuigen (user_id, rijbewijs, ervaring, voertuig, capaciteit, kentekenplaat, bouwjaar) VALUES
(1, 'B', 5,  'Minibus',   8,  'SR-1234', 2018),
(2, 'D', 8,  'Schoolbus', 22, 'SR-5678', 2020),
(3, 'B', 3,  'Minibus',   10, 'SR-9101', 2019),
(4, 'D', 12, 'Schoolbus', 30, 'SR-1121', 2017),
(5, 'B', 6,  'Minibus',   12, 'SR-3141', 2021);

-- School and route details per driver
INSERT INTO school_details (user_id, route, school, tijd_och, tijd_mid, dag, prijs, op_afhaal) VALUES
(1, 'Noord',   'O.S. Flora',     '07:00', '13:00', 'Maandag-Vrijdag',  150.00, 'Thuis'),
(2, 'Zuid',    'HAVO Karmel',    '06:45', '13:30', 'Maandag-Vrijdag',  180.00, 'Hoek'),
(3, 'Oost',    'LTS Nickerie',   '07:15', '14:00', 'Maandag-Vrijdag',  130.00, 'Thuis'),
(4, 'West',    'VOJ Paramaribo', '06:30', '13:00', 'Maandag-Vrijdag',  200.00, 'Bushalte'),
(5, 'Centrum', 'O.S. Tammenga', '07:00', '12:30', 'Maandag-Zaterdag', 160.00, 'Thuis');

-- Sample job applications
INSERT INTO job_applications (user_id, applied_email, applied_phone) VALUES
(1, 'jan.smit@example.com',      '+5970000001'),
(2, 'maria.devries@example.com', '+5970000002'),
(3, 'carlos.b@example.com',      '+5970000003');

-- Sample contact messages
INSERT INTO contact_messages (name, achternaam, email, subject, message) VALUES
('Aisha',  'Jansen',     'aisha.j@example.com',  'Beschikbaarheid',    'Ik wil weten of er plek is op de route Noord voor mijn dochter.'),
('Ravi',   'Soerdjbali', 'ravi.s@example.com',   'Prijzen',            'Wat zijn de kosten voor twee kinderen op dezelfde route?'),
('Sandra', 'Pengel',     'sandra.p@example.com', 'Technisch probleem', 'De tracker werkt niet goed op mijn telefoon.');
