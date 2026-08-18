# 🚀 Contrax — Smart On-Demand Contractor Marketplace & Digital Contract Platform

<div align="center">

![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)
![Django](https://img.shields.io/badge/Django_REST-4.2+-092E20?style=for-the-badge&logo=django)
![Three.js](https://img.shields.io/badge/Three.js-r174-black?style=for-the-badge&logo=three.js)
![scikit-learn](https://img.shields.io/badge/scikit--learn-AI_ML-F7931E?style=for-the-badge&logo=scikit-learn)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)

**"Gig-Contracts at the Speed of Ride-Hailing"**

An AI-powered, location-aware smart contracting platform that seamlessly connects clients with service contractors in real-time. Features an **Uber-style sequential distance matching engine**, **Random Forest Machine Learning budget estimation**, **HTML5 digital canvas signatures**, **dual-port SMTP email & multi-provider SMS OTP authentication**, and **multimodal 3D interactive glassmorphic dashboards**.

---

</div>

## 📑 Table of Contents

- [✨ Executive Summary](#-executive-summary)
- [🔥 Core Architecture & Innovations](#-core-architecture--innovations)
  - [1. 👥 Multi-Role Enterprise Ecosystem](#1--multi-role-enterprise-ecosystem)
  - [2. 📍 Uber-Style Sequential Distance Dispatch Engine](#2--uber-style-sequential-distance-dispatch-engine)
  - [3. 🤖 AI Machine Learning Price & Matching Engine](#3--ai-machine-learning-price--matching-engine)
  - [4. 🔐 Multi-Factor Verification & SMTP Email Engine](#4--multi-factor-verification--smtp-email-engine)
  - [5. ✍️ Digital Canvas Signatures & Escrow Wallet](#5-️-digital-canvas-signatures--escrow-wallet)
  - [6. 👑 Comprehensive Admin Management Dashboard](#6--comprehensive-admin-management-dashboard)
  - [7. 🎨 3D Interactive & Futuristic Visual Engine](#7--3d-interactive--futuristic-visual-engine)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ Project Directory Structure](#️-project-directory-structure)
- [📡 API Documentation Reference](#-api-documentation-reference)
- [🤖 Machine Learning Model Pipeline](#-machine-learning-model-pipeline)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🚦 Local Quickstart Guide](#-local-quickstart-guide)
- [📱 Complete User Workflows](#-complete-user-workflows)

---

## ✨ Executive Summary

Traditional contract management and gig hiring suffer from manual pricing negotiation, delayed contractor response times, paper contract overhead, and lack of real-time location visibility. **Contrax** eliminates these friction points by bringing **ride-hailing speed and transparency** to the contractor marketplace.

With Contrax:
- **Clients** post jobs and instantly get an AI-predicted budget based on historical contract metrics, trigger location-based contractor dispatch, sign contracts digitally, track contractors on a live map, and manage an integrated escrow wallet.
- **Contractors** toggle live availability, receive 60-second real-time contract dispatch offers, navigate via interactive maps, submit proof of completion, and earn instant wallet payouts.
- **Admins** manage the entire user base, oversee contract lifecycles, configure system roles, inspect digital signatures, and analyze real-time platform metrics.

---

## 🔥 Core Architecture & Innovations

### 1. 👥 Multi-Role Enterprise Ecosystem

- **Client Portal**:
  - Instant job creation across 4 core service categories (*On-Demand Delivery, Home Maintenance & Repair, Freelance & Creative, Professional/Legal*).
  - One-click **AI Price Estimation** before contract creation.
  - Interactive distance radius search & contractor dispatch triggers.
  - Base64 digital canvas signature pad integration.
  - Real-time contractor GPS location tracking on interactive Leaflet maps.
  - Escrow wallet management (Top-Up, Escrow Hold, Approval & Release).

- **Contractor Portal**:
  - Live online/offline status toggle with real-time GPS coordinate broadcasting.
  - **60-Second Timed Offer Cards** with auto-decline and fallback routing.
  - Route navigation visualization from contractor location to job site.
  - Completion proof upload and wallet balance withdrawal (with minimum withdrawal limits).
  - Star ratings and performance history.

- **Admin Oversight Portal**:
  - Total platform revenue, active contracts, wallet balances, completed jobs, and total user metrics.
  - Full CRUD administrative power over all registered users (Role modification, wallet adjustments, profile editing).
  - Global contract oversight with emergency status overrides and audit logs.

---

### 2. 📍 Uber-Style Sequential Distance Dispatch Engine

- **Mathematical Dispatching**: Employs the **Haversine formula** on spherical geographic coordinates to compute the precise physical distance ($d$) between contractor coordinates $(lat_1, lon_1)$ and job coordinates $(lat_2, lon_2)$:

$$d = 2r \arcsin \left( \sqrt{ \sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_1) \cos(lat_2) \sin^2\left(\frac{\Delta lon}{2}\right) } \right)$$

- **Sequential Offer Cascade**:
  1. Finds all active, online contractors matching the requested category/specialty sorted by distance.
  2. Dispatches a **60-second countdown offer** to the closest candidate.
  3. If accepted, contract transitions to `offered` / `active`.
  4. If declined or timed out (60s), candidate ID is added to `declined_contractor_ids` and the offer automatically advances to the next nearest contractor.

---

### 3. 🤖 AI Machine Learning Price & Matching Engine

- **Budget Estimation Model (`contract_amount_model.joblib`)**:
  - Powered by a `RandomForestRegressor` trained on job features including square footage (`area_sqft`), category, duration, urgency priority, and dynamic sub-service attributes.
  - Provides instant fair-market cost predictions to prevent client overpaying or contractor underbidding.

- **Candidate Matcher Model (`contractor_matcher_model.joblib`)**:
  - Evaluates contractor specialty match score, distance weighting, job rating history, and past completion velocity to suggest ideal contractor candidates.

---

### 4. 🔐 Multi-Factor Verification & SMTP Email Engine

- **Dual-Port SMTP Email Gateway**:
  - Integrated email verification using Django's SMTP core & custom SSL/TLS sockets.
  - Direct support for **Gmail SMTP** and enterprise email servers.
  - Implements **dual-port auto-fallback**: Tries **SSL Port 465** first (preventing Windows Firewall `WinError 10054` socket reset errors) and seamlessly falls back to **TLS Port 587**.
  - Sends high-definition HTML emails with vector graphics for 6-digit verification codes and welcome onboarding messages.

- **Multi-Provider SMS OTP Gateway**:
  - Integrated support for **Fast2SMS** (India +91 numbers), **2Factor.in**, and **Twilio** (Global SMS).
  - Gracefully logs SMS dispatch to server console when API keys are unconfigured.

---

### 5. ✍️ Digital Canvas Signatures & Escrow Wallet

- **HTML5 Canvas Signature Engine**:
  - Custom HTML5 drawing surface ([SignaturePad.jsx](file:///f:/Sem-4/Project/frontend/src/components/SignaturePad.jsx)) supporting touch and mouse inputs.
  - Exports crisp PNG Base64 data URLs saved directly to contract model fields (`client_signature`, `contractor_signature`).
  - Supports contract PDF generation and printable legal certificate views.

- **Escrow Wallet Logic**:
  - Prevents fraudulent job cancellation by holding funds in escrow during active contract execution.
  - Payout is automatically transferred to contractor's `wallet_balance` upon client approval.
  - Minimum withdrawal limit enforcement (₹100.00) with transaction validation.

---

### 6. 👑 Comprehensive Admin Management Dashboard

- Located at `/admin-dashboard` ([AdminDashboard.jsx](file:///f:/Sem-4/Project/frontend/src/pages/AdminDashboard.jsx)):
  - **User Management**: View all users, search by name/email/phone, filter by role (*Client, Contractor, Admin*), edit credentials, update wallet balances, change roles, and delete accounts.
  - **Contract Oversight**: Monitor contract statuses, inspect Base64 signatures, change contract stages manually, view assigned contractors, and audit contract terms.
  - **Platform Analytics**: Visual telemetry cards displaying platform metrics and regulatory activity.

---

### 7. 🎨 3D Interactive & Futuristic Visual Engine

- **Three.js & React Three Fiber**:
  - **[ContractorHeroVisualizer.jsx](file:///f:/Sem-4/Project/frontend/src/components/ContractorHeroVisualizer.jsx)**: 3D interactive hero canvas with lighting, dynamic mesh animation, ambient floating geometry, and bloom post-processing.
  - **[CubeMatrixLoader.jsx](file:///f:/Sem-4/Project/frontend/src/components/CubeMatrixLoader.jsx)**: 3D rotating isometric cube matrix for futuristic application loading states.
  - **[Isometric3DGlassAuth.jsx](file:///f:/Sem-4/Project/frontend/src/components/Isometric3DGlassAuth.jsx)**: Glassmorphic 3D floating visualizer embedded on Login & Register views.
  - **[MechanicalToolsBackground.jsx](file:///f:/Sem-4/Project/frontend/src/components/MechanicalToolsBackground.jsx)**: Canvas particle engine rendering rotating gears and mechanical tools.
  - **[RadarSearch.jsx](file:///f:/Sem-4/Project/frontend/src/components/RadarSearch.jsx)**: Ultrasonic radar pulse sweep overlay animation during contractor search.

---

## 🛠️ Technology Stack

| Layer | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, Vite 6, ES Modules | Modern, ultra-fast frontend build tool and component tree |
| **Routing** | React Router v7 | Client-side page routing and layout management |
| **3D & Canvas** | Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` | Interactive 3D graphics, shaders, and post-processing FX |
| **Animations** | Framer Motion, GSAP | Smooth UI transitions, modal reveals, and gesture animations |
| **Geospatial & Maps** | Leaflet, React-Leaflet | Open-source mapping tiles, custom pins, and route visualizers |
| **Design System** | Custom Vanilla CSS (`index.css`) | 120KB+ custom design system with HSL variables, glassmorphism & light/dark mode |
| **Icons** | Lucide React | Modern vector icon set |
| **Backend Core** | Python 3.10+, Django 4.2+ | Robust web application framework and REST backend |
| **API Framework** | Django REST Framework (DRF) | Token authentication, ViewSets, APIViews, serializers |
| **Database** | SQLite 3 (`db.sqlite3`) | Relational local data storage with Django ORM models |
| **Machine Learning** | `scikit-learn`, `joblib`, `pandas`, `numpy` | AI model training, regression pipelines, and candidate match scoring |
| **Email Service** | Python `smtplib`, `ssl` | SMTP email dispatch with SSL 465 / TLS 587 auto-fallback |
| **SMS Service** | Fast2SMS, 2Factor.in, Twilio API | Multi-gateway phone SMS OTP delivery engine |

---

## 🏗️ Project Directory Structure

```text
Contrax Project Root
 ├── backend/                                   # Django REST Framework Backend
 │    ├── config/                               # Project settings & URL routing
 │    │    ├── settings.py                      # Core settings (SMTP credentials, Installed apps, DRF config)
 │    │    ├── urls.py                          # Main API router endpoints
 │    │    └── wsgi.py                          # WSGI web server entry point
 │    ├── users/                                # User Management & Authentication App
 │    │    ├── models.py                        # Custom User, Phone OTP & Email OTP models
 │    │    ├── views.py                         # Auth APIs (Register, Login, SMTP Email OTP, SMS OTP, Admin CRUD)
 │    │    ├── serializers.py                   # User & Auth serializers
 │    │    └── urls.py                          # Auth routes (/api/auth/*)
 │    ├── contracts/                            # Smart Contracts & Dispatch App
 │    │    ├── models.py                        # Contract & Review models with signatures & dispatch fields
 │    │    ├── views.py                         # Contract ViewSet, Haversine dispatch, ML budget prediction
 │    │    ├── serializers.py                   # Contract & Review serializers
 │    │    └── urls.py                          # Contract routes (/api/contracts/*)
 │    ├── db.sqlite3                            # SQLite Database Storage
 │    ├── requirements.txt                      # Backend dependencies
 │    ├── test_recommendations.py               # ML Recommendation test harness
 │    └── update_contractor_specialties.py      # Utility script for contractor profile enrichment
 ├── frontend/                                  # React 19 + Vite Frontend
 │    ├── public/                               # Static favicons & web assets
 │    ├── src/
 │    │    ├── assets/                          # Graphic assets & branding media
 │    │    ├── components/                      # Reusable UI & 3D Components
 │    │    │    ├── Navbar.jsx                  # Navigation header with user state & theme toggle
 │    │    │    ├── SignaturePad.jsx            # Canvas signature drawing pad with Base64 output
 │    │    │    ├── ContractorHeroVisualizer.jsx# 3D interactive hero mesh visualizer
 │    │    │    ├── CubeMatrixLoader.jsx        # 3D isometric cube loader
 │    │    │    ├── Isometric3DGlassAuth.jsx    # 3D glassmorphic auth component
 │    │    │    ├── MechanicalToolsBackground.jsx# Animated tools & gears canvas background
 │    │    │    ├── RegulatoryDataVisualizer.jsx# Interactive admin analytics graph
 │    │    │    ├── DigitalContractIntro.jsx   # 3D interactive contract feature showcase
 │    │    │    ├── RadarSearch.jsx             # Contractor radar search animation
 │    │    │    ├── Logo.jsx                    # Vector SVG Contrax logo
 │    │    │    └── ErrorBoundary.jsx           # React error boundary component
 │    │    ├── pages/                           # Main Application Pages
 │    │    │    ├── HomePage.jsx                # Landing page with 3D elements & quick CTA
 │    │    │    ├── ClientDashboard.jsx         # Client portal for contract creation & map dispatch
 │    │    │    ├── ContractorDashboard.jsx     # Contractor portal with live offers & earnings
 │    │    │    ├── AdminDashboard.jsx          # Admin management suite & user CRUD
 │    │    │    ├── ContractDetails.jsx         # Full contract details, signatures & PDF print view
 │    │    │    ├── Login.jsx                   # Multi-method login page (Email/Phone/User)
 │    │    │    └── Register.jsx                # Multi-role signup page with OTP verification
 │    │    ├── App.jsx                          # Main app router & state providers
 │    │    ├── index.css                        # 120KB+ custom design system CSS
 │    │    └── main.jsx                         # React DOM entry point
 │    ├── package.json                          # Frontend dependencies & NPM scripts
 │    └── vite.config.js                        # Vite bundler configuration
 │ ├── ml/ # Machine Learning scripts and trained models
 │ │ ├── contract_amount_model.joblib # Pre-trained ML Budget Estimator Model
 │ │ ├── contractor_matcher_model.joblib # Pre-trained ML Contractor Matcher Model
 │ │ ├── predict.py # ML prediction evaluation script
 │ │ ├── preprocess_data.py # Dataset preprocessing pipeline
 │ │ ├── train_model.py # Budget estimator model training script
 │ │ └── train_contractor_matcher.py # Matcher model training script
 └── run_project.bat # Single-click batch script for concurrent server startup
```

---

## 📡 API Documentation Reference

### 🔐 Authentication & User Endpoints (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Register a new Client or Contractor account | No |
| `POST` | `/api/auth/login/` | Multi-method login (Password / Email OTP / Phone OTP) | No |
| `POST` | `/api/auth/send-email-otp/` | Trigger 6-digit SMTP verification code email | No |
| `POST` | `/api/auth/verify-email-otp/` | Verify 6-digit email code | No |
| `POST` | `/api/auth/send-otp/` | Trigger 6-digit SMS OTP to mobile number | No |
| `POST` | `/api/auth/verify-otp/` | Verify 6-digit phone SMS OTP | No |
| `GET` | `/api/auth/user/` | Fetch logged-in user profile, role, & wallet balance | **Yes** |
| `POST` | `/api/auth/user/` | Update profile details, online status, or execute wallet Top-Up / Withdrawal | **Yes** |
| `GET` | `/api/auth/admin/users/` | List all platform users (Admin only) | **Yes (Admin)** |
| `POST` | `/api/auth/admin/users/` | Admin update target user role, wallet, credentials, or delete user | **Yes (Admin)** |

---

### 📄 Smart Contracts & Dispatch Endpoints (`/api/contracts/`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/contracts/` | List contracts relevant to authenticated user | **Yes** |
| `POST` | `/api/contracts/` | Create a new contract contract draft | **Yes** |
| `GET` | `/api/contracts/{id}/` | Retrieve full contract details & digital signatures | **Yes** |
| `POST` | `/api/contracts/{id}/predict_price/` | Calculate AI ML estimated budget amount | **Yes** |
| `POST` | `/api/contracts/{id}/start_matching/` | Trigger Haversine sequential distance dispatch | **Yes** |
| `POST` | `/api/contracts/{id}/respond_offer/` | Contractor accept or decline 60s dispatch offer | **Yes** |
| `POST` | `/api/contracts/{id}/sign_contract/` | Submit Base64 canvas digital signature string | **Yes** |
| `POST` | `/api/contracts/{id}/complete_work/` | Contractor submit work completion state | **Yes** |
| `POST` | `/api/contracts/{id}/approve_and_pay/` | Client approve completed job & transfer wallet funds | **Yes** |
| `POST` | `/api/contracts/{id}/add_review/` | Submit star rating (1-5) and feedback review | **Yes** |
| `GET` | `/api/contracts/admin_all/` | Admin endpoint to view all system contracts | **Yes (Admin)** |

---

## 🤖 Machine Learning Model Pipeline

The platform uses two custom machine learning models trained using `scikit-learn`:

### 1. Contract Budget Predictor (`contract_amount_model.joblib`)
- **Objective**: Predicts job pricing based on square footage (`area_sqft`), category, duration, urgency priority, and dynamic attributes.
- **Model Type**: `RandomForestRegressor` (Ensemble Tree Model).
- **Training Script**: [train_model.py](file:///f:/Sem-4/Project/ml/train_model.py)
- **Data Preprocessing**: [preprocess_data.py](file:///f:/Sem-4/Project/ml/preprocess_data.py)

### 2. Contractor Candidate Matcher (`contractor_matcher_model.joblib`)
- **Objective**: Scores contractor availability, specialty overlap, distance decay factor, and rating history to rank candidates.
- **Training Script**: [train_contractor_matcher.py](file:///f:/Sem-4/Project/ml/train_contractor_matcher.py)
- **Testing Utility**: [test_recommendations.py](file:///f:/Sem-4/Project/backend/test_recommendations.py)

#### Re-training Models:
To retrain the machine learning models locally:
```bash
python train_model.py
python train_contractor_matcher.py
```

---

## ⚙️ Environment Configuration

### Backend Credentials (`backend/config/settings.py` or `.env`)

To enable live SMTP Email dispatch and SMS OTP gateways, configure the following variables in `backend/config/settings.py` or via environment variables:

```python
# SMTP Email Setup (Gmail / Custom SMTP)
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your_email@gmail.com'
EMAIL_HOST_PASSWORD = 'your_app_password' # Generated Google App Password

# Real SMS Provider API Keys (Optional - System falls back gracefully to log mode)
FAST2SMS_API_KEY = 'your_fast2sms_key'
TWOFACTOR_API_KEY = 'your_2factor_key'
TWILIO_ACCOUNT_SID = 'your_twilio_sid'
TWILIO_AUTH_TOKEN = 'your_twilio_auth_token'
TWILIO_PHONE_NUMBER = '+1234567890'
```

---

## 🚦 Local Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**

---

### Option A: Automated Single-Click Launch (Windows)

Simply double-click or run the included batch script from the root workspace folder:

```cmd
.\run_project.bat
```

This automatically opens two terminal sessions:
1. Starts Django Backend Server at `http://localhost:8000/` (or your machine IP if you changed `frontend/src/config.js`)
2. Starts React 19 + Vite Frontend Server at `http://localhost:5173/`

---

### Option B: Manual Setup

#### 1. Backend Setup (Django REST Framework)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create a Superuser / Admin account (Optional)
python manage.py createsuperuser

# Start Django development server
python manage.py runserver
```
Backend API will be live at: **`http://localhost:8000/`** (or use your IP and update `frontend/src/config.js`)

---

#### 2. Frontend Setup (React 19 + Vite)

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install NPM packages
npm install

# Start Vite development server
npm run dev
```
Frontend Web Dashboard will be live at: **`http://localhost:5173/`**

---

## 📱 Complete User Workflows

> 💡 **For full sequence diagrams, Mermaid state machines, and API-to-code mapping, read the comprehensive [WORKFLOW.md](file:///f:/Sem-4/Project/WORKFLOW.md) guide.**

### 🟢 Client Journey
1. **Sign Up / Sign In**: Register as a Client. Verify your account via 6-digit email OTP or SMS code.
2. **Explore Landing Page**: Experience interactive 3D hero cards, features, and platform overview.
3. **Create Contract**: Go to **Client Dashboard**, select service category, enter square footage, duration, job title, and description.
4. **AI Price Prediction**: Click **"Predict Fair Budget"** to generate instant ML price estimation.
5. **Start Contractor Matching**: Click **"Find Nearest Contractors"** to activate Haversine sequential distance dispatch.
6. **Sign Contract**: Use the **HTML5 Signature Pad** to draw base64 digital signature.
7. **Track & Pay**: Monitor contractor position on live map. Upon completion approval, release escrow wallet payment and leave a star rating.

---

### 🔵 Contractor Journey
1. **Sign Up**: Register as a Contractor and select your primary specialty (*Plumbing, Electrical, Legal, Delivery, etc.*).
2. **Toggle Availability**: Access **Contractor Dashboard** and turn on **"Online Status"** to broadcast location coordinates.
3. **Receive Dispatch Offer**: Get real-time 60-second offer card popup showing distance, job title, and budget.
4. **Accept & Navigate**: Accept offer, view route to job site on interactive map, and complete work.
5. **Submit & Earn**: Click **"Mark Work Completed"**. Upon client approval, payout lands in your wallet balance. Withdraw funds to your bank anytime.

---

### 🔴 Admin Journey
1. **Login as Admin**: Sign in with an account having admin/superuser privileges.
2. **Access Admin Portal**: Navigate to `/admin-dashboard`.
3. **Manage Users**: Search, filter, edit usernames, emails, phone numbers, wallet balances, or update account roles.
4. **Inspect Contracts**: Review system contracts, audit digital Base64 signatures, and override contract states when necessary.

---

<div align="center">

**Built with ❤️ for Modern Smart Gig Contracting**

&copy; 2026 Contrax Inc. All rights reserved.

</div>
