import CredentialsProvider from "next-auth/providers/credentials"
import NextAuth, { AuthOptions, ISODateString } from "next-auth"
import { JWT } from "next-auth/jwt"
import axios from "axios"
import { authOptions } from "./options"


const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }