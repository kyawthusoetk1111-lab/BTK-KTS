import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    unoptimized: true, // အစောပိုင်းမှာ image error မတက်အောင် ဒါလေး အရင်သုံးထားပါ
  },
  typescript: {
    // Build ဖြစ်နေတုန်း type error တက်ရင် ခဏကျော်သွားဖို့ (လိုအပ်မှသုံးပါ)
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;
