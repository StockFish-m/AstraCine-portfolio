-- Reset clean (no "already exists" warnings)
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS astracine;
CREATE DATABASE astracine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 1;

USE astracine;

-- ======================
-- 1. USERS
-- ======================
CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100),
                       phone VARCHAR(20),
                       email VARCHAR(100),
                       role VARCHAR(20) NOT NULL, -- ADMIN / STAFF
                       status VARCHAR(20) DEFAULT 'ACTIVE',
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================
-- 2. MEMBERSHIPS
-- ======================
CREATE TABLE memberships (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             name VARCHAR(20), -- NORMAL / SILVER / GOLD
                             discount_percent INT,
                             min_total_spent DECIMAL(14,2)
);

-- ======================
-- 3. CUSTOMERS
-- ======================
CREATE TABLE customers (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           full_name VARCHAR(100),
                           phone VARCHAR(20),
                           email VARCHAR(100),
                           membership_id BIGINT,
                           total_spent DECIMAL(14,2) DEFAULT 0,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           CONSTRAINT fk_customer_membership
                               FOREIGN KEY (membership_id) REFERENCES memberships(id)
);

-- ======================
-- 4. GENRES
-- ======================
CREATE TABLE genres (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50) NOT NULL UNIQUE
);

-- ======================
-- 5. MOVIES
-- ======================
CREATE TABLE movies (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(200) NOT NULL,
                        description TEXT,
                        duration_minutes INT NOT NULL,
                        release_date DATE,
                        end_date DATE,
                        age_rating VARCHAR(10),
                        status VARCHAR(20) DEFAULT 'SHOWING',
                        poster_url TEXT,
                        trailer_url TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- 6. MOVIE_GENRES
-- ======================
CREATE TABLE movie_genres (
                              movie_id BIGINT NOT NULL,
                              genre_id BIGINT NOT NULL,
                              PRIMARY KEY (movie_id, genre_id),
                              CONSTRAINT fk_movie_genres_movie
                                  FOREIGN KEY (movie_id) REFERENCES movies(id),
                              CONSTRAINT fk_movie_genres_genre
                                  FOREIGN KEY (genre_id) REFERENCES genres(id)
);

-- ======================
-- 7. ROOMS
-- ======================
CREATE TABLE rooms (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(50) NOT NULL,
                       total_rows INT NOT NULL,
                       total_columns INT NOT NULL,
                       status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- ======================
-- 8. SEATS
-- ======================
CREATE TABLE seats (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       room_id BIGINT NOT NULL,
                       row_label VARCHAR(5) NOT NULL,
                       column_number INT NOT NULL,
                       seat_type VARCHAR(20) DEFAULT 'NORMAL',
                       UNIQUE (room_id, row_label, column_number),
                       CONSTRAINT fk_seats_room
                           FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- ======================
-- 9. SHOWTIMES
-- ======================
CREATE TABLE showtimes (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           movie_id BIGINT NOT NULL,
                           room_id BIGINT NOT NULL,
                           start_time DATETIME NOT NULL,
                           end_time DATETIME NOT NULL,
                           status VARCHAR(20) DEFAULT 'OPEN',
                           CONSTRAINT fk_showtimes_movie
                               FOREIGN KEY (movie_id) REFERENCES movies(id),
                           CONSTRAINT fk_showtimes_room
                               FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- ======================
-- 10. BOOKINGS
-- ======================
CREATE TABLE bookings (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          customer_id BIGINT,
                          showtime_id BIGINT NOT NULL,
                          status VARCHAR(20) NOT NULL, -- HOLD / CONFIRMED / CANCELLED
                          expired_at DATETIME,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_bookings_customer
                              FOREIGN KEY (customer_id) REFERENCES customers(id),
                          CONSTRAINT fk_bookings_showtime
                              FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
);

-- ======================
-- 11. SHOWTIME_SEATS
-- ======================
CREATE TABLE showtime_seats (
                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                showtime_id BIGINT NOT NULL,
                                seat_id BIGINT NOT NULL,
                                booking_id BIGINT,
                                status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE / HOLD / SOLD
                                hold_expired_at DATETIME,
                                UNIQUE (showtime_id, seat_id),
                                CONSTRAINT fk_showtime_seats_showtime
                                    FOREIGN KEY (showtime_id) REFERENCES showtimes(id),
                                CONSTRAINT fk_showtime_seats_seat
                                    FOREIGN KEY (seat_id) REFERENCES seats(id),
                                CONSTRAINT fk_showtime_seats_booking
                                    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ======================
-- 12. COMBOS
-- ======================
CREATE TABLE combos (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        price DECIMAL(12,2) NOT NULL,
                        status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- ======================
-- 13. INVOICES
-- ======================
CREATE TABLE invoices (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          customer_id BIGINT,
                          staff_id BIGINT NOT NULL,
                          showtime_id BIGINT NOT NULL,
                          total_amount DECIMAL(14,2) NOT NULL,
                          status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT / PAID / CANCELLED
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_invoices_customer
                              FOREIGN KEY (customer_id) REFERENCES customers(id),
                          CONSTRAINT fk_invoices_staff
                              FOREIGN KEY (staff_id) REFERENCES users(id),
                          CONSTRAINT fk_invoices_showtime
                              FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
);

-- ======================
-- 14. PAYMENTS
-- ======================
CREATE TABLE payments (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          invoice_id BIGINT NOT NULL,
                          payment_method VARCHAR(20), -- CASH / MOMO / VNPAY
                          transaction_code VARCHAR(100),
                          amount DECIMAL(14,2),
                          status VARCHAR(20), -- PENDING / SUCCESS / FAILED
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT fk_payments_invoice
                              FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- ======================
-- 15. TICKETS
-- ======================
CREATE TABLE tickets (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         invoice_id BIGINT NOT NULL,
                         showtime_seat_id BIGINT NOT NULL,
                         price DECIMAL(12,2) NOT NULL,
                         qr_code TEXT,
                         status VARCHAR(20) DEFAULT 'VALID',
                         UNIQUE (showtime_seat_id),
                         CONSTRAINT fk_tickets_invoice
                             FOREIGN KEY (invoice_id) REFERENCES invoices(id),
                         CONSTRAINT fk_tickets_showtime_seat
                             FOREIGN KEY (showtime_seat_id) REFERENCES showtime_seats(id)
);

-- ======================
-- 16. INVOICE_COMBOS
-- ======================
CREATE TABLE invoice_combos (
                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                invoice_id BIGINT NOT NULL,
                                combo_id BIGINT NOT NULL,
                                quantity INT NOT NULL,
                                price DECIMAL(12,2) NOT NULL,
                                CONSTRAINT fk_invoice_combos_invoice
                                    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
                                CONSTRAINT fk_invoice_combos_combo
                                    FOREIGN KEY (combo_id) REFERENCES combos(id)
);

-- ======================
-- 17. PROMOTIONS
-- ======================
CREATE TABLE promotions (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            code VARCHAR(50) UNIQUE,
                            discount_type VARCHAR(20), -- PERCENT / FIXED
                            discount_value DECIMAL(12,2),
                            start_date DATE,
                            end_date DATE,
                            status VARCHAR(20)
);

CREATE TABLE invoice_promotions (
                                    invoice_id BIGINT NOT NULL,
                                    promotion_id BIGINT NOT NULL,
                                    PRIMARY KEY (invoice_id, promotion_id),
                                    CONSTRAINT fk_invoice_promotions_invoice
                                        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
                                    CONSTRAINT fk_invoice_promotions_promotion
                                        FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);
