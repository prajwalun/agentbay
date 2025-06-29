# AgentBay Frontend

A modern, responsive frontend for AgentBay - a platform where users interact with intelligent AI agents through chat, voice, and file upload.

## 🚀 Features

- **Authentication**: Secure login/signup with JWT tokens
- **Agent Dashboard**: Browse and interact with AI agents
- **Chat Interface**: Real-time messaging with AI agents
- **File Upload**: Drag & drop file uploads for context
- **Voice Input**: Record and transcribe voice messages
- **Custom Agents**: Create personalized AI agents with specific tools
- **Dark Theme**: Beautiful glass morphism design
- **Responsive**: Works seamlessly on mobile, tablet, and desktop

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: React Context
- **API Client**: Fetch API with custom wrapper
- **File Handling**: react-dropzone
- **Themes**: next-themes

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd agentbay-frontend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edit `.env.local` and set your backend API URL:
   \`\`\`env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔌 Backend Integration

This frontend is designed to work with a Python backend that exposes the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login` | POST | User authentication |
| `/signup` | POST | User registration |
| `/agents` | GET | List available agents |
| `/chat` | POST | Send message to agent |
| `/transcribe` | POST | Audio transcription |
| `/upload` | POST | File upload |
| `/custom-agent` | POST | Create custom agent |
| `/credits` | GET | Get user credits |

### Expected API Responses

**Login/Signup Response:**
\`\`\`json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
\`\`\`

**Agents Response:**
\`\`\`json
[
  {
    "id": "agent_1",
    "name": "Data Analyst",
    "description": "Analyzes data and provides insights",
    "tools": ["calculator", "chart_generator"]
  }
]
\`\`\`

**Chat Response:**
\`\`\`json
{
  "message": "AI agent response here"
}
\`\`\`

## 🏗️ Project Structure

\`\`\`
agentbay-frontend/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── chat/              # Chat interface
│   ├── agents/            # Agent management
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── agent-card.tsx    # Agent display card
│   ├── chat-interface.tsx # Main chat component
│   ├── chat-bubble.tsx   # Individual message
│   ├── file-upload.tsx   # File upload component
│   └── voice-input.tsx   # Voice recording
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication state
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
└── hooks/               # Custom hooks
    └── use-toast.ts     # Toast notifications
\`\`\`

## 🎨 Design System

The application uses a custom dark theme with glass morphism effects:

- **Colors**: Dark gradients with blue/purple accents
- **Components**: Glass-effect cards with backdrop blur
- **Typography**: Clean, modern font hierarchy
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

## 🔧 Customization

### Adding New Agent Types

1. Update the `Agent` interface in `lib/api.ts`
2. Modify the `AgentCard` component to display new fields
3. Update the backend integration accordingly

### Styling Changes

- Modify `app/globals.css` for global styles
- Update `tailwind.config.ts` for theme customization
- Edit component-specific styles in individual files

### API Integration

- All API calls are centralized in `lib/api.ts`
- Add new endpoints by extending the `ApiClient` class
- Update environment variables in `.env.local`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

1. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`

2. Start the production server:
   \`\`\`bash
   npm start
   \`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Contact the development team

---

**Note**: This frontend is ready for production use and seamlessly integrates with LangChain-based Python backends. Make sure your backend implements the expected API endpoints for full functionality.
