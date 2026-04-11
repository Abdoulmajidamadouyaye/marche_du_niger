import type { ReactNode } from "react";
import { FaFacebookF, FaLinkedinIn, FaTiktok, FaXTwitter } from "react-icons/fa6";
import { socialLinks, type SocialPlatform } from "@/data/social-links";

type SocialLinksProps = {
  className?: string;
  iconClassName?: string;
  variant?: "light" | "dark";
  showLabels?: boolean;
  title?: string;
};

const iconMap: Record<SocialPlatform, ReactNode> = {
  tiktok: <FaTiktok className="h-full w-full" aria-hidden="true" />,
  linkedin: <FaLinkedinIn className="h-full w-full" aria-hidden="true" />,
  facebook: <FaFacebookF className="h-full w-full" aria-hidden="true" />,
  twitter: <FaXTwitter className="h-full w-full" aria-hidden="true" />,
};

const SocialLinks = ({
  className = "",
  iconClassName = "h-4 w-4",
  variant = "light",
  showLabels = false,
  title = "Suivez-nous",
}: SocialLinksProps) => {
  const wrapperClassName = variant === "dark"
    ? "text-gray-300"
    : "text-gray-600";

  const linkClassName = variant === "dark"
    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
    : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:text-emerald-700";

  return (
    <div className={`${wrapperClassName} ${className}`.trim()}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{title}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {socialLinks.map((item) => (
          item.href ? (
            <a
              key={item.platform}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              aria-label={item.label}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${linkClassName}`}
            >
              <span className={iconClassName}>{iconMap[item.platform]}</span>
              {showLabels && <span>{item.label}</span>}
            </a>
          ) : (
            <span
              key={item.platform}
              aria-label={`${item.label} non configure`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium opacity-60 ${linkClassName}`}
            >
              <span className={iconClassName}>{iconMap[item.platform]}</span>
              {showLabels && <span>{item.label}</span>}
            </span>
          )
        ))}
      </div>
    </div>
  );
};

export default SocialLinks;