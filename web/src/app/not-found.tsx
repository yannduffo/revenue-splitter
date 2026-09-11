import type { Metadata } from "next";
import { MessagePage } from "@/components/MessagePage";

export const metadata: Metadata = {
  title: "Page not found",
};

// 404 page
export default function NotFound() {
  return (
    <MessagePage
      heading="/ 404 "
      message="This page does not exist. The link may be outdated, or the address is not a valid splitter."
    />
  );
}
