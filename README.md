# Taipei Day Trip

Taipei Day Trip is an e-commerce website that allows users to search for and book attractions in Taipei.
<img width="1429" alt="Screenshot 2024-09-16 at 7 20 51 PM" src="https://github.com/user-attachments/assets/91b565da-d734-44de-8cdf-57f91bf04747">
<img width="1353" alt="Screenshot 2024-09-16 at 7 21 20 PM" src="https://github.com/user-attachments/assets/e8b2907f-54a0-477d-b7dc-d03f04546b2f">
<img width="1244" alt="Screenshot 2024-09-16 at 7 22 30 PM" src="https://github.com/user-attachments/assets/25783dd5-d5ed-4d31-a219-5ca2f516a5ec">



## Table of Contents
1. [Project Description](#project-description)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Installation and Setup](#installation-and-setup)
6. [API Documentation](#api-documentation)


## Project Description

Taipei Day Trip is a platform designed to help users discover and book attractions in Taipei. It offers a seamless experience for searching nearby attractions, viewing detailed information, and completing bookings with secure payment processing.

## Key Features

- Search attractions by name, MRT station, or keywords
- View detailed information about attractions
- Book trips and complete payments using TapPay service
- Lazy loading for efficient content delivery
- Scrollable presentation of attraction information
- Carousel display for attraction images

## Tech Stack

### Frontend
- HTML5
- CSS3 (with media queries for RWD)
- JavaScript

### Backend
- Python
- FastAPI
- MySQL
- MVC-style architecture

### Authentication
- JWT (JSON Web Tokens)

### Data Storage/Security
- AWS RDS (MySQL)
- Amazon S3
- AWS CloudFront
- MySQL Connection Pool
- Redis-Cache

### Deployment
- Docker
- Nginx
- AWS-Load Balancer
- AWS-Auto Scaling

## System Architecture

1. **Client**: Users access the system through various devices (mobile, tablet, desktop).
2. **Load Balancing**: AWS Load Balancer distributes traffic across multiple Amazon EC2 instances.
3. **Application Layer**: 
   - Nginx as a reverse proxy server on Amazon EC2 instances
   - Backend services written in Python with FastAPI, providing RESTful APIs for attraction search, booking, and payment processing
   - Containerized with Docker for easy deployment and scaling
4. **Database**: AWS RDS (MySQL) for data storage
5. **Content Delivery**: AWS CloudFront CDN for global content delivery, with static assets stored in Amazon S3

### Installation and Setup
Visit https://taipeidaytrip.vancenomad.life/ to use the application.

## API Documentation
Our application provides a set of RESTful APIs for attraction search, booking management, and payment processing. To explore the available API routes, you can access our API documentation in the following way:
Visit our API documentation page at:
https://taipeidaytrip.vancenomad.life/docs

