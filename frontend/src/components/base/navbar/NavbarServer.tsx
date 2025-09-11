import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import NavbarClient from "./NavbarClient";

export default async function NavbarServer() {
  const session = await getServerSession(authOptions);
  //@ts-ignore
  return <NavbarClient user={session?.user} />;
}