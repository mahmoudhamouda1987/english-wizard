import { cookies } from "next/headers";
import { deleteSession,getSession } from "./auth-repository";
const COOKIE="ew_session";
export async function currentUser(){const c=await cookies();const token=c.get(COOKIE)?.value;if(!token)return null;return getSession(token);}
export async function clearCurrentSession(){const c=await cookies();const token=c.get(COOKIE)?.value;if(token)await deleteSession(token);c.delete(COOKIE);}
export { COOKIE };
