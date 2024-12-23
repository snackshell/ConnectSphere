import NextAuth from "next-auth"
import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from 'axios'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          })

          const user = response.data

          if (!user) {
            throw new Error('No user found')
          }

          return user
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Invalid credentials')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.avatar
      }

      // Handle Google sign in
      if (account?.provider === 'google') {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            email: token.email,
            name: token.name,
            picture: token.picture
          })
          token.id = response.data.id
        } catch (error) {
          console.error('Error in Google sign in:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.picture as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions)
