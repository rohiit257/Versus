# Versus 🆚  
**A Scalable Social Platform to Clear Dilemmas Using Microservices**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)  
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)  
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)  
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)  
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)  
[![BullMQ](https://img.shields.io/badge/BullMQ-FF0000?style=flat-square)](https://docs.bullmq.io/)  
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)  
[![NeonDB](https://img.shields.io/badge/Neon-5B4B8A?style=flat-square)](https://neon.tech/)  
[![Prisma](https://img.shields.io/badge/Prisma-0C344B?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)  
[![Zod](https://img.shields.io/badge/Zod-000000?style=flat-square)](https://zod.dev/)  
[![shadcn/ui](https://img.shields.io/badge/shadcn-ui-8B5CF6?style=flat-square)](https://ui.shadcn.com/)

---

## Project Overview

**Versus** is a modern, **microservice-based social platform** designed to help users make decisions and clear dilemmas. Users can create polls with two options, engage in real-time voting and commenting, and analyze results through a dedicated profile section.  

This project leverages **microservices** to separate core functionalities like authentication, post management, voting, real-time communication, and analytics, ensuring scalability and maintainability.

---

## Features

### User Authentication Service
- Email & password signup/login  
- Email verification  
- Forgot password functionality with NodeMailer  
- JWT-based authentication  

### Post & Voting Service
- Create posts with **two options**  
- Real-time voting and results  
- Timeline to see posts from other users  
- Commenting system using **WebSockets**  

### Analytics & Profile Service
- Track user activity and votes  
- Provide analytics dashboard in profile  
- Rate limiting for APIs  

### Infrastructure
- **Microservices** architecture for scalability  
- **BullMQ + Redis** for background jobs and queues  
- **Docker** for containerization and easy deployment  

---

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| **Frontend** | Next.js, TypeScript, shadcn/ui |
| **Backend**  | Express.js, TypeScript (microservices) |
| **Database** | NeonDB, Prisma |
| **Cache & Queue** | Redis, BullMQ |
| **Realtime** | Socket.IO |
| **Validation** | Zod |
| **Mail Service** | NodeMailer |
| **Containerization** | Docker |

---

## Architecture Overview