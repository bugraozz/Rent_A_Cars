yarn dev

# Go Drive - Premium Car Rental Platform

Go Drive is a modern, full-stack car rental web application built with Next.js, React, TypeScript, and PostgreSQL. It provides a seamless experience for both customers and administrators, featuring real-time booking, user management, and a robust admin dashboard.

## Features

- 🚗 **Car Listing & Booking:** Browse, filter, and book cars with real-time availability.
- ⭐ **Dynamic Ratings:** Car ratings are calculated from real user reviews.
- 👤 **Authentication & Roles:** Secure login, registration, JWT-based auth, admin/user roles.
- 🛠️ **Admin Panel:** Manage users, change roles, reset passwords, toggle maintenance mode.
- 📨 **Contact & Messaging:** Users can send messages; admins can view and respond.
- 🛡️ **Maintenance Mode:** Restrict access to admins during maintenance.
- 📊 **Dashboard:** View statistics, user/customer counts, and booking analytics.
- 📱 **Responsive UI:** Modern, mobile-friendly design with shadcn/ui and Tailwind CSS.

## Technologies Used

- **Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend:** Next.js API routes, Node.js
- **Database:** PostgreSQL
- **ORM/DB:** node-postgres (pg)
- **Authentication:** JWT, HttpOnly cookies, bcrypt password hashing
- **UI/UX:** Radix UI, shadcn/ui, custom components
- **Other:** ESLint, Prettier, Sonner (notifications), Formidable (file upload)

## Database Structure

- **PostgreSQL** is used for all persistent data.
- Main tables:
  - `admins`: Admin users (id, username, email, password, role, timestamps)
  - `customers`: Customer users (id, name, email, password, role, etc.)
  - `cars`: Car inventory and details
  - `bookings`: Car reservations
  - `reviews`: User reviews for cars
  - `contact_messages`: User contact/feedback messages
  - `notifications`: User notifications
  - `settings`: App-wide settings (e.g., maintenance mode)

See `admin_setup.sql` for schema and initial data.

## Setup & Installation

1. **Clone the repository:**
	```bash
	git clone https://github.com/bugraozz/go-drive.git
	cd go-drive
	```

2. **Install dependencies:**
	```bash
	npm install
	# or
	yarn install
	```

3. **Configure environment variables:**
	- Create a `.env.local` file and set your database and JWT secret:
	  ```
	  DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/go_drive
	  JWT_SECRET=your-super-secret-jwt-key
	  ```

4. **Set up the database:**
	- Make sure PostgreSQL is running.
	- Run the SQL in `admin_setup.sql` to create tables and a default admin user.

5. **Start the development server:**
	```bash
	npm run dev
	# or
	yarn dev
	```

6. **Access the app:**
	- Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Admin Login

- **Email:** admin@drive.com
- **Password:** admin123

> Change the default password after first login!

## Project Structure

- `src/app/` - Next.js App Router pages (public, admin, auth, etc.)
- `src/components/` - Reusable UI components
- `src/pages/api/` - API routes (auth, admin, cars, contact, etc.)
- `src/lib/` - Database and authentication utilities
- `src/types/` - TypeScript types

## Customization

- **UI:** Easily customizable with Tailwind CSS and shadcn/ui.
- **Database:** Update `src/lib/db.ts` for your own DB credentials.
- **Environment:** Use `.env.local` for secrets and config.

## License

This project is for educational and demonstration purposes.
