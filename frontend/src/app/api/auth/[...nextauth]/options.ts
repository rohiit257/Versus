import CredentialsProvider from "next-auth/providers/credentials"
import NextAuth, { AuthOptions, ISODateString } from "next-auth"
import { JWT } from "next-auth/jwt"
import axios from "axios"



export type customSession = {
    user?: customUser,
    expires: ISODateString
}

export type customUser = {
    id: string
    name: string
    email: string
    token: string
}

export const authOptions: AuthOptions = {
    pages: {
        signIn: "/login"
    },

    callbacks: {
        async session({ session, token }) {
            // Cast session.user to your custom type if needed
            if (token.user) {
                session.user = token.user as any; // or as customUser
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
            }
            return token;
        }
    },

    providers: [
        CredentialsProvider({
            name: 'Credentials',

            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "your-email@example.com"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    const response = await axios.post("https://versus-server-latest.onrender.com/api/auth/v1/login", {
                        email: credentials.email,
                        password: credentials.password
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log("✅ API Login Response:", response.data)

                    const user = response.data.data;

                    if (user && user.id && user.email) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            token: user.token 
                        }
                    }

                    return null;
                } catch (error: any) {
                    console.error("❌ Error in authorize:", error?.response?.data || error.message)
                    return null;
                }
            }

        })
    ],

    session: {
        strategy: 'jwt'
    }
}