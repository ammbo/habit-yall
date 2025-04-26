# Habit Y'all

A web application for pairs of users to maintain habits through a tennis/ping-pong style back-and-forth accountability system.

## Features

- **User System**: Simple sign-up/login with email and password
- **Habit Pairing**: Partner with one other person for a habit goal
- **Volley Mechanics**: Take turns completing habits within time windows
- **Streak Tracking**: Count consecutive volleys and track broken streaks
- **Notification System**: Email notifications when it's your turn

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Database**: GibsonAI (MySQL)
- **Authentication**: Iron Session
- **Email**: Resend

## Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with required environment variables (see `.env.local.example`)
4. Run the development server:
   ```
   npm run dev
   ```

## Environment Variables

The following environment variables are required:

```
# Gibson API keys (server-side only)
GIBSON_API_KEY_DEV=your_gibson_dev_key
GIBSON_API_KEY_PROD=your_gibson_prod_key

# Authentication
IRON_SESSION_PASSWORD=complex_password_at_least_32_characters
IRON_SESSION_COOKIE_NAME=habit_yall_session

# Email service (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@habityall.com

# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Database Structure

The application uses a GibsonAI database with the following schema:

- **Users**: User accounts with authentication info
- **Habits**: Habits with creator/partner relationships
- **Volleys**: Individual habit completions with deadlines
- **Notifications**: User notifications for various events

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in Vercel
3. Deploy!

## Security Notes

- All GibsonAI API calls are made server-side to protect API keys
- Passwords are hashed using bcrypt before storage
- Authentication is handled via secure HTTP-only cookies

## License

MIT
