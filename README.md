# DorCall Backend

Backend API for DorCall - Call Center Management System built with TypeScript, Express, Sequelize, and Socket.IO.

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Sequelize with sequelize-typescript
- **Database:** MySQL
- **Real-time:** Socket.IO
- **Authentication:** JWT with Bearer tokens
- **PBX Integration:** Asterisk AMI (optional)

## Features

- 🔐 JWT-based authentication with Bearer tokens
- 👥 User and Agent management
- 📞 Call logging and history
- 💬 SMS messaging system
- 📇 Customer contact management
- 🔴 Real-time updates via WebSocket
- 📊 Call monitoring and analytics
- 🎯 Role-based access control (Agent/Admin)

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- Asterisk PBX (optional, for call functionality)

## Installation

1. **Clone the repository**
   ```bash
   cd dorcall-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual configuration values.

4. **Setup MySQL database**
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE dorcall_db;
   ```

5. **Run database migrations**
   The database tables will be created automatically when you start the server (Sequelize sync).

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start
```

## Project Structure

```
dorcall-be/
├── src/
│   ├── config/
│   │   ├── database.ts      # Sequelize configuration
│   │   └── asterisk.ts      # Asterisk AMI client
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── agentController.ts
│   │   ├── callController.ts
│   │   ├── smsController.ts
│   │   └── contactController.ts
│   ├── middleware/
│   │   └── authMiddleware.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Agent.ts
│   │   ├── CallLog.ts
│   │   ├── SmsLog.ts
│   │   └── CustomerContact.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── agentRoutes.ts
│   │   ├── callRoutes.ts
│   │   ├── smsRoutes.ts
│   │   └── contactRoutes.ts
│   ├── utilities/
│   │   └── generateToken.ts
│   ├── websocket/
│   │   └── websocketHandler.ts
│   └── server.ts            # Application entry point
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Agents
- `GET /api/agents` - Get all agents (protected)
- `GET /api/agents/:id` - Get agent by ID (protected)
- `POST /api/agents` - Create agent (admin only)
- `PUT /api/agents/:id` - Update agent (admin only)
- `DELETE /api/agents/:id` - Delete agent (admin only)
- `PATCH /api/agents/:id/status` - Update agent status (protected)

### Calls
- `POST /api/calls/initiate` - Initiate outbound call (protected)
- `GET /api/calls/history` - Get call history (protected)
- `GET /api/calls/active` - Get active calls (admin only)
- `POST /api/calls/:id/end` - End call (protected)
- `GET /api/calls/:id` - Get call details (protected)

### SMS
- `POST /api/sms/send` - Send SMS message (protected)
- `GET /api/sms/history` - Get SMS history (protected)
- `GET /api/sms/conversations/:phoneNumber` - Get conversation (protected)

### Contacts
- `GET /api/contacts` - Get all contacts (protected)
- `GET /api/contacts/:id` - Get contact by ID (protected)
- `POST /api/contacts` - Create contact (protected)
- `PUT /api/contacts/:id` - Update contact (protected)
- `DELETE /api/contacts/:id` - Delete contact (protected)

## WebSocket Events

### Client to Server
- `join_agent_room` - Join agent-specific room
- `join_admin_room` - Join admin room
- `send_message` - Send SMS message

### Server to Client
- `incoming_call` - Notify incoming call
- `call_started` - Call initiated
- `call_ended` - Call terminated
- `agent_status` - Agent status changed
- `sms_received` - New SMS received

## Database Schema

### Users
- id, username, email, password, role, createdAt, updatedAt

### Agents
- id, name, sipUsername, sipPassword, email, status, createdAt, updatedAt

### CallLogs
- id, customerNumber, callType, callStatus, sipExtension, answerTime, endTime, createdAt, updatedAt

### SmsLogs
- id, agentsId, phoneNumber, message, messageType, deliveryStatus, createdAt, updatedAt

### CustomerContacts
- id, name, phoneNumber, message, createdAt, updatedAt

## Asterisk Integration

Asterisk PBX integration is **optional** and disabled by default. To enable:

1. **Install the Asterisk AMI client**
   ```bash
   npm install asterisk-ami-client
   ```

2. **Uncomment code in** `src/config/asterisk.ts`

3. **Configure Asterisk AMI credentials** in `.env`

4. **Ensure Asterisk AMI is enabled** in `/etc/asterisk/manager.conf`

The system will work without Asterisk - calls will be logged but not processed through PBX.

## Environment Variables

See `.env.example` for all required environment variables.

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens sent via Authorization header (Bearer)
- CORS configured for frontend origin
- Admin-only routes protected by role middleware
- SIP passwords excluded from API responses

## License

Private/Proprietary

## Author

Rod

## Support

For support, contact the development team.
