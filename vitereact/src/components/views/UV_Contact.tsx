import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { add_notification } from "@/store/main";
import { Link } from "react-router-dom";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

interface FormStatus {
  status: string;
  message: string;
}

const UV_Contact: React.FC = () => {
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<FormStatus>({
    status: "",
    message: "",
  });

  const dispatch = useDispatch();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const submit_contact_form = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (
      !contactForm.name.trim() ||
      !contactForm.email.trim() ||
      !contactForm.message.trim() ||
      !validateEmail(contactForm.email)
    ) {
      setFormStatus({
        status: "error",
        message: "Please enter a valid name, email, and message.",
      });
      return;
    }

    try {
      const base_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      // Assumed endpoint for contact inquiries
      await axios.post(`${base_url}/api/contact`, contactForm);
      setFormStatus({
        status: "success",
        message: "Your message has been sent successfully.",
      });
      // Dispatch global notification
      dispatch(
        add_notification({
          notification_id: `notif_${Date.now()}`,
          message: "Your message has been sent successfully.",
          type: "success",
          timestamp: new Date().toISOString(),
        })
      );
      // Clear the form fields
      setContactForm({ name: "", email: "", message: "" });
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "An error occurred while sending your message.";
      setFormStatus({ status: "error", message: errorMsg });
      dispatch(
        add_notification({
          notification_id: `notif_${Date.now()}`,
          message: errorMsg,
          type: "error",
          timestamp: new Date().toISOString(),
        })
      );
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Contact Us</h1>
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded p-6">
          {formStatus.message && (
            <div
              className={`mb-4 p-2 text-center rounded ${
                formStatus.status === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {formStatus.message}
            </div>
          )}
          <form onSubmit={submit_contact_form} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={contactForm.name}
                onChange={handleInputChange}
                placeholder="Your Name"
                required
                className="mt-1 block w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={contactForm.email}
                onChange={handleInputChange}
                placeholder="Your Email"
                required
                className="mt-1 block w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                placeholder="Your Message"
                rows={5}
                required
                className="mt-1 block w-full border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
              ></textarea>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring"
              >
                Submit
              </button>
            </div>
          </form>
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4">Other Ways to Contact Us</h2>
            <p className="mb-2">
              <span className="font-bold">Address:</span> 123 AI Blvd, Innovation City, CA 94016
            </p>
            <p className="mb-2">
              <span className="font-bold">Phone:</span> (123) 456-7890
            </p>
            <p className="mb-2">
              <span className="font-bold">Email:</span> info@aistartupchronicles.com
            </p>
            <div className="mt-4">
              <img
                src="https://picsum.photos/seed/contact/600/300"
                alt="Map"
                className="w-full rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Contact;