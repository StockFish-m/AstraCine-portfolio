# 🎬 AstraCine - Modern Cinema Management System

 A comprehensive Cinema Management System (ERP & Booking Platform) featuring an advanced Auto-Scheduling Engine, Dynamic Pricing, and robust Concurrency Control.

## 📝 Project Overview

**AstraCine** is a full-fledged cinema management platform designed to solve complex operational challenges for modern movie theater chains. It provides a seamless ticket-booking experience for customers while offering a powerful, automated administrative dashboard for theater managers and staff.

## ⭐ Core Features (Killer Features)

Beyond basic CRUD operations, AstraCine tackles high-level technical and business challenges:

### 1. 🧠 Smart Auto-Scheduling Engine
* Automatically generates showtimes based on complex constraints: movie duration, mandatory cleanup buffer times, and room capacity.
* Integrated **Heuristic Scoring Algorithm**:
  * **Prime Time Allocation:** Prioritizes blockbusters (high priority) for peak hours and large capacity rooms.
  * **Late Night Rule:** Automatically shifts C18/C16 rated movies to late-night slots while restricting family/kids' movies.
* **Draft & Preview Mechanism:** Allows Admins to preview and manually fine-tune the AI-generated schedule on a Timeline interface before executing a Batch Save to the database.

### 2. 💲 Dynamic Pricing Engine
Ticket prices are calculated dynamically in real-time, completely eliminating hard-coded values:
* `Final Price = Base Seat Price × Time Slot Multiplier × Room Multiplier × Special Day Multiplier`
* **Price Synchronization:** A smart sync tool that allows Admins to update global base prices and selectively apply them to future showtimes without affecting tickets that have already been sold, ensuring strict accounting integrity.

### 3. 🔒 Concurrency Control & Seat Holding
* Solves the **Race Condition** problem when multiple users attempt to book the exact same seat simultaneously.
* **Temporary Seat Locking:** Once a user selects a seat, it is immediately locked (Held state) with a countdown timer for checkout, preventing overbooking and ensuring a fair booking process.

### 4. 🏢 Staff Management & Shift Configuration
* Comprehensive staff account lifecycle management (from blank accounts to fully assigned credentials).
* Categorizes personnel into specific roles (Counter, Check-in, Concession, Multi-tasking) and employment types (Full-time, Part-time, Seasonal).
* Provides the foundational data structure for automated shift scheduling.

### 5. 🍿 Concession & Loyalty Program
* Integrated shopping cart for movie tickets and Food/Beverage combos.
* Built-in mini-CRM: Manages customer profiles, tracks membership tiers, accumulates reward points, and handles promotional redemptions.

## 🛠️ Tech Stack & Architecture

**Frontend:**
* **React.js** (utilizing a standardized `.js` and `.jsx` component structure)
* Modern, responsive, and data-heavy Admin Dashboard UI/UX.

**Backend:**
* **Java 21** / **Spring Boot 3**
* Architecture: RESTful APIs, Service-Oriented Architecture, MVC Pattern.
* ORM: Spring Data JPA (Hibernate).

**Database & Caching:**
* Primary Database: **MySQL**
* Caching & State Management: **Redis** (Optimizes heavy showtime queries and handles temporary seat locking).

**3rd Party Integrations:**
* Online Payment Gateways: Integrated with **PayOS** (QR Code scanning) and a customized **Mock VNPAY** controller for transaction simulation.

*Developed during the On-the-Job Training (OJT) period.*
