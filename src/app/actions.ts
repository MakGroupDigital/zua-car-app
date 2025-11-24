"use server";

import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export async function submitContactForm(prevState: any, formData: FormData) {
  const validatedFields = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Here you would typically send an email or save to a database.
    // For this example, we'll just log the data.
    console.log("Contact Form Submitted:");
    console.log(validatedFields.data);

    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      message: "success",
    };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return {
      message: "error",
    };
  }
}
