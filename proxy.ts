import authProxy from "@/lib/auth/middleware";

export const config = {
	matcher: ["/((?!_next/|_static/|favicon.ico).*)"],
};

export default authProxy;
