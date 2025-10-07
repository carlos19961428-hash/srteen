# SRTEEN Social Network

SRTEEN is a social network platform designed for street culture enthusiasts. It features live streaming capabilities, short video content sharing, and multi-language support.

## Features

- **Short Video Feed**: Browse and share short videos showcasing street culture, dance, art, and more
- **Live Streaming**: Watch and host live sessions for skateboarding, breakdancing, and other activities
- **Multi-language Support**: Available in English, Spanish, Portuguese, Chinese, and Arabic
- **User Authentication**: Sign up and login functionality with in-memory user storage
- **Rate Limiting**: Built-in protection against API abuse

## Getting Started

### Prerequisites

- Node.js version 14.0.0 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/carlos19961428-hash/srteen.git
cd srteen
```

2. No additional dependencies are required - the application uses only Node.js built-in modules.

### Running the Application

Start the server:
```bash
npm start
```

Or run directly:
```bash
node social_network/server/server.js
```

The server will start on port 3000 (or the PORT environment variable if set).

### Accessing the Application

Once the server is running, you can access:

- **Main Feed**: http://localhost:3000/
- **Login Page**: http://localhost:3000/login.html
- **Signup Page**: http://localhost:3000/signup.html

## Project Structure

```
srteen/
├── LICENSE                  # Apache 2.0 License
├── README.md               # This file
├── package.json            # Node.js package configuration
├── .gitignore             # Git ignore rules
└── social_network/        # Main application directory
    ├── README.md          # Detailed application documentation
    ├── server/            # Backend API server
    │   └── server.js      # HTTP server with API endpoints
    ├── client/            # Frontend web client
    │   ├── index.html     # Main feed page
    │   ├── main.js        # Client-side JavaScript
    │   ├── login.html     # Login page
    │   └── signup.html    # Signup page
    └── locales/           # Translation files
        ├── en.json        # English
        ├── es.json        # Spanish
        ├── pt.json        # Portuguese
        ├── zh.json        # Chinese
        └── ar.json        # Arabic
```

## API Endpoints

### Translation API
- `GET /api/translations?lang=<code>` - Get translations for a specific language

### Feed API
- `GET /api/feed/shorts` - Get short video feed
- `GET /api/feed/live` - Get live streaming sessions

### Authentication API
- `POST /api/auth/login` - Login with username and password
- `POST /api/auth/signup` - Register a new user

## Technology Stack

- **Backend**: Node.js (native HTTP module)
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Storage**: In-memory (for demo purposes)
- **Rate Limiting**: Custom implementation

## Development

This is a minimal prototype designed to demonstrate the core concepts. For production use, consider:

- Using a proper database (PostgreSQL, MongoDB, etc.)
- Implementing JWT-based authentication
- Adding password hashing (bcrypt)
- Using a framework like Express.js or NestJS
- Converting the frontend to React, Vue, or React Native
- Adding real video streaming capabilities
- Implementing content moderation
- Adding user profiles and social features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Author

carlos19961428-hash
