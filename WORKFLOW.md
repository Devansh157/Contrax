# 🔄 Contrax — Project Workflow & System Architecture Guide

Welcome to the **Contrax** project workflow guide. This document presents a clear, visual, and comprehensive breakdown of how Contrax operates end-to-end—from user onboarding to AI price prediction, Uber-style location dispatching, HTML5 digital signatures, escrow wallet settlement, and administrative oversight.

---

## 📑 Table of Contents

1. [📌 High-Level Ecosystem Overview](#1--high-level-ecosystem-overview)
2. [📊 Master Contract State Machine](#2--master-contract-state-machine)
3. [🚀 End-to-End User Workflows](#3--end-to-end-user-workflows)
   - [3.1 Phase 1: Authentication & User Onboarding](#31-phase-1-authentication--user-onboarding)
   - [3.2 Phase 2: Client Job Posting & AI Budget Prediction](#32-phase-2-client-job-posting--ai-budget-prediction)
   - [3.3 Phase 3: Sequential Distance Dispatch Engine (Uber-Style)](#33-phase-3-sequential-distance-dispatch-engine-uber-style)
   - [3.4 Phase 4: Offer Acceptance & Digital Signature Escrow](#34-phase-4-offer-acceptance--digital-signature-escrow)
   - [3.5 Phase 5: Work Execution & GPS Route Tracking](#35-phase-5-work-execution--gps-route-tracking)
   - [3.6 Phase 6: Client Verification, Escrow Release & Rating](#36-phase-6-client-verification-escrow-release--rating)
   - [3.7 Phase 7: Admin Oversight & System Audit](#37-phase-7-admin-oversight--system-audit)
4. [📂 Codebase to Workflow Mapping Matrix](#4--codebase-to-workflow-mapping-matrix)
5. [⚡ Local Quickstart & Testing Guide](#5--local-quickstart--testing-guide)

---

## 1. 📌 High-Level Ecosystem Overview

Contrax operates as a real-time, location-aware marketplace connecting three main user roles:

```mermaid
graph TD
    subgraph Users
        Client[🟢 Client]
        Contractor[🔵 Contractor]
        Admin[👑 Admin]
    end

    subgraph Core Platform Engines
        Auth[🔐 Auth & OTP Gateway]
        ML[🤖 AI Price Model]
        Dispatch[📍 Haversine Dispatch Engine]
        SigCanvas[✍️ Digital Canvas Signature]
        Escrow[💰 Escrow Wallet Engine]
    end

    Client -->|1. Register / Verify OTP| Auth
    Client -->|2. Create Job & Request AI Price| ML
    Client -->|3. Trigger Dispatch| Dispatch
    Dispatch -->|4. 60s Timed Offer| Contractor
    Contractor -->|5. Accept Offer| SigCanvas
    Client -->|6. Sign Contract & Lock Funds| Escrow
    Contractor -->|7. Execute & Mark Complete| Client
    Client -->|8. Approve & Release Payout| Escrow
    Admin -->|Oversight & Audits| Users
```

---

## 2. 📊 Master Contract State Machine

Every contract on Contrax follows a strictly enforced state transition lifecycle:

```mermaid
stateDiagram-v2
    [*] --> draft : Client Creates Job Draft
    draft --> searching : Click 'Find Nearest Contractors'
    searching --> offered : Haversine Engine Finds Closest Candidate
    
    offered --> active : Contractor Accepts 60s Offer & Both Parties Sign
    offered --> searching : Contractor Declines or 60s Timeout (Cascades to Next)
    offered --> cancelled : All Candidates Declined / Cancelled by Client
    
    active --> completed : Contractor Marks Work Finished
    completed --> approved : Client Approves & Releases Escrow Payout
    
    approved --> [*] : Contract Closed & Rating Submitted
    cancelled --> [*] : Escrow Refunded (if locked)
```

### 📋 Contract State Reference Table

| Status | State Description | Responsible User | Trigger API Endpoint | Next Possible Status |
| :--- | :--- | :--- | :--- | :--- |
| **`draft`** | Job form filled with category, area (sqft), and optional AI price prediction. | Client | `POST /api/contracts/` | `searching`, `cancelled` |
| **`searching`** | Radar sweep active; Haversine engine scanning online contractors. | System | `POST /api/contracts/{id}/start_matching/` | `offered`, `cancelled` |
| **`offered`** | 60-second offer card active for current nearest contractor candidate. | Contractor | Automatic / Internal Engine | `active`, `searching`, `cancelled` |
| **`active`** | Both parties signed HTML5 Base64 signature canvas; funds locked in escrow. | Both | `POST /api/contracts/{id}/sign_contract/` | `completed`, `cancelled` |
| **`completed`** | Work finished on site; proof submitted. | Contractor | `POST /api/contracts/{id}/complete_work/` | `approved`, `cancelled` |
| **`approved`** | Client verified work; escrow wallet funds transferred to contractor. | Client | `POST /api/contracts/{id}/approve_and_pay/` | Closed (`[*]`) |
| **`cancelled`** | Contract terminated; escrow returned if locked. | Client / Admin | `POST /api/contracts/{id}/cancel/` | Closed (`[*]`) |

---

## 3. 🚀 End-to-End User Workflows

### 3.1 Phase 1: Authentication & User Onboarding

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React 19 Frontend
    participant Backend as Django REST Auth API
    participant Gateway as Dual SMTP / SMS Gateway

    User->>Frontend: Select Role (Client / Contractor) & Method (Email / Phone)
    alt Email OTP Channel
        User->>Frontend: Input Email Address
        Frontend->>Backend: POST /api/auth/send-email-otp/
        Backend->>Gateway: Send 6-Digit Code (Port 465 SSL -> Fallback Port 587 TLS)
        Gateway-->>User: High-Definition HTML Email OTP
        User->>Frontend: Enter OTP Code
        Frontend->>Backend: POST /api/auth/verify-email-otp/
    else SMS OTP Channel
        User->>Frontend: Input Phone Number (+91...)
        Frontend->>Backend: POST /api/auth/send-otp/
        Backend->>Gateway: SMS Provider (Fast2SMS / 2Factor / Twilio)
        Gateway-->>User: 6-Digit SMS OTP
        User->>Frontend: Enter OTP Code
        Frontend->>Backend: POST /api/auth/verify-otp/
    end
    Backend-->>Frontend: Verified Token Issued
    User->>Frontend: Complete Profile & Password Registration
    Frontend->>Backend: POST /api/auth/register/
    Backend-->>Frontend: Auth Tokens + User Object Returned
```

---

### 3.2 Phase 2: Client Job Posting & AI Budget Prediction

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant UI as Client Dashboard
    participant API as Django Backend
    participant ML as RandomForest ML Model

    Client->>UI: Fill Job Details (Category, Area SqFt, Urgency, Sub-service)
    Client->>UI: Click "Predict Fair Budget"
    UI->>API: POST /api/contracts/{id}/predict_price/
    API->>ML: Pass area_sqft, category, dynamic params to contract_amount_model.joblib
    ML-->>API: Predicted Price (e.g. ₹2,450.00)
    API-->>UI: Return AI Fair Budget Recommendation
    Client->>UI: Save / Post Contract Draft
```

---

### 3.3 Phase 3: Sequential Distance Dispatch Engine (Uber-Style)

```mermaid
flowchart TD
    Start[Client Clicks 'Find Nearest Contractors'] --> FetchJob[Get Job Latitude & Longitude]
    FetchJob --> QueryOnline[Query Active Online Contractors matching Specialty]
    QueryOnline --> FilterDeclined[Exclude Contractors in declined_contractor_ids]
    FilterDeclined --> CheckCandidates{Any Online Candidates?}
    
    CheckCandidates -- No --> WaitingState[Set Status = 'searching' / Display Radar Sweep]
    CheckCandidates -- Yes --> CalcDistance[Calculate Haversine Distance d for each candidate]
    
    CalcDistance --> SortDistance[Sort Candidates by Distance Ascending]
    SortDistance --> PickNearest[Select Candidate #1: current_matching_contractor]
    PickNearest --> OfferState[Set Status = 'offered' & Start 60s Timer]
    
    OfferState --> ContractorResponse{Contractor Action within 60s?}
    ContractorResponse -- Accepts --> AcceptFlow[Transition to Signatures & Escrow]
    ContractorResponse -- Declines --> AddDeclined[Add ID to declined_contractor_ids]
    ContractorResponse -- 60s Timeout --> AddDeclined
    AddDeclined --> FilterDeclined
```

> 📐 **Haversine Distance Formula**:
> $$d = 2r \arcsin \left( \sqrt{ \sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_1) \cos(lat_2) \sin^2\left(\frac{\Delta lon}{2}\right) } \right)$$

---

### 3.4 Phase 4: Offer Acceptance & Digital Signature Escrow

```mermaid
sequenceDiagram
    autonumber
    actor Contractor
    actor Client
    participant UI as React Frontend
    participant API as Django Backend
    participant Wallet as Escrow Wallet Engine

    Contractor->>UI: 60s Offer Card Appears -> Click "Accept Offer"
    UI->>API: POST /api/contracts/{id}/respond_offer/ (action="accept")
    API-->>UI: Offer Accepted -> Open Signature Canvas
    
    Client->>UI: Draw Base64 PNG Signature on Canvas
    Contractor->>UI: Draw Base64 PNG Signature on Canvas
    
    UI->>API: POST /api/contracts/{id}/sign_contract/
    API->>Wallet: Verify Client Wallet Balance >= Contract Amount
    API->>Wallet: Deduct Client Balance & Hold Funds in Escrow
    API->>API: Set contract.status = 'active'
    API-->>UI: Contract Signed & Locked Successfully
```

---

### 3.5 Phase 5: Work Execution & GPS Route Tracking

```mermaid
flowchart LR
    subgraph Contractor GPS Tracking
        A[Contractor Toggles Online] --> B[Leaflet Map Renders GPS Route to Job Location]
        B --> C[Perform Job On-Site]
    end

    subgraph Completion Verification
        C --> D[Click 'Mark Work Completed']
        D --> E[POST /api/contracts/id/complete_work/]
        E --> F[Contract Status = 'completed']
        F --> G[Client Notified for Final Inspection]
    end
```

---

### 3.6 Phase 6: Client Verification, Escrow Release & Rating

```mermaid
sequenceDiagram
    autonumber
    actor Client
    actor Contractor
    participant UI as Client Dashboard
    participant API as Django Backend
    participant Escrow as Wallet Engine

    Client->>UI: Inspect Completed Work -> Click "Approve & Release Payment"
    UI->>API: POST /api/contracts/{id}/approve_and_pay/
    API->>Escrow: Move Escrow Balance -> Contractor Wallet Balance
    API->>API: Set status = 'approved'
    API-->>UI: Success Notification
    
    Client->>UI: Submit 1-5 Star Rating & Feedback
    UI->>API: POST /api/reviews/
    
    Note over Contractor,Escrow: Contractor Earnings Withdrawal
    Contractor->>UI: Click "Withdraw Earnings" (min ₹100.00)
    UI->>API: POST /api/auth/wallet/withdraw/
    API->>Escrow: Debit Contractor Wallet & Record Withdrawal Log
```

---

### 3.7 Phase 7: Admin Oversight & System Audit

```mermaid
flowchart TD
    Admin[👑 Admin User] --> Access[Access /admin-dashboard]
    
    Access --> Tool1[👥 User Management]
    Tool1 --> U1[Edit Credentials & Roles]
    Tool1 --> U2[Adjust Wallet Balances]
    Tool1 --> U3[Toggle Status / Delete Account]

    Access --> Tool2[📑 Contract Oversight]
    Tool2 --> C1[Audit Base64 Canvas Signatures]
    Tool2 --> C2[Emergency Status Overrides]
    Tool2 --> C3[Inspect Contract Terms]

    Access --> Tool3[📊 Platform Analytics]
    Tool3 --> A1[System Revenue Metrics]
    Tool3 --> A2[Active vs Completed Contracts]
    Tool3 --> A3[Platform Wallet Liquidity]
```

---

## 4. 📂 Codebase to Workflow Mapping Matrix

To make development and debugging effortless, here is where each workflow step lives in the code:

| Workflow Step | Frontend Component | Django Backend API Endpoint | Backend Model / Service Logic |
| :--- | :--- | :--- | :--- |
| **Authentication & OTP** | [Register.jsx](file:///f:/Sem-4/Project/frontend/src/pages/Register.jsx), [Login.jsx](file:///f:/Sem-4/Project/frontend/src/pages/Login.jsx) | `POST /api/auth/send-email-otp/`<br>`POST /api/auth/verify-email-otp/` | `users/views.py`<br>`users/models.py` |
| **AI Price Prediction** | [CreateContractModal.jsx](file:///f:/Sem-4/Project/frontend/src/components/CreateContractModal.jsx) | `POST /api/contracts/{id}/predict_price/` | [predict.py](file:///f:/Sem-4/Project/ml/predict.py)<br>`contract_amount_model.joblib` |
| **Distance Dispatching** | [RadarSearch.jsx](file:///f:/Sem-4/Project/frontend/src/components/RadarSearch.jsx), [ClientDashboard.jsx](file:///f:/Sem-4/Project/frontend/src/pages/ClientDashboard.jsx) | `POST /api/contracts/{id}/start_matching/`<br>`POST /api/contracts/{id}/respond_offer/` | `find_and_assign_next_contractor()` in [views.py](file:///f:/Sem-4/Project/backend/contracts/views.py) |
| **Canvas Signature Pad** | [SignaturePad.jsx](file:///f:/Sem-4/Project/frontend/src/components/SignaturePad.jsx) | `POST /api/contracts/{id}/sign_contract/` | `client_signature`, `contractor_signature` in [models.py](file:///f:/Sem-4/Project/backend/contracts/models.py) |
| **Escrow Wallet Settlement** | [Navbar.jsx](file:///f:/Sem-4/Project/frontend/src/components/Navbar.jsx), [ClientDashboard.jsx](file:///f:/Sem-4/Project/frontend/src/pages/ClientDashboard.jsx) | `POST /api/contracts/{id}/approve_and_pay/`<br>`POST /api/auth/wallet/` | `wallet_balance` field in `users/models.py` |
| **GPS Route Navigation** | [ContractorDashboard.jsx](file:///f:/Sem-4/Project/frontend/src/pages/ContractorDashboard.jsx) | `POST /api/auth/user/` (GPS Coords Update) | Leaflet GPS Map Component |
| **Admin Control** | [AdminDashboard.jsx](file:///f:/Sem-4/Project/frontend/src/pages/AdminDashboard.jsx) | `GET/PUT/DELETE /api/users/`<br>`GET/PUT /api/contracts/` | `is_staff`, `is_superuser` role permissions |

---

## 5. ⚡ Local Quickstart & Testing Guide

To test the entire workflow on your local machine:

1. **Launch standard project environment**:
   Double click [run_project.bat](file:///f:/Sem-4/Project/run_project.bat) or execute:
   ```cmd
   backend\venv\Scripts\activate
   python backend\manage.py runserver
   ```
   In a separate console:
   ```cmd
   cd frontend
   npm run dev
   ```
2. **Open Application**: Navigate to `http://localhost:5173/` in your web browser.
3. **Simulate Full Flow**:
   - Register as **Client** ➔ Post a job ➔ Predict fair price ➔ Click *Find Nearest Contractors*.
   - In an incognito tab, login as **Contractor** ➔ Toggle *Online* ➔ Accept the 60s offer popup ➔ Sign contract ➔ Mark complete.
   - Switch back to Client tab ➔ Approve work ➔ Escrow funds instantly transfer to Contractor wallet!

---

<div align="center">

**Contrax System Workflow Documentation**  
&copy; 2026 Contrax Inc. All rights reserved.

</div>
