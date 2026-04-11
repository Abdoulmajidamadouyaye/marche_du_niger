export type SocialPlatform = "tiktok" | "linkedin" | "facebook" | "twitter";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href?: string;
};

const socialEntries: SocialLink[] = [
  {
    platform: "tiktok",
    label: "TikTok",
    href: process.env.NEXT_PUBLIC_TIKTOK_URL,
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  },
  {
    platform: "facebook",
    label: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  },
  {
    platform: "twitter",
    label: "Twitter",
    href: process.env.NEXT_PUBLIC_TWITTER_URL,
  },
];

export const socialLinks = socialEntries;