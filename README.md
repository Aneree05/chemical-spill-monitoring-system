# Chemical Spill Monitoring System (Cloud-Integrated)

## 1. Problem Statement

Industrial chemical leaks pose significant risks to human safety and the environment. Traditional monitoring systems are either manual or lack real-time responsiveness. This project simulates a scalable monitoring system capable of ingesting, processing, and visualizing chemical data in near real-time.

---

## 2. Overview

The Chemical Spill Monitoring System is a cloud-integrated application that processes simulated or CSV-based sensor data and presents it on an interactive dashboard. The system is designed with scalability and modularity in mind, making it adaptable to real-world IoT deployments.

---

## 3. System Architecture

### Workflow

1. Sensor Simulator generates chemical data (simulated real-time input)
2. Backend API ingests and processes incoming data
3. Data is stored or processed for visualization
4. Frontend fetches processed data via API
5. Dashboard displays insights and alerts

### Core Components

* **Frontend**: React-based dashboard UI
* **Backend**: API service for data ingestion and processing
* **Sensor Simulator**: Generates real-time or CSV-based data
* **Database**: MongoDB (if used) or structured storage
* **Containerization**: Docker for consistent deployment

---

## 4. Features

* Simulated real-time chemical data generation
* CSV-based data ingestion
* Interactive dashboard for visualization
* Threshold-based alert system
* Modular backend architecture
* Dockerized deployment
* Cloud-ready (AWS compatible)

---

## 5. Project Structure

```
chemical-spill-monitoring-system/
│
├── backend/              # API and data processing
├── frontend/             # React dashboard
├── sensor_simulator/     # Simulated data generator
├── docker/               # Docker configuration files
├── docker-compose.yml    # Multi-container setup
├── run.sh                # Script to start services
├── .gitignore
└── README.md
```

---

## 6. Setup Instructions

### 6.1 Clone Repository

```
git clone https://github.com/Aneree05/chemical-spill-monitoring-system.git
cd chemical-spill-monitoring-system
```

---

### 6.2 Run Using Docker (Recommended)

```
docker-compose up --build
```

This will:

* Start backend service
* Start frontend service
* Initialize required containers

---

### 6.3 Run Manually (Without Docker)

#### Backend

```
cd backend
npm install
npm run dev
```

#### Frontend

```
cd frontend
npm install
npm run dev
```

---

## 7. Cloud Deployment (AWS)

### Deployment Strategy

* Backend deployed on AWS EC2
* Docker used for containerized deployment
* Application designed to scale using Auto Scaling (conceptual implementation)

### AWS Services Used

* EC2: Application hosting
* IAM: Access control
* Auto Scaling: Scalability (design-level)

---

## 8. Scalability & Elasticity

The system is designed to handle increased load by:

* Scaling backend services using containerized deployment
* Supporting Auto Scaling groups in AWS
* Being adaptable to real-time IoT data streams

---

## 9. Future Improvements

* Integration with real IoT sensors
* WebSocket-based real-time updates
* Advanced analytics and visualization
* Alert notifications (email/SMS)
* Load balancer integration for high availability

---

## 10. Contributors

* Aneree Patel (Docker + Backend + Database)
* Naitik Jadav (AWS + Backend)
* Manav Dhorajiya (Frontend + Documentation)

---

## 11. Notes

* Designed for academic and demonstration purposes
* Easily extendable to production-grade systems
* Redeployment required after major
