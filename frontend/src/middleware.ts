export {default} from "next-auth/middleware"

export const config = {
    matcher : ["/timeline","/profile","/post/:path*"]
}