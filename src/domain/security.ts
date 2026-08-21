export function safeString(value:unknown,max=1000){return typeof value==="string"?value.trim().slice(0,max):"";}
export function safeId(value:unknown){return /^[A-Za-z0-9_-]{1,128}$/.test(typeof value==="string"?value:"")?value as string:null;}
