import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const actions = {
  login: async ({ request, cookies }) => {
    const form_data = await request.formData();
    const user = form_data.get("name");

    if (!user) {
      return fail(400, { error: "User or choice not set" });
    }

    cookies.set("user", user as string, { path: "/" });
    return redirect(302, "/chooser");
  },
} satisfies Actions;

